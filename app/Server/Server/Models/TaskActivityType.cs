using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class TaskActivityType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TaskActivityTypeId { get; set; }

        public string TaskActivityName { get; set; }

        public ICollection<TaskActivity> TaskActivities { get; set; } = new List<TaskActivity>();
    }
}
