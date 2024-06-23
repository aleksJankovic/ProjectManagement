using Microsoft.EntityFrameworkCore;
using Server.Data;

namespace Server.Services.Permission;

public class PermissionService : IPermissionService
{
    private readonly LogicTenacityDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PermissionService(LogicTenacityDbContext dbContext, IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }
    
    private int GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext.User.Claims
            .FirstOrDefault(c => c.Type == "Id");

        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }

        throw new ApplicationException("User ID not found in JWT.");
    }
    
    public async Task<bool> HasGlobalPermissionAsync(string permissionName)
    {
        int memberId = GetCurrentUserId();
        
        try
        {
            return await _dbContext.Members
                .Where(m => m.Id == memberId)
                .Join(_dbContext.RolePermissions, 
                    member => member.RoleId, 
                    rp => rp.RoleId, 
                    (member, rp) => rp.Permission)
                .AnyAsync(p => p.PermissionName == permissionName);
        }
        catch (Exception ex)
        {
            // Handle exception
            throw new ApplicationException("Error checking global permission.", ex);
        }
    }

    public async Task<bool> HasProjectPermissionAsync(int projectId, string permissionName)
    {
        int memberId = GetCurrentUserId();
        
        try
        {
            return await _dbContext.MemberProjects
                .Where(mp => mp.MemberId == memberId && mp.ProjectId == projectId)
                .Join(_dbContext.ProjectRolePermissions, 
                    mp => mp.ProjectRoleId, 
                    ppr => ppr.ProjectRoleId, 
                    (mp, ppr) => ppr.ProjectPermission)
                .AnyAsync(p => p.Name == permissionName);
        }
        catch (Exception ex)
        {
            // Handle exception
            throw new ApplicationException("Error checking project permission.", ex);
        }
    }
    
    public async Task<bool> IsCurrentUserIdMatchAsync(int memberId)
    {
        int currentUserId = GetCurrentUserId();
        
        return await Task.FromResult(currentUserId == memberId);
    }

    public async Task<bool> IsMemberAssignedToTaskAsync(int taskId)
    {
        int memberId = GetCurrentUserId();

        try
        {
            return await _dbContext.MemberTasks.AnyAsync(mt => mt.MemberId == memberId && mt.TaskId == taskId);
        }
        catch (Exception ex)
        {
            throw new ApplicationException("Error checking task assignment.", ex);
        }
    }
}