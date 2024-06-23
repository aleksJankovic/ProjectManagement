using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models;

public class ProjectTaskStatus
{
    public int ProjectId { get; set; }

    public Project Project { get; set; }
    
    public int TaskStatusId { get; set; }
    
    public TaskStatus TaskStatus { get; set; }
}
