using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
  public class TaskFile
  {
    public int TaskId { get; set; }
    public ProjectTask ProjectTask { get; set; }

    public int FileId { get; set; }
    public File File { get; set; }
  }

}
