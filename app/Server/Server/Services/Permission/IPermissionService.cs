namespace Server.Services.Permission;

public interface IPermissionService
{
    public Task<bool> HasGlobalPermissionAsync(string permissionName);
    public Task<bool> HasProjectPermissionAsync(int projectId, string permissionName);
    public Task<bool> IsCurrentUserIdMatchAsync(int memberId);

    public Task<bool> IsMemberAssignedToTaskAsync(int taskId);
}