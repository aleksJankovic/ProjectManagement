namespace Server.Models;

public class ProjectProjectRole
{
    public int ProjectId { get; set; }

    public Project Project { get; set; }
    
    public int ProjectRoleId { get; set; }
    
    public ProjectRole ProjectRole { get; set; }
}