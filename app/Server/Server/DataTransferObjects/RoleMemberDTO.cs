using Microsoft.Build.Framework;

namespace Server.DataTransferObjects;

public class RoleMemberDTO
{
    [Required]
    public int Id { get; set; }
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
}