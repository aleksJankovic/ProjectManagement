using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DataTransferObjects;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectPriorityController : ControllerBase
    {
        private readonly LogicTenacityDbContext _dbContext;

        public ProjectPriorityController(LogicTenacityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetProjectPriority()
        {
            var projectPriority = await _dbContext.ProjectPriorities.ToListAsync();
            var projectPriorityDTO = projectPriority.Select(p => new ProjectPriorityDTO
            {
                PriorityId = p.ProjectPriorityId,
                PriorityName = p.Name,
                Color = p.PriorityColorHex
            }).ToList();
            return Ok(projectPriorityDTO);
        }

        [HttpGet("{projectPriorityId}")]
        public IActionResult GetProjectPriorityName(int projectPriorityId)
        {

            var projectPriority = _dbContext.ProjectPriorities.SingleOrDefault(p => p.ProjectPriorityId == projectPriorityId);

            if (projectPriority == null)
            {
                return NotFound(new { message = "Project priority not found." });
            }

            var projectPriorityDTO = new ProjectPriorityDTO
            {
                PriorityId= projectPriority.ProjectPriorityId,
                PriorityName = projectPriority.Name,
                Color = projectPriority.PriorityColorHex
            };
            return Ok(projectPriorityDTO);
        }

    }
}
