namespace Server.DataTransferObjects.Request.ProjectTask
{
    public class AddProjectTaskRequest
    {
        public string TaskName { get; set; }
        public string TaskDescription { get; set; }
        public DateTime Deadline { get; set; }
        public int ProjectId { get; set; }
        public List<int> AssignedMemberIds { get; set; }
        public int TaskPriorityId { get; set; }

        public int TaskLeaderId { get; set; }
    }
}
