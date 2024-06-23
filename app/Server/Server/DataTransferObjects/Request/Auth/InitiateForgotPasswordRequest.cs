using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects.Request.Member;

public class InitiateForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } 
}