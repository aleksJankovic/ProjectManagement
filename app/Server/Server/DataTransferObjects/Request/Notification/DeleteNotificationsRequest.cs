using Microsoft.Build.Framework;

namespace Server.DataTransferObjects.Request.Notification;

public class DeleteNotificationsRequest
{
    [Required]
    public ICollection<int> NotificationIds { get; set; }= new List<int>();
}