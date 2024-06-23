using Microsoft.Build.Framework;

namespace Server.DataTransferObjects;

public class RefreshTokenRequest
{
    [Required] 
    public string RefreshToken { get; set; }
}