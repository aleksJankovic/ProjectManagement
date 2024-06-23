using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class TaskStatus
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public bool IsDefault { get; set; } = false;

        public ICollection<ProjectTask> ProjectTasks { get; set; } = new List<ProjectTask>();

        public ICollection<ProjectTaskStatus> ProjectTaskStatuses { get; set; } = new List<ProjectTaskStatus>();
    }
}
