namespace Server.DataTransferObjects.Request.TaskActivity
{
    public class AddTaskActivityRequest
    {
        public int TaskId { get; set; }
        public string Description { get; set; }
        public int TaskActivityTypeId { get; set; }

        public int PercentageComplete { get; set; }
    }
}
