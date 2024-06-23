using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects.Request.Member
{
    public class PasswordChangeRequest
    {
        [Required]
        public string OldPassword { get; set; }
        
        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string NewPassword { get; set; }

    }
}
