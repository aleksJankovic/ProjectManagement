using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.DataTransferObjects.Request.ProjectStatus;
using Server.DataTransferObjects;
using Server.Models;
using Microsoft.EntityFrameworkCore;
using Server.DataTransferObjects.Request.TaskCategory;
using Microsoft.AspNetCore.Authorization;
using Server.DataTransferObjects.Request.ProjectTaskStatus;
using Server.Services.Permission;

namespace Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TaskCategoryController : ControllerBase
    {
        private readonly LogicTenacityDbContext dbContext;
        private readonly IPermissionService _permissionService;
        public TaskCategoryController(LogicTenacityDbContext dbContext, IPermissionService permissionService)
        {
            this.dbContext = dbContext;
            _permissionService = permissionService;
        }

        [HttpGet("{projectId}/TaskCategories")]
        public async Task<IActionResult> GetTaskCategories(int projectId)
        {
            var taskCategories = await dbContext.TaskCategories
                .Where(ts => ts.ProjectTaskCategories.Any(pts => pts.ProjectId == projectId))
                .ToListAsync();

            var taskCategoriesDTO = taskCategories.Select(tc => new TaskCategoryDTO
            {
                CategoryName = tc.CategoryName,
                TaskCategoryID = tc.TaskCategoryID,
                IsDefault = tc.IsDefault
            }).ToList();

            return Ok(taskCategoriesDTO);
        }

        [Authorize]
        [HttpPost("{projectId}/TaskCategory")]
        public async Task<IActionResult> AddTaskCategory(int projectId, AddTaskCategoryRequest addTaskCategoryRequest)
        {
            var projectExists = await dbContext.Projects.AnyAsync(p => p.ProjectId == projectId);

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Add task category");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            if (!projectExists)
            {
                return NotFound(new { message = "Project with given id not found." });
            }

            var alreadyExists = await dbContext.TaskCategories
                .AnyAsync(ts => ts.ProjectTaskCategories.Any(pts => pts.ProjectId == projectId) &&
                           ts.CategoryName == addTaskCategoryRequest.TaskCategoryName);

            if (alreadyExists)
            {
                return Conflict(new { message = "Task Status with given name already exists." });
            }

            var taskCategory = new TaskCategory
            {
                CategoryName = addTaskCategoryRequest.TaskCategoryName,
                IsDefault = false
            };

            dbContext.TaskCategories.Add(taskCategory);
            await dbContext.SaveChangesAsync();

            var projectTaskCategories = new ProjectTaskCategories
            {
                ProjectId = projectId,
                TaskCategoryId = taskCategory.TaskCategoryID
            };

            dbContext.ProjectTaskCategories.Add(projectTaskCategories);
            await dbContext.SaveChangesAsync();

            var taskCategoriesDTO = new TaskCategoryDTO
            {
                CategoryName = taskCategory.CategoryName,
                TaskCategoryID = taskCategory.TaskCategoryID,
                IsDefault = taskCategory.IsDefault
            };

            return Ok(taskCategoriesDTO);
        }

       

        [Authorize]
        [HttpDelete("{projectId}/TaskCategory/{taskCategoryId}")]
        public async Task<IActionResult> DeleteTaskCategory(int projectId, int taskCategoryId)
        {
            var projectTaskCategory = await dbContext.ProjectTaskCategories
                .FirstOrDefaultAsync(pts => pts.ProjectId == projectId && pts.TaskCategoryId == taskCategoryId);

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Remove task category");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            if (projectTaskCategory == null)
            {
                return NotFound(new { message = "Project with given id does not exist or this task category does not belong to it." });
            }

            var taskCategory = await dbContext.TaskCategories
                .Include(ts => ts.ProjectTasks)
                .FirstOrDefaultAsync(ts => ts.TaskCategoryID == taskCategoryId);

            if (taskCategory == null)
            {
                return NotFound(new { message = "Task Category with given id does not exist." });
            }

            if (taskCategory.IsDefault)
            {
                return BadRequest(new { message = "It's forbidden to delete this task category." });
            }

            if (taskCategory.ProjectTasks.Count > 0)
            {
                return BadRequest(new { message = "There are tasks in given project with this task category." });
            }

            dbContext.ProjectTaskCategories.Remove(projectTaskCategory);
            dbContext.TaskCategories.Remove(taskCategory);

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Success." });

        }

        [Authorize]
        [HttpPut("{projectId}/TaskCategory/{taskCategoryId}")]
        public async Task<IActionResult> UpdateTaskCategory(int projectId, int taskCategoryId, UpdateTaskCategoryRequest updateTaskCategoryRequest)
        {
            var projectTaskStatus = await dbContext.ProjectTaskCategories
                .FirstOrDefaultAsync(pts => pts.ProjectId == projectId && pts.TaskCategoryId == taskCategoryId);

            var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change task category");

            if (!hasPermission)
            {
                return Forbid("Insufficient permissions");
            }

            if (projectTaskStatus == null)
            {
                return NotFound(new { message = "Project with given id does not exist or this task catgeory does not belong to it." });
            }

            var taskCategory = await dbContext.TaskCategories
                .FirstOrDefaultAsync(ts => ts.TaskCategoryID == taskCategoryId);

            if (taskCategory == null)
            {
                return NotFound(new { message = "Task category with given id does not exist." });
            }

            if (taskCategory.IsDefault)
            {
                return Conflict(new { message = "It's forbidden to change name of this task category." });
            }

            taskCategory.CategoryName = updateTaskCategoryRequest.Name;

            await dbContext.SaveChangesAsync();

            return Ok(new TaskCategoryDTO
            {
                TaskCategoryID = taskCategory.TaskCategoryID,
                CategoryName = taskCategory.CategoryName,
                IsDefault = taskCategory.IsDefault
            });
        }
    }

}
