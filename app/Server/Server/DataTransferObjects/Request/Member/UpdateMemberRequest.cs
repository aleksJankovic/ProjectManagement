using System.ComponentModel.DataAnnotations;

namespace Server.DataTransferObjects;

public class UpdateMemberRequest
{
    [Required(ErrorMessage = "First name is required.")]
    public string FirstName { get; set; } = string.Empty;
        
    [Required(ErrorMessage = "Last name is required.")]
    public string LastName { get; set; } = string.Empty;
    
    public String Linkedin { get; set; } = String.Empty;

    public String Github { get; set; } = String.Empty;

    public String Status { get; set; } = String.Empty;

    public String PhoneNumber { get; set; } = String.Empty;
        
    public String Country { get; set; } = String.Empty;
        
    public String City { get; set; } = String.Empty;

    public DateTime DateOfBirth { get; set; } = DateTime.UnixEpoch; 
}