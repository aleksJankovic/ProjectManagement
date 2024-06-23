using Server.Models;

namespace Server.DataTransferObjects
{
    public class ProjectDTO
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectDescription { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime DateFinished { get; set; }
        public DateTime DeadlineModifed { get; set; }


        public int ProjectStatusId { get; set; }
        public string Status { get; set; } = string.Empty;
        public ICollection<ProjectTaskDTO> ProjectTasks { get; set; }
        public MemberDTO TeamLider { get; set; }
        public int NumberOfPeople { get; set; } 
        public int NumberOfTasks { get; set; }

        public int ProjectPriorityId { get; set; }
        public string ProjectPriority { get; set; } = string.Empty;

    }
}
