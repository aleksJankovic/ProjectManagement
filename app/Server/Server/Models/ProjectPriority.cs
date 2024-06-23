using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class ProjectPriority
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProjectPriorityId { get; set; }
        public string Name { get; set; }

        public string PriorityColorHex { get; set; } = string.Empty;
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
