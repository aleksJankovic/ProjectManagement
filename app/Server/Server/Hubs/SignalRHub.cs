using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Server.DataTransferObjects.Request;
using Server.Models;

namespace Server.Hubs
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class SignalRHub : Hub
    {
        public static readonly Dictionary<int, List<string>> Connections = new();
        private readonly ILogger<SignalRHub> _logger;

        public SignalRHub(ILogger<SignalRHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var memberId = GetMemberId();
            if (memberId != null)
            {
                List<int> connectedMemberIds;
                lock (Connections)
                {
                    if (!Connections.ContainsKey(memberId.Value))
                    {
                        Connections[memberId.Value] = new List<string>();
                    }
                    Connections[memberId.Value].Add(Context.ConnectionId);
                    connectedMemberIds = Connections.Keys.ToList();
                }

                _logger.LogInformation($"Member {memberId.Value} connected with Connection ID: {Context.ConnectionId}");

                // Notify all clients about the new connection
                await Clients.Others.SendAsync("MemberConnected", memberId.Value);
                // Send the list of all connected members to the newly connected client
                await Clients.Caller.SendAsync("ConnectedMembers", connectedMemberIds);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var memberId = GetMemberId();
            if (memberId != null)
            {
                bool memberDisconnected = false;
                lock (Connections)
                {
                    if (Connections.ContainsKey(memberId.Value))
                    {
                        Connections[memberId.Value].Remove(Context.ConnectionId);
                        if (!Connections[memberId.Value].Any())
                        {
                            Connections.Remove(memberId.Value);
                            memberDisconnected = true;
                        }
                    }
                }

                if (memberDisconnected)
                {
                    _logger.LogInformation($"Member {memberId} disconnected with Connection ID: {Context.ConnectionId}");

                    // Notify all clients about the disconnection
                    await Clients.All.SendAsync("MemberDisconnected", memberId.Value);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
        
        private int? GetMemberId()
        {
            var user = Context.User;
            if (user == null)
            {
                return null;
            }

            var memberIdClaim = user.Claims.FirstOrDefault(claim => claim.Type == "Id");
            if (memberIdClaim == null || !int.TryParse(memberIdClaim.Value, out var memberId))
            {
                return null;
            }

            return memberId;
        }
    }
}
