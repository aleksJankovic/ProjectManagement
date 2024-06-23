using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DataTransferObjects;
using Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using Server.DataTransferObjects.Request.Auth;
using Server.DataTransferObjects.Request.Member;


namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly LogicTenacityDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(LogicTenacityDbContext dbContext, IConfiguration configuration, IEmailService emailService)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            var member = await _dbContext.Members.Include(m=>m.Role).FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            if (member == null)
            {
                return BadRequest(new { message = "Member with given email not found." });

            }

            if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, member.Password))
            {
                return BadRequest(new { message = "Wrong password" });
            }

            var expireAt = DateTime.UtcNow.AddMinutes(15);
            
            var jwtToken = GenerateJwtToken(member, expireAt);
            var refreshToken = GenerateRefreshToken();

            member.RefreshToken = refreshToken;
            member.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);

            await _dbContext.SaveChangesAsync();
            
            Console.WriteLine($"AUTHORIZATION: Issuing JWT token to member with id {member.Id}");
            
            var memberResponse = new MemberDTO
            {
                Id = member.Id,
                FirstName = member.FirstName,
                LastName = member.LastName,
                Email = member.Email,
                RoleId = member.RoleId,
                DateAdded = member.DateAdded,
                Country = member.Country,
                City = member.City,
                Status = member.Status,
                Github = member.Status,
                Linkedin = member.Linkedin,
                PhoneNumber = member.PhoneNumber,
                DateOfBirth = member.DateOfBirth,
                RoleName = member.Role.RoleName
            };
            
            var authDto = new AuthDTO
            {
                JwtToken = jwtToken,
                JwtTokenExpirationDate = expireAt,
                RefreshToken = refreshToken,
                Member = memberResponse
            };
            
            return Ok(authDto);
        }

        [HttpPost("Refresh")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest refreshTokenRequest)
        {
            var member = await _dbContext.Members.Include(m=>m.Role)
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshTokenRequest.RefreshToken);

            if (member == null)
            {
                Console.WriteLine($"Failed refreshing token invalid member");
                return BadRequest("Invalid refresh token");
            }

            if (member.RefreshTokenExpiresAt != null && DateTime.UtcNow > member.RefreshTokenExpiresAt)
            {
                Console.WriteLine($"Failed refreshing token, token expired");
                return BadRequest("Refresh token has expired");
            }

            var expireAt = DateTime.UtcNow.AddMinutes(15);
            var jwtToken = GenerateJwtToken(member, expireAt);

            // Generate a new refresh token
            var newRefreshToken = GenerateRefreshToken();
            member.RefreshToken = newRefreshToken;
            member.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);

            await _dbContext.SaveChangesAsync();
            
            Console.WriteLine($"AUTHORIZATION: Refreshing JWT token to member with id {member.Id}");

            var memberResponse = new MemberDTO
            {
                Id = member.Id,
                FirstName = member.FirstName,
                LastName = member.LastName,
                Email = member.Email,
                RoleId = member.RoleId,
                DateAdded = member.DateAdded,
                Country = member.Country,
                City = member.City,
                Status = member.Status,
                Github = member.Status,
                Linkedin = member.Linkedin,
                PhoneNumber = member.PhoneNumber,
                DateOfBirth = member.DateOfBirth,
                RoleName = member.Role.RoleName
            };
            
            var authDto = new AuthDTO
            {
                JwtToken = jwtToken,
                JwtTokenExpirationDate = expireAt,
                RefreshToken = newRefreshToken,
                Member = memberResponse
            };
            
            return Ok(authDto);
        }

        private string GenerateJwtToken(Member member, DateTime expireAt)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("Email", member.Email),
                    new Claim("RoleId", member.RoleId.ToString()),
                    new Claim(ClaimTypes.Role, member.Role.RoleName),
                    new Claim("Id", member.Id.ToString())
                }),
                Expires = expireAt, // Token expiration time
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Audience = _configuration["JwtSettings:Audience"],
                Issuer = _configuration["JwtSettings:Issuer"]

            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPasswordRequest(InitiateForgotPasswordRequest initiateForgotPasswordRequest)
        {
            var member = await _dbContext.Members.FirstOrDefaultAsync(m => m.Email == initiateForgotPasswordRequest.Email);

            if (member == null)
            {
                return BadRequest(new { message = "Member with given email not found." });
            }
            
            if (member.PasswordTokenExpiresAt != null && DateTime.UtcNow < member.PasswordTokenExpiresAt)
                
            {
                return BadRequest(new { message = "You already have an ongoing forgot password request." } );
            }

            var passwordToken = Guid.NewGuid().ToString();
            var expiresAt = DateTime.UtcNow.AddHours(1);

            member.PasswordToken = passwordToken;
            member.PasswordTokenExpiresAt = expiresAt;

            await _dbContext.SaveChangesAsync();
            
            var request = new EmailDTO
            {
                To = member.Email,
                Subject = "LogicTenacity - Forgot Password Request",
                Body = $@"
                <p>Hello {member.FirstName} {member.LastName},</p>
                
                <p>You have issued a forgot password request.</p>
                
                <p>You have one hour to reset your password.</p>

                <p><strong>If this wasn't issued by you, please disregard this email.</strong></p>
                
                <a href=""http://localhost:4200/forgot/{member.PasswordToken}"">Click here to reset your password<a/>.
                "
            };


            var result = await _emailService.SendEmail(request);

            if (result) return Ok(new { message = "Check your email on instructions." });
            
            member.PasswordToken = null;
            member.PasswordTokenExpiresAt = null;
            await _dbContext.SaveChangesAsync();

            return BadRequest(new { message = "Failed sending email, try again." } );
        }
        
        [HttpPost("ForgotPassword/Complete")]
        public async Task<IActionResult> CompletedForgetPassword(CompleteForgotPasswordRequest resetPasswordRequest)
        {
            Console.WriteLine("Radi!");
            
            var member = await _dbContext.Members.FirstOrDefaultAsync(m => m.PasswordToken == resetPasswordRequest.PasswordToken);

            if (member == null)
            {
                return BadRequest(new { message = "Invalid password reset token." });
            }

            if (DateTime.UtcNow > member.PasswordTokenExpiresAt)
            {
                return BadRequest(new { message = "Password reset token has expired." });
            }

            member.Password = BCrypt.Net.BCrypt.HashPassword(resetPasswordRequest.NewPassword);

            // Clear password token and expiration
            member.PasswordToken = null;
            member.PasswordTokenExpiresAt = null;
            member.RefreshToken = null;
            member.RefreshTokenExpiresAt = null;
            
            await _dbContext.SaveChangesAsync();
            
            var request = new EmailDTO
            {
                To = member.Email,
                Subject = "LogicTenacity - Changed Password Successfully",
                Body = $@"
                <p>Hello {member.FirstName} {member.LastName},</p>
                
                <p>Your password has been successfully reset. If you did not initiate this action, please contact one of your administrators immediately.</p>
                "
            };
            
            var result = await _emailService.SendEmail(request);

            return Ok(result ? new { message = "Successfully completed password reset." } : new { message = "Failed sending email, but successfully changed password." });
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }
    }
}
