using Microsoft.Build.Framework;

namespace Server.DataTransferObjects.Request.Role
{
    public class AddRoleRequest
    {
        [Required]
        public string Name { get; set; }
    }
}
