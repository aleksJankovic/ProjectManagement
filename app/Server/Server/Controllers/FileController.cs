using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.DataTransferObjects.Request.File;
using Server.Services.File;

namespace Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly LogicTenacityDbContext _dbContext;
        
        public FileController(IFileService fileService, LogicTenacityDbContext dbContext)
        {
            _fileService = fileService;
            _dbContext = dbContext;
        }

        [HttpPost("Single")]
        public async Task<IActionResult> PostSingleFile(AddFileRequest addFileRequest)
        {
            var uploaderId = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (uploaderId == null)
            {
                return BadRequest(new {message =  "Member id claim is missing in jwt token"});
            }
            

            await _fileService.PostFileAsync(int.Parse(uploaderId.Value), addFileRequest);

            return Ok(new { message = "Success." });
        }

        // [HttpPost("Multiple")]
        // public async Task<IActionResult> PostMultipleFile(List<AddFileRequest> addFileRequests)
        // {
        //     var uploaderId = User.Claims.FirstOrDefault(c => c.Type == "Id");
        //
        //     if (uploaderId == null)
        //     {
        //         return BadRequest("Member id claim is missing in jwt token");
        //     }
        //     
        //     await _fileService.PostMultiFileAsync(int.Parse(uploaderId.Value), addFileRequests);
        //
        //     return Ok();
        // }

        [HttpGet("{id}")]
        public async Task<IActionResult> SendFile(int id)
        {
            if (id < 1)
            {
                return BadRequest(new {message = "Bad id."});
            }
            
            try
            {
                var (fileBytes, fileMime) = await _fileService.GetFileData(id);
                return File(fileBytes, fileMime);
            }
            catch (FileNotFoundException)
            {
                return NotFound(new {message = "File not found."});
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFile(int id)
        {
            if (id < 1)
            {
                return BadRequest(new {message = "Bad id."});

            }

            var idClaim = User.Claims.FirstOrDefault(c => c.Type == "Id");

            if (idClaim == null)
            {
                return BadRequest(new { message = "Member id claim is missing in jwt token" });
            }

            var uploaderId = Int32.Parse(idClaim.Value);
            var file = await _dbContext.Files.FindAsync(id);

            if (file == null)
            {
                return NotFound(new {message = "File not found"});
            }

            if (file.UploaderId != uploaderId)
            {
                return Forbid();
            }

            await _fileService.DeleteFile(id);

            return Ok(new { message = "Success." });
        }
    }
}

