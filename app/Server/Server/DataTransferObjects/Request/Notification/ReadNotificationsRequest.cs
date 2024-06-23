using System.Collections.ObjectModel;
using Microsoft.Build.Framework;

namespace Server.DataTransferObjects.Request.Notification;

public class ReadNotificationsRequest
{
    [Required]
    public ICollection<int> NotificationIds { get; set; } = new List<int>();
}