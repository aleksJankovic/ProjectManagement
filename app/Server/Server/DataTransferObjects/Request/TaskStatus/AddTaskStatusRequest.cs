using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects.Request.ProjectTaskStatus
{
    public class AddTaskStatusRequest
    {
        [Required]
        public string Name { get; set; }
    }
}
