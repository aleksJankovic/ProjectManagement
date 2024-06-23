using Microsoft.AspNetCore.Mvc;

namespace Server.Services.PermissionNotifier;

public interface IPermissionNotifier
{
    Task AssignedToProject(int memberId, int projectId);
    Task RemovedFromProject(int memberId, int projectId);
    Task UpdatedGlobalPermissions(int memberId);
    Task UpdatedProjectPermissions(int projectId, int memberId);

    Task UpdatedProjectTasks(int projectId, int memberId);

    Task UpdatedMemberDetails(int memberId, bool logout);
}