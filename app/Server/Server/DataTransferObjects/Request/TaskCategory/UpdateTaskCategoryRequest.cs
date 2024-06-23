using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects.Request.TaskCategory
{
    public class UpdateTaskCategoryRequest
    {
        [Required]
        public string Name { get; set; }
    }
}
