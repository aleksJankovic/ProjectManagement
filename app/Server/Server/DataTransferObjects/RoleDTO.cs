using Microsoft.Build.Framework;

namespace Server.DataTransferObjects
{
    public class RoleDTO
    {
        [Required]
        public int Id { get; set; }
        
        [Required]
        public string  Name { get; set; }
        
        [Required]
        public bool IsDefault { get; set; }
        
        [Required]
        public bool IsFallback { get; set; }
        
        public ICollection<PermissionDTO> PermissionList { get; set; }
    }
}
