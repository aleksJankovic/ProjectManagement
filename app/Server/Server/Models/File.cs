using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class File
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FileId { get; set; }
        public string FilePath { get; set; }
        public string OriginalName { get; set; }
        public int UploaderId { get; set; }
        public Member Uploader { get; set; }
    }
}