using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects
{
    public class AddMemberRequest
    {
        [Required(ErrorMessage = "First name is required.")]
        public string FirstName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Last name is required.")]
        public string LastName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role is required.")]
        public int RoleId { get; set; }
        
        public string Password { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;
    }
}
