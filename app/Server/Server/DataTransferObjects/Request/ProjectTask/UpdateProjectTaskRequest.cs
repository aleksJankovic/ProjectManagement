namespace Server.DataTransferObjects.Request.ProjectTask
{
    public class UpdateProjectTaskRequest
    {
        public DateTime Deadline { get; set; }
        public string TaskDescription { get; set; }
        public string TaskName { get; set; }
    }
}
