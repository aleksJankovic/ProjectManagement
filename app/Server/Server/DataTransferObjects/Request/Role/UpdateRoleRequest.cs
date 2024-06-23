using Microsoft.Build.Framework;

namespace Server.DataTransferObjects.Request.Role;

public class UpdateRoleRequest
{
    [Required]
    public string Name { get; set; }
}