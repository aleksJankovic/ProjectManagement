using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects
{
    public class TaskStatusDTO
    {
        [Required]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        [Required]
        public bool IsDefault { get; set; }
    }
}
