namespace Server.DataTransferObjects
{
    public class ProjectTaskDTO
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public string TaskDescription { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime Deadline { get; set; }
        public DateTime DateFinished { get; set; }
        public DateTime DeadlineModified { get; set; }


        public int ProjectId { get; set; }
        public string ProjectName { get; set; } 
        public string TaskStatus { get; set; }
        public int TaskStatusId { get; set; }
        public int TaskPriorityId { get; set; }
        public bool IsTaskDependentOn { get; set; }
        public int TaskCategoryId {  get; set; }
        public List<MemberDTO> AssignedMembers { get; set; }
        public string TaskPriorityName { get; set; }

        public string TaskCategoryName { get; set; }

        public int PercentageComplete { get; set; }
        public int TaskLeaderId { get; set; }

        public string TaskLeaderFirstName { get; set; }
        
        public string TaskLeaderLastName { get; set; }

}
}
