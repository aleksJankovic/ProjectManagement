using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class ProjectTask
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TaskId { get; set; }

        [Required]
        public string TaskName { get; set; } = string.Empty;

        [Required]
        public string TaskDescription { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime Deadline { get; set; }

        public DateTime DateFinished { get; set; }

        public DateTime DeadlineModified { get; set; }

        public int ProjectId { get; set; }
        public Project Project { get; set; }

        public int TaskStatusId { get; set; }
        public TaskStatus TaskStatus { get; set; }

        public int TaskPriorityId { get; set; }
        public TaskPriority TaskPriority { get; set; }

        public int TaskCategoryId { get; set; }
        public TaskCategory TaskCategory { get; set; }

        public ICollection<TaskDependency> Dependencies { get; set; } = new List<TaskDependency>();
        public ICollection<TaskDependency> DependentTasks { get; set; } = new List<TaskDependency>();

        public ICollection<MemberTask> Members { get; set; } = new List<MemberTask>();

        public ICollection<TaskActivity> TaskActivities { get; set; } = new List<TaskActivity>();

        public ICollection<TaskComment> TaskComment { get; set; } = new List<TaskComment>();
        public ICollection<TaskFile> TaskFiles { get; set; } = new List<TaskFile>();

        public int TaskLeaderId { get; set; }
        public Member TaskLeader { get; set; }

        public int PercentageComplete { get; set; } = 0;
    }
}
