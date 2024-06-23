using Microsoft.Build.Framework;

namespace Server.DataTransferObjects.Request.Notification;

public class SendNotificationRequest
{
    [Required]
    public String Title { get; set; }
    
    [Required]
    public String Description { get; set; }
    
    [Required]
    public int MemberId { get; set; }
}