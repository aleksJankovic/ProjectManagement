using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request.TaskActivity;
using Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Server.Services.Permission;
using Server.DataTransferObjects.Request.ProjectTask;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskActivityController : ControllerBase
    {
        private readonly LogicTenacityDbContext dbContext;
        private readonly IPermissionService _permissionService;

        public TaskActivityController(LogicTenacityDbContext dbContext, IPermissionService permissionService)
        {
            this.dbContext = dbContext;
            _permissionService = permissionService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllTaskActivities()
        {
            var taskActivities = await dbContext.TaskActivities
                .Include(ta => ta.ProjectTask)
                    .ThenInclude(pt => pt.Project)
                .Include(ta => ta.TaskActivityType)
                .Include(ta => ta.Member)
                    .ThenInclude(ta => ta.Role)
                .OrderByDescending(ta => ta.ActivityDate)
                .ToListAsync();

            var taskActivityDTOs = taskActivities.Select(ta => new TaskActivityDTO
            {
                ProjectName = ta.ProjectTask.Project.ProjectName,
                TaskActivityId = ta.TaskActivityId,
                WorkerId = ta.MemberId,
                Name = ta.Member.FirstName,
                Lastname = ta.Member.FirstName,
                Country = ta.Member.Country,
                DateOfBirth = ta.Member.DateOfBirth,
                Email = ta.Member.Email,
                RoleName = ta.Member.Role.RoleName,
                TaskId = ta.ProjectTaskId,
                ProjectId = ta.ProjectTask.ProjectId,
                DateModify = ta.ActivityDate,
                Comment = ta.Description,
                TaskActivityTypeId = ta.TaskActivityTypeId,
                PercentageComplete = ta.PercentageComplete
            }).ToList();

            return Ok(taskActivityDTOs);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddTaskActivity(AddTaskActivityRequest addTaskActivityRequest)
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

            var projectTask = await dbContext.ProjectTasks.FirstOrDefaultAsync(pt => pt.TaskId == addTaskActivityRequest.TaskId);

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectTask.ProjectId, "Add task activity");
            var isAssignedToTask = await _permissionService.IsMemberAssignedToTaskAsync(projectTask.TaskId);

            if (!hasPermission && !isAssignedToTask)
            {
                return Forbid("Insufficient permissions");
            }

            var taskActivity = new TaskActivity
            {
                MemberId = member.Id,
                ProjectTaskId = addTaskActivityRequest.TaskId,
                ActivityDate = DateTime.Now,
                Description = addTaskActivityRequest.Description,
                TaskActivityTypeId = addTaskActivityRequest.TaskActivityTypeId,
                PercentageComplete = addTaskActivityRequest.PercentageComplete
            };

            
            
            projectTask.PercentageComplete += addTaskActivityRequest.PercentageComplete;
            

            dbContext.TaskActivities.Add(taskActivity);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Task activity added successfully." });

        }

        [Authorize]
        [HttpDelete("{taskActivityId}")]
        public async Task<IActionResult> DeleteTaskActivity(int taskActivityId)
        {
            var taskActivity = await dbContext.TaskActivities
                  .Include(ta => ta.ProjectTask)
                      .ThenInclude(t => t.Project)
                  .FirstOrDefaultAsync(ta => ta.TaskActivityId == taskActivityId);

            var hasPermission = await _permissionService.HasProjectPermissionAsync(taskActivity.ProjectTask.ProjectId, "Remove task activity");
            var isAssignedToTask = await _permissionService.IsMemberAssignedToTaskAsync(taskActivity.ProjectTask.TaskId);
            var projectTask = await dbContext.ProjectTasks.FirstOrDefaultAsync(pt => pt.TaskId == taskActivity.ProjectTaskId);

            if (!hasPermission && !isAssignedToTask)
            {
                return Forbid("Insufficient permissions");
            }


            if (taskActivity == null)
            {
                return NotFound(new { message = "Task activity not found" });
            }

            projectTask.PercentageComplete -= taskActivity.PercentageComplete;

            dbContext.TaskActivities.Remove(taskActivity);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Task activity deleted successfully." });

        }

        [Authorize]
        [HttpGet("{taskActivityId}")]
        public async Task<IActionResult> GetTaskActivityById(int taskActivityId)
        {
            var taskActivity = await dbContext.TaskActivities
                .Include(ta => ta.ProjectTask)
                    .ThenInclude(t => t.Project)
                .Include(ta => ta.Member)
                    .ThenInclude(t => t.Role)
                .Include(ta => ta.TaskActivityType)
                .FirstOrDefaultAsync(ta => ta.TaskActivityId == taskActivityId);

            if (taskActivity == null)
            {
                return NotFound(new { message = "Task activity not found" });
            }

            var taskActivityDTO = new TaskActivityDTO
            {
                ProjectName = taskActivity.ProjectTask.Project.ProjectName,
                TaskActivityId = taskActivity.TaskActivityId,
                WorkerId = taskActivity.MemberId,
                TaskId = taskActivity.ProjectTaskId,
                ProjectId = taskActivity.ProjectTask.ProjectId,
                DateModify = taskActivity.ActivityDate,
                Comment = taskActivity.Description,
                TaskActivityTypeId = taskActivity.TaskActivityTypeId,
                Name = taskActivity.Member.FirstName,
                Lastname = taskActivity.Member.LastName,
                Country = taskActivity.Member.Country,
                DateOfBirth = taskActivity.Member.DateOfBirth,
                Email = taskActivity.Member.Email,
                RoleName = taskActivity.Member.Role.RoleName
            };


            return Ok(taskActivityDTO);
        }

        [HttpGet("Task/{taskId}")]
        public async Task<IActionResult> GetTaskActivitiesByTaskId(int taskId)
        {
            var taskActivities = await dbContext.TaskActivities
                .Include(ta => ta.ProjectTask)
                    .ThenInclude(pt => pt.Project)
                .Include(ta => ta.Member)
                    .ThenInclude(ta => ta.Role)
                .Include(ta => ta.TaskActivityType)
                .Where(ta => ta.ProjectTaskId == taskId)
                .ToListAsync();

            var taskActivityDTOs = taskActivities.Select(ta => new TaskActivityDTO
            {   
                ProjectName = ta.ProjectTask.Project.ProjectName,
                TaskActivityId = ta.TaskActivityId,
                WorkerId = ta.MemberId,
                TaskId = ta.ProjectTaskId,
                ProjectId = ta.ProjectTask.ProjectId,
                DateModify = ta.ActivityDate,
                Comment = ta.Description,
                TaskActivityTypeId = ta.TaskActivityTypeId,
                Name = ta.Member.FirstName,
                Lastname = ta.Member.LastName,
                Email = ta.Member.Email,
                Country = ta.Member.Country,
                DateOfBirth = ta.Member.DateOfBirth,
                RoleName = ta.Member.Role.RoleName,
                PercentageComplete = ta.PercentageComplete
            }).ToList();

            return Ok(taskActivityDTOs);
        }
    }
}