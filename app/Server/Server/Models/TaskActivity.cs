using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class TaskActivity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TaskActivityId { get; set; }

        public int ProjectTaskId { get; set; }
        public ProjectTask ProjectTask { get; set; } 

        public int MemberId { get; set; }
        public Member Member { get; set; }

        public string Description { get; set; } 
        public DateTime ActivityDate { get; set; }

        public int TaskActivityTypeId { get; set; }
        public TaskActivityType TaskActivityType { get; set; }

        public int PercentageComplete { get; set; } = 0;
    }
}
