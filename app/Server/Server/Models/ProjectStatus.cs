using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class ProjectStatus
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string Status { get; set; } = string.Empty;

        public ICollection<Project> Projects { get; set; } = new List<Project>();

    }
}
