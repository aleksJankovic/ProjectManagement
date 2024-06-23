using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Server.Data;
using Server.DataTransferObjects;
using Server.Models;
using Microsoft.AspNetCore.Authorization;
using Server.DataTransferObjects.Request;
using Server.DataTransferObjects.Request.File;
using Server.Services.File;
using Server.DataTransferObjects.Request.Member;
using Server.DataTransferObjects.Request.Notification;
using Server.Services.Notification;
using Server.Services.Permission;
using Server.Services.PermissionNotifier;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberController : ControllerBase
    {
        private readonly LogicTenacityDbContext _dbContext;
        private readonly IEmailService _emailService;
        private readonly IFileService _fileService;
        private readonly IPermissionService _permissionService;
        private readonly INotificationService _notificationService;
        private readonly IPermissionNotifier _permissionNotifier;

        public MemberController(
            LogicTenacityDbContext dbContext, 
            IEmailService emailService,
            IFileService fileService, 
            IPermissionService permissionService,
            INotificationService notificationService,
            IPermissionNotifier permissionNotifier)
        {
            _dbContext = dbContext;
            _emailService = emailService;
            _fileService = fileService;
            _permissionService = permissionService;
            _notificationService = notificationService;
            _permissionNotifier = permissionNotifier;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetMembers()
        {

            var members = await _dbContext.Members.Include(m => m.Role).ToListAsync();

            var memberDTOs =
                members.Where(m => !m.IsDisabled)
                    .Select(m => new MemberDTO
                    {
                        Id = m.Id,
                        FirstName = m.FirstName,
                        LastName = m.LastName,
                        Email = m.Email,
                        RoleId = m.RoleId,
                        DateAdded = m.DateAdded,
                        Country = m.Country,
                        City = m.City,
                        Status = m.Status,
                        Github = m.Github,
                        Linkedin = m.Linkedin,
                        PhoneNumber = m.PhoneNumber,
                        DateOfBirth = m.DateOfBirth,
                        RoleName = m.Role.RoleName,
                        IsDisabled = m.IsDisabled
                    }).ToList();
            return Ok(memberDTOs);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddMember(AddMemberRequest memberDTO)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Add member");

            if (!hasPermission)
            {
                return Forbid();
            }

            var existingMember = await _dbContext.Members.FirstOrDefaultAsync(m => m.Email == memberDTO.Email);

            if (existingMember != null)
            {
                return Conflict(new { message = "Member with this email already exists." });
            }

            String randomPassword = GenerateRandomPassword(8);
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(randomPassword);

            var role = await _dbContext.Roles.FindAsync(memberDTO.RoleId);

            var member = new Member
            {
                FirstName = memberDTO.FirstName,
                LastName = memberDTO.LastName,
                Email = memberDTO.Email,
                Password = hashedPassword,
                DateAdded = DateTime.Now,
                Role = role
            };

            _dbContext.Members.Add(member);
            await _dbContext.SaveChangesAsync();

            var memberResponse = new MemberDTO
            {
                Id = member.Id,
                FirstName = member.FirstName,
                LastName = member.LastName,
                Email = member.Email,
                RoleId = role.RoleId,
                DateAdded = member.DateAdded,
                Country = member.Country,
                City = member.City,
                Status = member.Status,
                Github = member.Github,
                Linkedin = member.Linkedin,
                PhoneNumber = member.PhoneNumber,
                DateOfBirth = member.DateOfBirth,
                RoleName = role.RoleName,
                IsDisabled = member.IsDisabled
            };

            var request = new EmailDTO
            {
                To = memberDTO.Email,
                Subject = "Welcome to LogicTenacity - Your Account Details",
                Body = $@"
                <p>Hello {memberDTO.FirstName} {memberDTO.LastName},</p>
                
                <p>We are delighted to welcome you to LogicTenacity! Your account has been successfully created, and we're excited to have you on board.</p>
                
                <p>Below are your account details:</p>
                
                <ul>
                    <li><strong>Email:</strong> {memberDTO.Email}</li>
                    <li><strong>Temporary Password:</strong> {randomPassword}</li>
                </ul>
                
                <p>For security reasons, we recommend that you change your password as soon as possible after logging in for the first time. Please follow these steps to set up your new password:</p>
                
                <ol>
                    <li>Visit our website at <a href=""http://softeng.pmf.kg.ac.rs:10141"" target=""_blank"">this link<a/>.</li>
                    <li>Click on the ""Login"" button.</li>
                    <li>Enter your username/email and the temporary password provided above.</li>
                </ol>
                                
                <p>Once again, welcome to the LogicTenacity family! We look forward to working with you.</p>"
            };


            var result = await _emailService.SendEmail(request);

            return !result ? StatusCode(500, "Failed to send welcome email.") : Ok(memberResponse);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMember(int id)
        {
            var member = await _dbContext.Members
                .Include(m => m.Role)
                .FirstOrDefaultAsync(m => m.Id == id);


            if (member == null)
            {
                return NotFound(new { message = "Member not found." });
            }

            var memberDTO = new MemberDTO
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
                Github = member.Github,
                Linkedin = member.Linkedin,
                PhoneNumber = member.PhoneNumber,
                DateOfBirth = member.DateOfBirth,
                RoleName = member.Role.RoleName,
                IsDisabled = member.IsDisabled
            };

            return Ok(memberDTO);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(int id, UpdateMemberRequest memberDTO)
        {
            var member = await _dbContext.Members
                .Include(m => m.Role)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (member == null)
            {
                return NotFound(new { message = "Member not found." });
            }

            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Edit member");
            var isAuthedUser = await _permissionService.IsCurrentUserIdMatchAsync(member.Id);

            if (!isAuthedUser && !hasPermission)
            {
                return Forbid();
            }

            member.FirstName = memberDTO.FirstName;
            member.LastName = memberDTO.LastName;
            member.Country = memberDTO.Country;
            member.City = memberDTO.City;
            member.Status = memberDTO.Status;
            member.Github = memberDTO.Github;
            member.Linkedin = memberDTO.Linkedin;
            member.PhoneNumber = memberDTO.PhoneNumber;
            member.DateOfBirth = memberDTO.DateOfBirth;

            await _dbContext.SaveChangesAsync();


            var updatedMemberDTO = new MemberDTO
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
                Github = member.Github,
                Linkedin = member.Linkedin,
                PhoneNumber = member.PhoneNumber,
                DateOfBirth = member.DateOfBirth,
                RoleName = member.Role.RoleName,
                IsDisabled = member.IsDisabled
            };

            await _permissionNotifier.UpdatedMemberDetails(updatedMemberDTO.Id, false);

            return Ok(updatedMemberDTO);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Deactivate member");

            if (!hasPermission)
            {
                return Forbid();
            }

            var member = await _dbContext.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound(new { message = "Member not found." });
            }

            member.IsDisabled = true;

            //_dbContext.Members.Remove(member);
            await _dbContext.SaveChangesAsync();
            await _permissionNotifier.UpdatedMemberDetails(member.Id, true);
            
            return Ok(new { message = "Success." });

        }

        [Authorize]
        [HttpGet("{id}/Avatar")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvatar(int id)
        {
            var member = await _dbContext.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound(new { message = "Member not found." });
            }


            if (member.AvatarId == null)
            {
                var bytes = await System.IO.File.ReadAllBytesAsync("Files/default_avatar.png");
                var mime = "image/png";

                return File(bytes, mime);
            }
            else
            {
                var (bytes, mime) = await _fileService.GetFileData(member.AvatarId.Value);

                return File(bytes, mime);
            }
        }

        [Authorize]
        [HttpPost("{id}/Avatar")]
        public async Task<IActionResult> PostAvatar(int id, AddFileRequest addFileRequest)
        {
            var member = await _dbContext.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound(new { message = "Member not found." });
            }

            var isAdmin = await _permissionService.HasGlobalPermissionAsync("Edit member");
            var isAuthedUser = await _permissionService.IsCurrentUserIdMatchAsync(member.Id);

            if (!isAuthedUser && !isAdmin)
            {
                return Forbid();
            }

            if (member.AvatarId != null)
            {
                await _fileService.DeleteFile(member.AvatarId.Value);
            }

            var file = await _fileService.PostFileAsync(id, addFileRequest);

            member.AvatarId = file.FileId;
            member.Avatar = file;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Avatar posted successfully." });

        }

        [Authorize]
        [HttpDelete("{id}/Avatar")]
        public async Task<IActionResult> DeleteAvatar(int id)
        {
            var member = await _dbContext.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound(new { message = "Member not found." });
            }

            var isAdmin = await _permissionService.HasGlobalPermissionAsync("Edit member");
            var isAuthedUser = await _permissionService.IsCurrentUserIdMatchAsync(member.Id);

            if (!isAuthedUser && !isAdmin)
            {
                return Forbid();
            }

            if (member.AvatarId == null)
            {
                return NotFound(new { message = "Member avatar not found." });
            }

            await _fileService.DeleteFile(member.AvatarId.Value);
            member.AvatarId = null;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Success." });

        }

        public static string GenerateRandomPassword(int length)
        {
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-_=+";
            StringBuilder password = new StringBuilder();

            byte[] randomBytes = RandomNumberGenerator.GetBytes(length);

            for (int i = 0; i < length; i++)
            {
                password.Append(validChars[randomBytes[i] % validChars.Length]);
            }

            return password.ToString();
        }

        [Authorize]
        [HttpPost("{id}/ChangePassword")]
        public async Task<IActionResult> ChangePassword(int id, PasswordChangeRequest changePasswordRequest)
        {
            var isBearer = await _permissionService.IsCurrentUserIdMatchAsync(id);

            if (!isBearer)
            {
                return BadRequest(new { message = "You don't have permission to do this" });
            }

            var member = await _dbContext.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound(new { message = "Member not found." });
            }

            if (!BCrypt.Net.BCrypt.Verify(changePasswordRequest.OldPassword, member.Password))
            {
                return BadRequest(new { message = "Old password is incorrect" });
            }

            string hashedNewPassword = BCrypt.Net.BCrypt.HashPassword(changePasswordRequest.NewPassword);

            member.Password = hashedNewPassword;

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully." });

        }

        [Authorize]
        [HttpPost("{id}/ChangeEmail")]
        public async Task<IActionResult> ChangeEmail(int id, EmailChangeRequest changeEmailRequest)
        {
            var member = await _dbContext.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound(new { message = "Member not found." });
            }

            var isAdmin = await _permissionService.HasGlobalPermissionAsync("Edit member");

            if (!isAdmin)
            {
                return BadRequest(new { message = "You can only change email if you have edit member permission" });
            }

            var existingMember =
                await _dbContext.Members.FirstOrDefaultAsync(m => m.Email == changeEmailRequest.NewEmail);

            if (existingMember != null)
            {
                return Conflict(new { message = "Email address is already used" });
            }

            member.Email = changeEmailRequest.NewEmail;

            await _dbContext.SaveChangesAsync();
            await _permissionNotifier.UpdatedMemberDetails(member.Id, false);

            return Ok(new { message = "Email changed successfully." });
        }

        [Authorize]
        [HttpGet("{id}/Projects")]
        public async Task<IActionResult> GetMemberProjects(int id)
        {
            var member = await _dbContext.Members
                .Include(m => m.MemberProjects)
                .ThenInclude(pm => pm.Project)
                .ThenInclude(pm => pm.ProjectStatus)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (member == null)
            {
                return NotFound();
            }

            var projects = member.MemberProjects.Select(pm => new ProjectDTO
            {
                ProjectId = pm.ProjectId,
                ProjectName = pm.Project.ProjectName,
                Deadline = pm.Project.Deadline,
                ProjectDescription = pm.Project.ProjectDescription,
                ProjectStatusId = pm.Project.ProjectStatusId,
                Status = pm.Project.ProjectStatus.Status,
                StartDate = pm.Project.StartDate
            }).ToList();

            return Ok(projects);
        }

        [Authorize]
        [HttpPut("{id}/ChangeRole")]
        public async Task<IActionResult> ChangeMembersRole(int id, RoleChangeRequest request)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Edit member");

            if (!hasPermission)
            {
                return BadRequest(new { message = "You don't have the permission to change someones role" });
            }

            var member = await _dbContext.Members.FirstOrDefaultAsync(m => m.Id == id);

            if (member == null)
            {
                return NotFound(new { message = "Member with given id doesn't exist" });
            }

            if (member.Email == "admin@logictenacity.com")
            {
                return BadRequest(new { message = "Cannot change the role of the main administrator" });
            }

            var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.RoleId == request.RoleId);

            if (role == null)
            {
                return NotFound(new { message = "Role with given id doesn't exist" });
            }

            if (member.RoleId == role.RoleId)
            {
                return BadRequest(new { message = "Member already has that role" });
            }

            member.RoleId = role.RoleId;

            await _dbContext.SaveChangesAsync();

            var roleDTO = new RoleDTO
            {
                Id = role.RoleId,
                Name = role.RoleName,
                IsDefault = role.IsDefault,
                IsFallback = role.IsFallback
            };

            SendNotificationRequest sendNotificationRequest = new SendNotificationRequest
            {
                Title = "Your role got changed!",
                Description = "Your new role was set to " + roleDTO.Name,
                MemberId = member.Id
            };

            await _notificationService.SendNotification(sendNotificationRequest);
            await _permissionNotifier.UpdatedGlobalPermissions(id);
            await _permissionNotifier.UpdatedMemberDetails(member.Id, false);

            return Ok(roleDTO);
        }

        [HttpPost("{id}/ForcePasswordReset")]
        public async Task<IActionResult> PasswordReset(int id)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Edit member");

            if (!hasPermission)
            {
                return BadRequest(new { message = "You don't have permission to do this" });
            }

            var member = await _dbContext.Members.FirstOrDefaultAsync(m => m.Id == id);

            if (member == null)
            {
                return BadRequest(new { message = "Member not found" });
            }

            var generatedPassword = GenerateRandomPassword(6);

            member.Password = BCrypt.Net.BCrypt.HashPassword(generatedPassword);
            member.RefreshToken = null;
            member.RefreshTokenExpiresAt = null;
            member.PasswordToken = null;
            member.PasswordTokenExpiresAt = null;

            await _dbContext.SaveChangesAsync();

            var request = new EmailDTO
            {
                To = member.Email,
                Subject = "LogicTenacity - An administrator reset your password",
                Body = $@"
                <p>Hello {member.FirstName} {member.LastName},</p>
                
                <p>It seems that an administrator has reset your password.</p>
                
                <p>Below is your new temporary password:</p>
                
                <ul>
                    <li><strong>Temporary Password:</strong> {generatedPassword}</li>
                </ul>
                
                <p>For security reasons, we recommend that you change your password as soon as possible after logging in for the first time. Please follow these steps to set up your new password:</p>
                
                <ol>
                    <li>Visit our website at <a href=""http://localhost:4200"" target=""_blank"">this link<a/>.</li>
                    <li>Click on the ""Login"" button.</li>
                    <li>Enter your username/email and the temporary password provided above.</li>
                </ol>
                                
                <p>Once again, welcome to the LogicTenacity family! We look forward to working with you.</p>"
            };

            var result = await _emailService.SendEmail(request);
            
            await _permissionNotifier.UpdatedMemberDetails(member.Id, true);

            return Ok(new { message = "Successfully reset password" });
        }

        [Authorize]
        [HttpGet("{memberId}/Notifications")]
        public async Task<IActionResult> GetNotifications(int memberId)
        {
            var isBearer = await _permissionService.IsCurrentUserIdMatchAsync(memberId);

            if (!isBearer)
            {
                return BadRequest(new { message = "You are not allowed to do this" });
            }

            var member = await _dbContext.Members.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest(new { message = "Member does not exist with given id" });
            }

            var notifications = await _dbContext.Notifications.Where(n => n.MemberId == memberId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            var notificationDtos = notifications.Select(n => new NotificationDTO
            {
                Id = n.Id,
                Title = n.Title,
                Description = n.Description,
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            });

            return Ok(notificationDtos);
        }
    
        [Authorize]
        [HttpPut("{memberId}/Notifications")]
        public async Task<IActionResult> ReadNotifications(int memberId, ReadNotificationsRequest request)
        {
            var isBearer = await _permissionService.IsCurrentUserIdMatchAsync(memberId);

            if (!isBearer)
            {
                return BadRequest(new { message = "You are not allowed to do this" });
            }

            var member = await _dbContext.Members.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest(new { message = "Member does not exist with given id" });
            }

            var notifications = await _dbContext.Notifications
                .Where(n => n.MemberId == memberId && request.NotificationIds.Contains(n.Id))
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _dbContext.SaveChangesAsync();

            return Ok();
        }
        
        [Authorize]
        [HttpPost("{memberId}/Notifications")]
        public async Task<IActionResult> DeleteNotifications(int memberId, DeleteNotificationsRequest request)
        {
            var isBearer = await _permissionService.IsCurrentUserIdMatchAsync(memberId);

            if (!isBearer)
            {
                return BadRequest(new { message = "You are not allowed to do this" });
            }

            var member = await _dbContext.Members.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest(new { message = "Member does not exist with given id" });
            }

            var notifications = await _dbContext.Notifications
                .Where(n => n.MemberId == memberId && request.NotificationIds.Contains(n.Id))
                .ToListAsync();

            _dbContext.Notifications.RemoveRange(notifications);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }

        [Authorize]
        [HttpGet("{memberId}/CheckIfExists")]
        public async Task<ActionResult<bool>> CheckIfExists(int memberId)
        {
            return Ok(
                await _dbContext.Members.AnyAsync(m => m.Id == memberId)
            );
        }
        
        [Authorize]
        [HttpGet("{memberId}/HasEditAccess")]
        public async Task<ActionResult<bool>> CheckIfCanEdit(int memberId)
        {
            return Ok(
                await _dbContext.Members.AnyAsync(m => m.Id == memberId) &&
                (
                    await _permissionService.IsCurrentUserIdMatchAsync(memberId) ||
                    await _permissionService.HasGlobalPermissionAsync("Edit member")
                )
            );
        }
        
        
        [Authorize]
        [HttpGet("{memberId}/GetGlobalPermissions")]
        public async Task<IActionResult> SendPermissions(int memberId)
        {
            var member = await _dbContext.Members.FirstOrDefaultAsync(m => m.Id == memberId);

            if (member == null)
            {
                return BadRequest(new { message = "Member not found with given id" });
            }

            if (!await _permissionService.IsCurrentUserIdMatchAsync(memberId))
            {
                return BadRequest(new { message = "No permission to do this" });
            }

            var permissions = await _dbContext.RolePermissions
                .Where(rp => rp.RoleId == member.RoleId)
                .ToListAsync();
            
            return Ok(permissions.Select(p => p.PermissionId));
        }

        [Authorize]
        [HttpGet("{memberId}/GetProjectPermissions")]
        public async Task<IActionResult> SendProjectPermissions(int memberId)
        {
            // Check if the current user has permission to view the projects
            if (!await _permissionService.IsCurrentUserIdMatchAsync(memberId))
            {
                return BadRequest(new { message = "No permission to do this" });
            }

            // Fetch project roles and their associated permissions in a single query
            var memberProjectRoles = await _dbContext.MemberProjects
                .Where(mp => mp.MemberId == memberId)
                .Select(mp => new
                {
                    mp.ProjectId,
                    Permissions = mp.ProjectRole.ProjectRolePermissions.Where(prp => prp.ProjectRoleId == mp.ProjectRoleId).Select(prp => prp.ProjectPermissionId).ToList()
                })
                .ToListAsync();
            
            // Group the permissions by project role ID and build the response
            var response = memberProjectRoles
                .GroupBy(mpr => mpr.ProjectId)
                .ToDictionary(
                    g => g.Key,
                    g => g.SelectMany(mpr => mpr.Permissions).Distinct().ToList()
                );

            return Ok(response);
        }

        [Authorize]
        [HttpGet("{memberId}/GetProjectTasks")]
        public async Task<IActionResult> SendProjectTasks(int memberId)
        {
            if (!await _permissionService.IsCurrentUserIdMatchAsync(memberId))
            {
                return BadRequest(new { message = "No permission to do this" });
            }

            var memberProjectTasks = await _dbContext.MemberTasks
                .Where(mt => mt.MemberId == memberId)
                .Select(mt => new
                {
                    mt.Task.ProjectId,
                    mt.TaskId
                })
                .ToListAsync();
            

            var response = memberProjectTasks
                .GroupBy(mpt => mpt.ProjectId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(mpt => mpt.TaskId).Distinct().ToList()
                );

            return Ok(response);
        }
    }
}
