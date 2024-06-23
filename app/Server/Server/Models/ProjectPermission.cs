using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class ProjectPermission
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; }

    public ICollection<ProjectRolePermission> ProjectRolePermissions { get; set; } = new List<ProjectRolePermission>();
}