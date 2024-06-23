using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects.Request.Member;

public class RoleChangeRequest
{
    [Required]
    public int RoleId { get; set; }
}