using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects.Request.Auth;

public class CompleteForgotPasswordRequest
{   
    [Required(ErrorMessage = "Password token is required.")]
    public string PasswordToken { get; set; }
    
    [Required(ErrorMessage = "Password is required.")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
    public string NewPassword { get; set; }
}