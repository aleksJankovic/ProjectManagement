using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class ProjectRolePermission
{
    public int ProjectRoleId { get; set; }

    public ProjectRole ProjectRole { get; set; }
    
    public int ProjectPermissionId { get; set; }
    
    public ProjectPermission ProjectPermission { get; set; }
}