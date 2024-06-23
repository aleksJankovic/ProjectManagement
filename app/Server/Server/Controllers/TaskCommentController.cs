using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request.TaskComment;
using Server.Services.Permission;

namespace Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]

    public class TaskCommentController : ControllerBase
    {
        private readonly LogicTenacityDbContext dbContext;
        private readonly IPermissionService _permissionService;
        
        public TaskCommentController(LogicTenacityDbContext dbContext, IPermissionService permissionService)
        {
            this.dbContext = dbContext;
            _permissionService = permissionService;
        }
        
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllTaskComments()
        {
            var taskcomments = await dbContext.TaskComments.Include(tc => tc.Member).ToListAsync();
            
            var taskcommentsdtos = taskcomments.Select(tc => new TaskCommentDTO
            {
                Text = tc.Text,
                WriterId = tc.MemberId,
                WriterFirstName = tc.Member.FirstName,
                WriterLastName = tc.Member.LastName,
                CreatedAt = tc.CreatedAt,
                TaskId = tc.TaskId,
                TaskCommentId = tc.Id
            }).ToList();


            return Ok(taskcommentsdtos);
        }
        
        [Authorize]
        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTaskCommentByTaskId(int taskId)
        {
            var taskcomments = await dbContext.TaskComments
                .Include(tc => tc.Member)
                .Where(tc => tc.TaskId == taskId)
                .ToListAsync();


            var taskcommentsdtos = taskcomments.Select(tc => new TaskCommentDTO
            {
                Text = tc.Text,
                WriterId = tc.MemberId,
                WriterFirstName = tc.Member.FirstName,
                WriterLastName = tc.Member.LastName,
                CreatedAt = tc.CreatedAt,
                TaskId = tc.TaskId,
                TaskCommentId = tc.Id
            }).ToList();

            return Ok(taskcommentsdtos);
        }
        
        
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddTaskComment(AddTaskCommentRequest addTaskCommentRequest)
        {

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var member = await dbContext.Members.FindAsync(userId);
            if (member == null)
            {
                return BadRequest(new { message = "Member not found" });
            }

            var projectTask = await dbContext.ProjectTasks
               .Include(ts => ts.Project)
               .FirstOrDefaultAsync(t => t.TaskId == addTaskCommentRequest.TaskId);

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectTask.ProjectId, "Comment task");
            var isAssignedToTask = await _permissionService.IsMemberAssignedToTaskAsync(projectTask.TaskId);

            if (!hasPermission && !isAssignedToTask)
            {
                return Forbid("Forbid action");
            }


            var taskComment = new TaskComment
            {
                MemberId = member.Id,
                TaskId = addTaskCommentRequest.TaskId,
                CreatedAt = DateTime.Now,
                Text = addTaskCommentRequest.Text
            };

            dbContext.TaskComments.Add(taskComment);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Task comment added successfully." });

        }
        
        
        [Authorize]
        [HttpDelete("{taskCommentId}")]
        public async Task<IActionResult> DeleteTaskComment(int taskCommentId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (userIdClaim == null)
            {
                return NotFound(new { message = "User ID claim not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID in token" });
            }

            var member = await dbContext.Members.FindAsync(userId);
            if (member == null)
            {
                return BadRequest(new { message = "Member not found" });
            }

            var taskcomment = await dbContext.TaskComments.FindAsync(taskCommentId);

            var projectTask = await dbContext.ProjectTasks
               .Include(ts => ts.Project)
               .FirstOrDefaultAsync(t => t.TaskId == taskcomment.TaskId);

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectTask.ProjectId, "Delete task comment");
            var isAssignedToTask = await _permissionService.IsMemberAssignedToTaskAsync(projectTask.TaskId);

            if (!hasPermission && !isAssignedToTask)
            {
                return Forbid("Forbid action");
            }


            if (taskcomment == null)
            {
                return NotFound(new { message = "Task comment not found" });
            }


            dbContext.TaskComments.Remove(taskcomment);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Task comment deleted successfully." });

        }
    }
}
