using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class TaskCategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TaskCategoryID { get; set; }
        public string CategoryName { get; set; }

        [Required]
        public bool IsDefault { get; set; } = false;

        public List<ProjectTask> ProjectTasks { get; set; }
        public List<ProjectTaskCategories> ProjectTaskCategories { get; set; }
    }
}
