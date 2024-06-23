using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects
{
    public class TaskCategoryDTO
    {
        public int TaskCategoryID { get; set; }
        public string CategoryName { get; set; }
        
        [Required]
        public bool IsDefault { get; set; }
    }
}
