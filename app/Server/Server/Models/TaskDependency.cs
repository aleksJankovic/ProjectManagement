namespace Server.Models
{
    public class TaskDependency
    {
        public int TaskId { get; set; }
        public ProjectTask Task { get; set; }

        public int DependentTaskId { get; set; }
        public ProjectTask DependentTask { get; set; }
    }
}
