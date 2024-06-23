using Microsoft.AspNetCore.SignalR;
using Server.Data;
using Server.DataTransferObjects.Request;
using Server.DataTransferObjects.Request.Notification;
using Server.Hubs;

namespace Server.Services.Notification;

public class NotificationService : INotificationService
{
    private readonly LogicTenacityDbContext _dbContext;
    private readonly IHubContext<SignalRHub> _hubContext;

    public NotificationService(LogicTenacityDbContext dbContext, IHubContext<SignalRHub> hubContext)
    {
        _dbContext = dbContext;
        _hubContext = hubContext;
    }
    
    public async Task SendNotification(SendNotificationRequest sendNotificationRequest)
    {
        // Create the notification
        var notification = new Models.Notification
        {
            Title = sendNotificationRequest.Title,
            Description = sendNotificationRequest.Description,
            MemberId = sendNotificationRequest.MemberId
        };

        // Add the notification to the database
        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();

        int memberId = sendNotificationRequest.MemberId;

        // Send the notification to the appropriate member using SignalR
        if (SignalRHub.Connections.ContainsKey(memberId))
        {
            NotificationDTO notificationDto = new NotificationDTO()
            {
                Id = notification.Id,
                Title = notification.Title,
                Description = notification.Description,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead,
            };
            
            var connectionIds = SignalRHub.Connections[memberId];
            foreach (var connectionId in connectionIds)
            {
                await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", notificationDto);
            }
        }
    }
}