using Microsoft.Build.Framework;

namespace Server.DataTransferObjects.Request.ProjectTask;

public class ChangeTaskDatesRequest
{
    [Required]
    public DateTime startDate { get; set; }
    
    [Required]
    public DateTime deadline { get; set; }
}