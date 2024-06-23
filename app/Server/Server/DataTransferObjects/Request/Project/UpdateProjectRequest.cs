namespace Server.DataTransferObjects.Request
{
    public class UpdateProjectRequest
    {
        public string ProjectName { get; set; } = string.Empty;

        public string ProjectDescription { get; set; } = string.Empty;

        public DateTime Deadline { get; set; }

        public int ProjectPriorityId { get; set; }

        public int ProjectStatusId { get; set; }
    }
}
