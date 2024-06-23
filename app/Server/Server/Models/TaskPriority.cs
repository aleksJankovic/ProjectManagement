using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class TaskPriority
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TaskPriorityId { get; set; }
        public string Name { get; set; }

        public string PriorityColorHex { get; set; } = string.Empty;

        public ICollection<ProjectTask> ProjectTasks { get; set; } = new List<ProjectTask>();

    }
}
