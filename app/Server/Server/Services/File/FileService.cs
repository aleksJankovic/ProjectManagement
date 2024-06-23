using System.Drawing;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DataTransferObjects;
using Server.DataTransferObjects.Request.File;
using Server.Models;

namespace Server.Services.File
{
    public class FileService : IFileService
    {
        private readonly LogicTenacityDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public FileService(LogicTenacityDbContext dbContextClass, IConfiguration configuration)
        {
            _dbContext = dbContextClass;
            _configuration = configuration;
        }

        public async Task<Models.File> PostFileAsync(int uploaderId, AddFileRequest addFileRequest)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(addFileRequest.FileDetails.FileName);
            var filePath = Path.Combine(_configuration["FileService:StoragePath"], fileName);

            var directory = Path.GetDirectoryName(filePath);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await addFileRequest.FileDetails.CopyToAsync(stream);
            }

            var uploadedFile = new Models.File
            {
                FilePath = filePath,
                UploaderId = uploaderId,
                OriginalName = addFileRequest.FileDetails.FileName
            };

            _dbContext.Files.Add(uploadedFile);

            await _dbContext.SaveChangesAsync();

            return uploadedFile;
        }

        public async Task<List<Models.File>> PostMultiFileAsync(int uploaderId, AddFilesRequest fileDatas)
        {
            var uploadedFiles = new List<Models.File>();

            foreach (var fileData in fileDatas.Files)
            {
                var addFileRequest = new AddFileRequest { FileDetails = fileData };
                var uploadedFile = await PostFileAsync(uploaderId, addFileRequest);
                uploadedFiles.Add(uploadedFile);
            }

            return uploadedFiles;
        }

        public async Task<(byte[], string)> GetFileData(int fileId)
        {
            var file = await _dbContext.Files.FindAsync(fileId);

            if (file == null)
            {
                throw new FileNotFoundException("File not found.");
            }

            if (!System.IO.File.Exists(file.FilePath))
            {
                throw new FileNotFoundException("File not found on disk.");
            }

            var fileContentBytes = System.IO.File.ReadAllBytes(file.FilePath);
            var fileExtension = Path.GetExtension(file.FilePath);
            var contentType = GetContentType(fileExtension);

            return (fileContentBytes, contentType);
        }

        public async Task DeleteFile(int fileId)
        {
            var file = await _dbContext.Files.FindAsync(fileId);

            System.IO.File.Delete(file.FilePath);

            _dbContext.Remove(file);
            await _dbContext.SaveChangesAsync();
        }


        public static string GetContentType(string fileExtension)
        {
            string contentType;

            switch (fileExtension.ToLowerInvariant())
            {
                case ".txt":
                    contentType = "text/plain";
                    break;
                case ".pdf":
                    contentType = "application/pdf";
                    break;
                case ".doc":
                case ".docx":
                    contentType = "application/msword";
                    break;
                case ".xls":
                case ".xlsx":
                    contentType = "application/vnd.ms-excel";
                    break;
                case ".ppt":
                case ".pptx":
                    contentType = "application/vnd.ms-powerpoint";
                    break;
                case ".csv":
                    contentType = "text/csv";
                    break;
                case ".xml":
                    contentType = "application/xml";
                    break;
                case ".json":
                    contentType = "application/json";
                    break;
                case ".html":
                case ".htm":
                    contentType = "text/html";
                    break;
                case ".png":
                    contentType = "image/png";
                    break;
                case ".jpg":
                case ".jpeg":
                    contentType = "image/jpeg";
                    break;
                case ".gif":
                    contentType = "image/gif";
                    break;
                case ".bmp":
                    contentType = "image/bmp";
                    break;
                case ".ico":
                    contentType = "image/x-icon";
                    break;
                case ".mp3":
                    contentType = "audio/mpeg";
                    break;
                case ".wav":
                    contentType = "audio/wav";
                    break;
                case ".mp4":
                    contentType = "video/mp4";
                    break;
                case ".avi":
                    contentType = "video/x-msvideo";
                    break;
                case ".zip":
                    contentType = "application/zip";
                    break;
                case ".rar":
                    contentType = "application/x-rar-compressed";
                    break;
                case ".7z":
                    contentType = "application/x-7z-compressed";
                    break;
                case ".tar":
                    contentType = "application/x-tar";
                    break;
                case ".gz":
                    contentType = "application/gzip";
                    break;
                case ".exe":
                    contentType = "application/octet-stream";
                    break;
                default:
                    contentType = "application/octet-stream"; // Default content type
                    break;
            }

            return contentType;
        }
    }
}

