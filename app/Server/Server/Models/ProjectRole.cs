using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models;

public class ProjectRole
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; }
    
    [Required] 
    public bool IsDefault { get; set; } = false;
    
    [Required] 
    public bool IsFallback { get; set; } = false;
    
    public ICollection<ProjectRolePermission> ProjectRolePermissions { get; set; } = new List<ProjectRolePermission>();

    public ICollection<ProjectProjectRole> ProjectProjectRoles { get; set; } = new List<ProjectProjectRole>();
}