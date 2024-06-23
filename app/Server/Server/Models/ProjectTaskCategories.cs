namespace Server.Models
{
    public class ProjectTaskCategories
    {
        public int ProjectId { get; set; }

        public Project Project { get; set; }

        public int TaskCategoryId { get; set; }

        public TaskCategory TaskCategory { get; set; }
    }
}
