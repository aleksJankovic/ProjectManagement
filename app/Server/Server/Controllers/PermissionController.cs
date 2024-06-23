using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request;
using Server.DataTransferObjects.Request.Permission;
using Server.Models;
using Server.Services.Permission;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly LogicTenacityDbContext dbContext;
        private readonly IPermissionService _permissionService;

        public PermissionController(LogicTenacityDbContext dbContext, IPermissionService permissionService)
        {
            this.dbContext = dbContext;
            _permissionService = permissionService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetPermissions()
        {
            if (!await _permissionService.HasGlobalPermissionAsync("Change global role"))
            {
                return Forbid();
            }

            var permissions = await dbContext.Permissions.ToListAsync();
            var permissionDTOs = permissions.Select(p => new PermissionDTO
            {
                PermissionId = p.PermissionId,
                PermissionName = p.PermissionName
            }).ToList();

            return Ok(permissionDTOs);
        }

        [Authorize]
        [HttpGet("{permissionId}")]
        public async Task<IActionResult> GetPermissionById(int permissionId)
        {
            if (!await _permissionService.HasGlobalPermissionAsync("Change global role"))
            {
                return Forbid();
            }
            var permission = await dbContext.Permissions.FindAsync(permissionId);

            if (permission == null)
            {
                return NotFound(new { message = "Permission with this id does not exist" });
            }

            var permissionDTO = new PermissionDTO
            {
                PermissionId = permission.PermissionId,
                PermissionName = permission.PermissionName
            };

            return Ok(permissionDTO);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddPermission(AddPermissionRequest addPermissionRequest)
        {
            if (!await _permissionService.HasGlobalPermissionAsync("Change global role"))
            {
                return Forbid();
            }
            var permission = new Permission
            {
                PermissionName = addPermissionRequest.Name
            };

            dbContext.Permissions.Add(permission);
            await dbContext.SaveChangesAsync();

            var permissionDTO = new PermissionDTO
            {
                PermissionId = permission.PermissionId,
                PermissionName = permission.PermissionName
            };

            return Ok(permissionDTO);
        }

        [Authorize]
        [HttpDelete("{permissionId}")]
        public async Task<IActionResult> RemovePermission(int permissionId)
        {
            if (!await _permissionService.HasGlobalPermissionAsync("Change global role"))
            {
                return Forbid();
            }

            var permission = await dbContext.Permissions.FindAsync(permissionId);
            if (permission == null)
            {
                return NotFound(new { message = "Permission with this id does not exist" });
            }

            dbContext.Permissions.Remove(permission);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Success." });
        }
    }
}
