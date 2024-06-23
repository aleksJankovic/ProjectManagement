using Server.DataTransferObjects.Request.Notification;

namespace Server.Services.Notification;

public interface INotificationService
{
    Task SendNotification(SendNotificationRequest sendNotificationRequest);
}