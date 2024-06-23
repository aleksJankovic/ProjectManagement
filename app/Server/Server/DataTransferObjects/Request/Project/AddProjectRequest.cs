namespace Server.DataTransferObjects.Request
{
    public class AddProjectRequest
    {
        public string ProjectName { get; set; } = string.Empty;

        public string ProjectDescription { get; set; } = string.Empty;

        public DateTime Deadline { get; set; }

        public int PriorityId { get; set; } 
    }
}
