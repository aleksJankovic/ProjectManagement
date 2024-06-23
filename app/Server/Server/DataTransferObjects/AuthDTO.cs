using Microsoft.Build.Framework;

namespace Server.DataTransferObjects;

public class AuthDTO
{
    [Required] 
    public string JwtToken { get; set; }
    
    [Required]
    public DateTime JwtTokenExpirationDate { get; set; }
    
    [Required]
    public string RefreshToken { get; set; }
    
    [Required]
    public MemberDTO Member { get; set; }
}