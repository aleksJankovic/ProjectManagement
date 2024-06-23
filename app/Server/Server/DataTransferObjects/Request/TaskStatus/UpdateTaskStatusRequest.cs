using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects.Request.ProjectTaskStatus;

public class UpdateTaskStatusRequest
{
    [Required]
    public string Name { get; set; }
}