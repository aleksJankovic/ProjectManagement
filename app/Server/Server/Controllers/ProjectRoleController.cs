using System.ComponentModel.Design.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using Microsoft.EntityFrameworkCore;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request.Role;
using Server.Models;

namespace Server.Controllers;

public partial class ProjectController
{
    [HttpGet("Permissions")]
    public async Task<IActionResult> GetAllPermissions()
    {
        var permissions = await dbContext.ProjectPermissions.ToListAsync();

        var permissionDto = permissions.Select(p => new PermissionDTO
        {
            PermissionId = p.Id,
            PermissionName = p.Name
        }).ToList();
        
        return Ok(permissionDto);
    }

    [HttpGet("{projectId}/Roles")]
    public async Task<IActionResult> GetAllRolesFromProject(int projectId)
    {
        var roles = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId)
            .Include(ppr => ppr.ProjectRole)
                .ThenInclude(pr => pr.ProjectRolePermissions)
                    .ThenInclude(prp => prp.ProjectPermission)
            .ToListAsync();

        if (roles.Count == 0)
        {
            return BadRequest(new { message = "Project with given id not found!" });
        }
        
        var roleDto = roles.Select(r => new RoleDTO
        {
            Id = r.ProjectRole.Id,
            Name = r.ProjectRole.Name,
            IsDefault = r.ProjectRole.IsDefault,
            IsFallback = r.ProjectRole.IsFallback,
            PermissionList = r.ProjectRole.ProjectRolePermissions.Select(prp => new PermissionDTO
            {
                PermissionId = prp.ProjectPermission.Id,
                PermissionName = prp.ProjectPermission.Name
            }).ToList()
        }).ToList();

        return Ok(roleDto);
    }
    
    [HttpGet("{projectId}/Roles/{roleId}")]
    public async Task<IActionResult> GetAllRolesFromProject(int projectId, int roleId)
    {
        var role = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId && ppr.ProjectRoleId == roleId)
            .Include(ppr => ppr.ProjectRole)
                .ThenInclude(pr => pr.ProjectRolePermissions)
                    .ThenInclude(prp => prp.ProjectPermission)
            .FirstOrDefaultAsync();

        if (role == null)
        {
            return BadRequest(new { message = "Either project not found, or role is not a part of project with given id!" });
        }

        var roleDto = new RoleDTO
        {
            Id = role.ProjectRole.Id,
            Name = role.ProjectRole.Name,
            IsDefault = role.ProjectRole.IsDefault,
            IsFallback = role.ProjectRole.IsFallback,
            PermissionList = role.ProjectRole.ProjectRolePermissions.Select(prp => new PermissionDTO
            {
                PermissionId = prp.ProjectPermission.Id,
                PermissionName = prp.ProjectPermission.Name
            }).ToList()
        };

        return Ok(roleDto);
    }

    [HttpPost("{projectId}/Roles")]
    public async Task<IActionResult> AddRoleToProject(int projectId, AddRoleRequest addRoleRequest)
    {
        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change project role");

        if (!hasPermission)
        {
            return Forbid();
        }
        
        var project = await dbContext.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);

        if (project == null)
        {
            return BadRequest(new { message = "Project with given id not found" });
        }

        var roleExists = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId)
            .Include(ppr => ppr.ProjectRole)
            .Where(ppr => ppr.ProjectRole.Name == addRoleRequest.Name)
            .FirstOrDefaultAsync();

        if (roleExists != null)
        {
            return BadRequest(new { message = "Project role with given name already exists" });
        }

        var role = new ProjectRole
        {
            Name = addRoleRequest.Name
        };

        dbContext.ProjectRoles.Add(role);
        await dbContext.SaveChangesAsync();

        var ppr = new ProjectProjectRole
        {
            ProjectId = projectId,
            ProjectRoleId = role.Id
        };

        dbContext.ProjectProjectRoles.Add(ppr);
        await dbContext.SaveChangesAsync();

        var roleDto = new RoleDTO
        {
            Id = role.Id,
            Name = role.Name,
            IsDefault = role.IsDefault,
            IsFallback = role.IsFallback,
            PermissionList = new List<PermissionDTO>()
        };

        return Ok(roleDto);
    }

    [HttpDelete("{projectId}/Roles/{roleId}")]
    public async Task<IActionResult> DeleteRoleFromProject(int projectId, int roleId)
    {
        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change project role");

        if (!hasPermission)
        {
            return Forbid();
        }
        
        var projectRole = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId && ppr.ProjectRoleId == roleId)
            .FirstOrDefaultAsync();

        if (projectRole == null)
        {
            return BadRequest(new
                { message = "Either project not found, or role is not a part of project with given id!" });
        }

        var role = await dbContext.ProjectRoles.FirstOrDefaultAsync(r => r.Id == roleId);
        
        if (role == null || role.IsDefault || role.IsFallback)
        {
            return BadRequest(new { message = "Can't delete this role!" });
        }
        
        var fallbackRole = await dbContext.Roles.FirstOrDefaultAsync(r => r.IsFallback);

        if (fallbackRole == null)
        {
            return NotFound("Fallback role not found");
        }

        var members = await dbContext.Members
            .Include(m => m.MemberProjects
                .Where(mp => mp.ProjectId == projectId && mp.ProjectRoleId == roleId))
            .ToListAsync();
        
        foreach (var project in members.SelectMany(member => member.MemberProjects))
        {
            project.ProjectRoleId = fallbackRole.RoleId;
        }

        dbContext.ProjectProjectRoles.Remove(projectRole);
        dbContext.ProjectRoles.Remove(role);

        await dbContext.SaveChangesAsync();
        
        foreach (var member in members)
        {
            await _permissionNotifier.UpdatedProjectPermissions(projectId, member.Id);
        }

        return Ok(new { message = "Successfully removed role" });
    }
    
    [HttpPut("{projectId}/Roles/{roleId}")]
    public async Task<IActionResult> ChangeRoleName(int projectId, int roleId, UpdateRoleRequest request)
    {
        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change project role");

        if (!hasPermission)
        {
            return Forbid();
        }
        
        var projectRole = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId && ppr.ProjectRoleId == roleId)
            .Include(ppr => ppr.ProjectRole)
                .ThenInclude(pr => pr.ProjectRolePermissions)
                    .ThenInclude(prp => prp.ProjectPermission)
            .FirstOrDefaultAsync();
        
        if (projectRole == null)
        {
            return NotFound("Role not found");
        }

        var role = projectRole.ProjectRole;

        if (role.IsDefault || role.IsFallback)
        {
            return BadRequest(new { message = "You can't edit this role" });
        }
            
        var roleExists = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId)
            .Include(ppr => ppr.ProjectRole)
            .Where(ppr => ppr.ProjectRoleId != roleId && ppr.ProjectRole.Name == request.Name)
            .FirstOrDefaultAsync();
        
        // Check if role name is unique
        if (roleExists != null)
        {
            return BadRequest("Role name must be unique");
        }

        // Update role name
        role.Name = request.Name;

        await dbContext.SaveChangesAsync();

        var roleDto = new RoleDTO()
        {
            Id = role.Id,
            Name = role.Name,
            IsDefault = role.IsDefault,
            IsFallback = role.IsFallback,
            PermissionList = role.ProjectRolePermissions.Select(prp => new PermissionDTO
            {
                PermissionId = prp.ProjectPermission.Id,
                PermissionName = prp.ProjectPermission.Name
            }).ToList()
        };

        return Ok(roleDto);
    }
    
    [HttpPost("{projectId}/Roles/{roleId}/Permissions/{permissionId}")]
    public async Task<IActionResult> AddPermissionToRole(int projectId, int roleId, int permissionId)
    {
        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change project role");

        if (!hasPermission)
        {
            return Forbid();
        }
        
        var projectRole = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId && ppr.ProjectRoleId == roleId)
            .Include(ppr => ppr.ProjectRole)
            .FirstOrDefaultAsync();

        if (projectRole == null)
        {
            return BadRequest(new { message = "Either project with given id or role with given id does not exist "} );
        }

        var role = projectRole.ProjectRole;

        if (role.IsDefault || role.IsFallback)
        {
            return BadRequest(new { message = "You can't modify this project role" });
        }

        var permission = await dbContext.ProjectPermissions
            .FirstOrDefaultAsync(rp => rp.Id == permissionId);

        if (permission == null)
        {
            return BadRequest(new { message = "Permission with given id not found" });
        }
        
        var rolePermission = await dbContext.ProjectRolePermissions
            .FirstOrDefaultAsync(prp => prp.ProjectRoleId == roleId && prp.ProjectPermissionId == permissionId);
            
        if (rolePermission != null)
        {
            return Conflict(new { message = "Role already has this permission." });
        }
        
        
        var newRolePermission = new ProjectRolePermission
        {
            ProjectRoleId = roleId,
            ProjectPermissionId = permissionId
        };
        
        var members = await dbContext.MemberProjects
            .Where(mp => mp.ProjectId == projectId && mp.ProjectRoleId == roleId)
            .Select(mp => mp.MemberId)
            .ToListAsync();

        dbContext.ProjectRolePermissions.Add(newRolePermission);
        await dbContext.SaveChangesAsync();
        
        foreach (var member in members)
        {
            await _permissionNotifier.UpdatedProjectPermissions(projectId, member);
        }

        return Ok(new { message = "Success." });
    }
    
    [HttpDelete("{projectId}/Roles/{roleId}/Permissions/{permissionId}")]
    public async Task<IActionResult> RemovePermissionFromRole(int projectId, int roleId, int permissionId)
    {
        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change project role");

        if (!hasPermission)
        {
            return Forbid();
        }
        
        var projectRole = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId && ppr.ProjectRoleId == roleId)
            .Include(ppr => ppr.ProjectRole)
            .FirstOrDefaultAsync();

        if (projectRole == null)
        {
            return BadRequest(new { message = "Either project with given id or role with given id does not exist "} );
        }

        var role = projectRole.ProjectRole;

        if (role.IsDefault || role.IsFallback)
        {
            return BadRequest(new { message = "You can't modify this project role" });
        }

        var permission = await dbContext.ProjectPermissions
            .FirstOrDefaultAsync(rp => rp.Id == permissionId);

        if (permission == null)
        {
            return BadRequest(new { message = "Permission with given id not found" });
        }
        
        var rolePermission = await dbContext.ProjectRolePermissions
            .FirstOrDefaultAsync(prp => prp.ProjectRoleId == roleId && prp.ProjectPermissionId == permissionId);
            
        if (rolePermission == null)
        {
            return Conflict(new { message = "Role doesn't have this permission." });
        }

        var members = await dbContext.MemberProjects
            .Where(mp => mp.ProjectId == projectId && mp.ProjectRoleId == roleId)
            .Select(mp => mp.MemberId)
            .ToListAsync();
        
        dbContext.ProjectRolePermissions.Remove(rolePermission);
        await dbContext.SaveChangesAsync();
        
        foreach (var member in members)
        {
            await _permissionNotifier.UpdatedProjectPermissions(projectId, member);
        }

        return Ok(new { message = "Success." });
    }
    
    [Authorize]
    [HttpGet("{projectId}/Roles/{roleId}/Members")]
    public async Task<IActionResult> GetAllMembersWithRole(int projectId, int roleId)
    {
        var members = await dbContext.MemberProjects
            .Where(mp => mp.ProjectId == projectId && mp.ProjectRoleId == roleId)
            .Include(mp => mp.Member)
            .ToListAsync();

        var roleMemberDtos = members.Select(m => new RoleMemberDTO()
        {
            Id = m.Member.Id,
            FirstName = m.Member.FirstName,
            LastName = m.Member.LastName
        });

        return Ok(roleMemberDtos);
    }

    [Authorize]
    [HttpPut("{projectId}/Members/{memberId}/Roles/{roleId}")]
    public async Task<IActionResult> ChangeMemberRole(int projectId, int memberId, int roleId)
    {
        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Add member to project");

        if (!hasPermission)
        {
            return Forbid();
        }
        
        var projectRole = await dbContext.ProjectProjectRoles
            .Where(ppr => ppr.ProjectId == projectId && ppr.ProjectRoleId == roleId)
            .Include(ppr => ppr.ProjectRole)
            .FirstOrDefaultAsync();

        if (projectRole == null)
        {
            return BadRequest(new { message = "Either project with given id or role with given id does not exist "} );
        }

        var memberProject = await dbContext.MemberProjects
            .Where(mp => mp.ProjectId == projectId && mp.MemberId == memberId)
            .FirstOrDefaultAsync();

        if (memberProject == null)
        {
            return BadRequest(new { message = "Either member not assigned to project or not found" });
        }

        memberProject.ProjectRoleId = roleId;
        await dbContext.SaveChangesAsync();
        await _permissionNotifier.UpdatedProjectPermissions(projectId, memberId);

        return Ok();
    }
    
}