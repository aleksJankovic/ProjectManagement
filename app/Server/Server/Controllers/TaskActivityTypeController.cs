using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request.TaskActivityType;
using Server.Models;

namespace Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TaskActivityTypeController : ControllerBase
    {
        private readonly LogicTenacityDbContext dbContext;

        public TaskActivityTypeController(LogicTenacityDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetTaskActivityTypes()
        {
            var activityTypes = await dbContext.TaskActivityTypes.ToListAsync();
            var activityTypesDTO = activityTypes.Select(t => new TaskActivityTypeDTO
            {
                TaskActivityTypeId = t.TaskActivityTypeId,
                TaskActivityTypeName = t.TaskActivityName
            }).ToList();

            return Ok(activityTypesDTO);
        }

        [HttpPost]
        public async Task<IActionResult> AddTaskActivityTypes(AddTaskActivityTypeRequest addTaskActivityTypeRequest)
        {
            var taskActivityType = new TaskActivityType()
            {
                TaskActivityName = addTaskActivityTypeRequest.TaskActivityName
            };

            dbContext.TaskActivityTypes.Add(taskActivityType);
            await dbContext.SaveChangesAsync();

            var taskActivityTypeDTO = new TaskActivityTypeDTO
            {
                TaskActivityTypeId = taskActivityType.TaskActivityTypeId,
                TaskActivityTypeName = taskActivityType.TaskActivityName
            };

            return Ok(taskActivityTypeDTO);
        }

        [HttpGet("{taskActivityTypeId}")]
        public IActionResult GetTaskActivityType(int taskActivityTypeId)
        {
            var taskActivityType = dbContext.TaskActivityTypes.SingleOrDefault(t => t.TaskActivityTypeId == taskActivityTypeId);

            if (taskActivityType == null)
            {
                return NotFound(new { message = "Task activity type not found" });
            }

            var taskActivityTypeDTO = new TaskActivityTypeDTO
            {
                TaskActivityTypeId = taskActivityType.TaskActivityTypeId,
                TaskActivityTypeName = taskActivityType.TaskActivityName
            };

            return Ok(taskActivityTypeDTO);
        }

        [HttpDelete("{taskActivityTypeId}")]
        public async Task<IActionResult> DeleteTaskActivityType(int taskActivityTypeId)
        {
            var taskActivityType = await dbContext.TaskActivityTypes.FindAsync(taskActivityTypeId);

            if (taskActivityType == null)
            {
                return NotFound(new { message = "Task activitytype not found" });
            }

            dbContext.TaskActivityTypes.Remove(taskActivityType);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Success." });
        }
    }

}
