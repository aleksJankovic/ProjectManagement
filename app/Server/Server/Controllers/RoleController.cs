using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request.Role;
using Server.Models;
using Server.Services.Permission;
using Server.Services.PermissionNotifier;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly LogicTenacityDbContext dbContext;
        private readonly IPermissionService _permissionService;
        private readonly IPermissionNotifier _permissionNotifier;
        
        public RoleController(
            LogicTenacityDbContext dbContext, 
            IPermissionService permissionService,
            IPermissionNotifier permissionNotifier
        )
        {
            this.dbContext = dbContext;
            _permissionService = permissionService;
            _permissionNotifier = permissionNotifier;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await dbContext.Roles.ToListAsync();
            var roleDTOs = roles.Select(r => new RoleDTO
            {
                Id = r.RoleId,
                Name = r.RoleName,
                IsDefault = r.IsDefault,
                IsFallback = r.IsFallback
            }).ToList();

            return Ok(roleDTOs);
        }

        [Authorize]
        [HttpGet("{roleId}")]
        public async Task<IActionResult> GetRoleById(int roleId)
        {
            var role = await dbContext.Roles.FindAsync(roleId);

            if (role == null)
            {
                return NotFound(new { message = "Role with this id does not exist" });
            }

            var roleDTO = new RoleDTO
            {
                Id = role.RoleId,
                Name = role.RoleName,
                IsDefault = role.IsDefault,
                IsFallback = role.IsFallback
            };

            return Ok(roleDTO);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddRole(AddRoleRequest addRoleRequest)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Change global role");

            if (!hasPermission)
            {
                return Forbid();
            }

            var roleExists = await dbContext.Roles.FirstOrDefaultAsync(r => r.RoleName == addRoleRequest.Name);

            if (roleExists != null)
            {
                return BadRequest(new { message = "Role name already taken" });
            }

            var role = new Role
            {
                RoleName = addRoleRequest.Name
            };

            dbContext.Roles.Add(role);
            await dbContext.SaveChangesAsync();

            var roleDTO = new RoleDTO
            {
                Id = role.RoleId,
                Name = role.RoleName,
                IsDefault = role.IsDefault,
                IsFallback = role.IsFallback
            };

            return Ok(roleDTO);
        }

        [Authorize]
        [HttpDelete("{roleId}")]
        public async Task<IActionResult> RemoveRole(int roleId)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Change global role");

            if (!hasPermission)
            {
                return Forbid();
            }

            var role = await dbContext.Roles.FindAsync(roleId);
            if (role == null)
            {
                return NotFound(new { message = "Role with this id does not exist" });
            }

            if(role.IsDefault)
            {
                return BadRequest(new { message = "Cannot delete this role." });
            }

            var members = await dbContext.Members.Where(m => m.RoleId == role.RoleId).ToListAsync();
            var fallbackRole = await dbContext.Roles.FirstOrDefaultAsync(r => r.IsFallback);

            if (fallbackRole == null)
            {
                return NotFound("Fallback role not found");
            }

            foreach (var member in members)
            {
                member.RoleId = fallbackRole.RoleId;
            }

            dbContext.Roles.Remove(role);
            await dbContext.SaveChangesAsync();
            
            foreach (var member in members)
            {
                await _permissionNotifier.UpdatedGlobalPermissions(member.Id);
            }

            return Ok(new { message = "Success." });
        }

        [Authorize]
        [HttpGet("permissions/{roleId}")]
        public async Task<IActionResult> GetPermissionsByRoleId(int roleId)
        {
            var rolePermissions = await dbContext.RolePermissions
                                                .Where(rp => rp.RoleId == roleId)
                                                .Select(rp => rp.Permission)
                                                .ToListAsync();

            // if (rolePermissions == null || rolePermissions.Count == 0)
            // {
            //     return NotFound("Permissions for this role not found.");
            // }

            var permissionDTOs = rolePermissions.Select(p => new PermissionDTO
            {
                PermissionId = p.PermissionId,
                PermissionName = p.PermissionName
            }).ToList();

            return Ok(permissionDTOs);
        }

        [Authorize]
        [HttpPut("{roleId}")]
        public async Task<IActionResult> ChangeRoleName(int roleId, UpdateRoleRequest request)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Change global role");

            if (!hasPermission)
            {
                return Forbid();
            }
            
            var role = await dbContext.Roles.FindAsync(roleId);

            if (role == null)
            {
                return NotFound("Role not found");
            }

            if (role.IsDefault || role.IsFallback)
            {
                return Forbid();
            }
            
            // Check if role name is unique
            if (await dbContext.Roles.AnyAsync(r => r.RoleName == request.Name && r.RoleId != roleId))
            {
                return BadRequest("Role name must be unique");
            }

            // Update role name
            role.RoleName = request.Name;

            await dbContext.SaveChangesAsync();

            var roleDto = new RoleDTO()
            {
                Id = role.RoleId,
                Name = role.RoleName,
                IsDefault = role.IsDefault,
                IsFallback = role.IsFallback
            };

            return Ok(roleDto);
        }

        [Authorize]
        [HttpDelete("{roleId}/permissions/{permissionId}")]
        public async Task<IActionResult> RemovePermissionFromRole(int roleId, int permissionId)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Change global role");

            if (!hasPermission)
            {
                return Forbid();
            }

            var rolePermission = await dbContext.RolePermissions
                .Include(rp => rp.Role)
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);
            
            if (rolePermission == null)
            {
                return NotFound(new { message = "Role permission not found." });
            }

            if (rolePermission.Role.IsDefault || rolePermission.Role.IsFallback)
            {
                return NotFound(new { message = "You can't change permissions of this role" });
            }

            dbContext.RolePermissions.Remove(rolePermission);
            await dbContext.SaveChangesAsync();

            var members = await dbContext.Members
                .Where(m => m.RoleId == roleId)
                .ToListAsync();
            
            foreach (var member in members)
            {
                await _permissionNotifier.UpdatedGlobalPermissions(member.Id);
            }

            return Ok(new { message = "Success." });

        }

        [Authorize]
        [HttpPost("{roleId}/permissions/{permissionId}")]
        public async Task<IActionResult> AddPermissionToRole(int roleId, int permissionId)
        {
            var hasPermission = await _permissionService.HasGlobalPermissionAsync("Change global role");

            if (!hasPermission)
            {
                return Forbid();
            }
            
            var rolePermission = await dbContext.RolePermissions
                .Include(rp => rp.Role)
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);
            
            if (rolePermission != null)
            {
                return Conflict(new { message = "Role already has this permission." });
            }
            
            
            if (rolePermission != null && (rolePermission.Role.IsDefault || rolePermission.Role.IsFallback))
            {
                return NotFound(new { message = "You can't change permissions of this role" });
            }

            var newRolePermission = new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId
            };

            dbContext.RolePermissions.Add(newRolePermission);
            await dbContext.SaveChangesAsync();
            
            var members = await dbContext.Members
                .Where(m => m.RoleId == roleId)
                .ToListAsync();
            
            foreach (var member in members)
            {
                await _permissionNotifier.UpdatedGlobalPermissions(member.Id);
            }

            return Ok(new { message = "Success." });
        }

        [Authorize]
        [HttpGet("{roleId}/Members")]
        public async Task<IActionResult> GetAllMembersWithRole(int roleId)
        {
            var members = await dbContext.Members.Where(m => m.RoleId == roleId).ToListAsync();

            var roleMemberDtos = members.Select(m => new RoleMemberDTO()
            {
                Id = m.Id,
                FirstName = m.FirstName,
                LastName = m.LastName
            });

            return Ok(roleMemberDtos);
        }
    }
}
