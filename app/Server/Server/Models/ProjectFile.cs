using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
  public class ProjectFile
  {
    public int ProjectId { get; set; }
    public Project Project { get; set; }

    public int FileId { get; set; }
    public File File { get; set; }
  }

}
