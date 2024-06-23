using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request.ProjectTask;
using Server.DataTransferObjects.Request.ProjectTaskStatus;
using Server.Models;
using TaskStatus = Server.Models.TaskStatus;

namespace Server.Controllers;

public partial class ProjectController
{
    [HttpGet("{projectId}/TaskStatus")]
    public async Task<IActionResult> GetTaskStatuses(int projectId)
    {
        var taskStatuses = await dbContext.TaskStatuses
            .Where(ts => ts.ProjectTaskStatuses.Any(pts => pts.ProjectId == projectId))
            .ToListAsync();
        
        var taskStatusDTOS = taskStatuses.Select(ts => new TaskStatusDTO 
        {
            Id = ts.Id,
            Name = ts.Name,
            IsDefault = ts.IsDefault
        }).ToList();

        return Ok(taskStatusDTOS);
    }

    [Authorize]
    [HttpPost("{projectId}/TaskStatus")]
    public async Task<IActionResult> AddTaskStatus(int projectId, AddTaskStatusRequest addTaskStatusRequest)
    {
        var projectExists = await dbContext.Projects.AnyAsync(p => p.ProjectId == projectId);

        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Add task status");

        if (!hasPermission)
        {
            return Forbid("Insufficient permissions");
        }

        if (!projectExists)
        {
            return NotFound(new { message = "Project with given id not found." });
        } 
        
        var alreadyExists = await dbContext.TaskStatuses
            .AnyAsync(ts => ts.ProjectTaskStatuses.Any(pts => pts.ProjectId == projectId) &&
                       ts.Name == addTaskStatusRequest.Name);

        if (alreadyExists)
        {
            return Conflict(new { message = "Task Status with given name already exists." });
        }
        
        var taskStatus = new TaskStatus
        {
            Name = addTaskStatusRequest.Name
        };

        dbContext.TaskStatuses.Add(taskStatus);
        await dbContext.SaveChangesAsync();

        var projectTaskStatus = new ProjectTaskStatus
        {
            ProjectId = projectId,
            TaskStatusId = taskStatus.Id
        };

        dbContext.ProjectTaskStatuses.Add(projectTaskStatus);
        await dbContext.SaveChangesAsync();

        var taskStatusDTO = new TaskStatusDTO
        {
            Id = taskStatus.Id,
            Name = taskStatus.Name,
            IsDefault = taskStatus.IsDefault
        };

        return Ok(taskStatusDTO);
    }

    [Authorize]
    [HttpDelete("{projectId}/TaskStatus/{taskStatusId}")]
    public async Task<IActionResult> DeleteTaskStatus(int projectId, int taskStatusId)
    {
        var projectTaskStatus = await dbContext.ProjectTaskStatuses
            .FirstOrDefaultAsync(pts => pts.ProjectId == projectId && pts.TaskStatusId == taskStatusId);

        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Remove task status");

        if (!hasPermission)
        {
            return Forbid("Insufficient permissions");
        }

        if (projectTaskStatus == null)
        {
            return NotFound(new { message = "Project with given id does not exist or this task status does not belong to it." });
        }
        
        var taskStatus = await dbContext.TaskStatuses
            .Include(ts => ts.ProjectTasks)
            .FirstOrDefaultAsync(ts => ts.Id == taskStatusId);

        if (taskStatus == null)
        {
            return NotFound(new { message = "Task Status with given id does not exist." });
        }

        if (taskStatus.IsDefault)
        {
            return BadRequest(new { message = "It's forbidden to delete this task status." });
        }

        if (taskStatus.ProjectTasks.Count > 0)
        {
            return BadRequest(new { message = "There are tasks in given project with this task status." });
        }

        dbContext.ProjectTaskStatuses.Remove(projectTaskStatus);
        dbContext.TaskStatuses.Remove(taskStatus);

        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Success." });

    }

    [Authorize]
    [HttpPut("{projectId}/TaskStatus/{taskStatusId}")]
    public async Task<IActionResult> UpdateTaskStatus(int projectId, int taskStatusId, UpdateTaskStatusRequest updateTaskStatusRequest)
    {
        var projectTaskStatus = await dbContext.ProjectTaskStatuses
            .FirstOrDefaultAsync(pts => pts.ProjectId == projectId && pts.TaskStatusId == taskStatusId);

        var hasPermission = await _permissionService.HasProjectPermissionAsync(projectId, "Change task status");

        if (!hasPermission)
        {
            return Forbid("Insufficient permissions");
        }

        if (projectTaskStatus == null)
        {
            return NotFound(new { message = "Project with given id does not exist or this task status does not belong to it." });
        }
        
        var taskStatus = await dbContext.TaskStatuses
            .FirstOrDefaultAsync(ts => ts.Id == taskStatusId);

        if (taskStatus == null)
        {
            return NotFound(new { message = "Task Status with given id does not exist." });
        }

        if (taskStatus.IsDefault)
        {
            return Conflict(new { message = "It's forbidden to change name of this task status." });
        }

        taskStatus.Name = updateTaskStatusRequest.Name;

        await dbContext.SaveChangesAsync();

        return Ok(new TaskStatusDTO
        {
            Id = taskStatus.Id,
            Name = taskStatus.Name,
            IsDefault = taskStatus.IsDefault
        });
    }
}