using Server.DataTransferObjects;
using Server.DataTransferObjects.Request.File;
using Server.Models;

namespace Server.Services.File
{
    public interface IFileService
    {
        public Task<Models.File> PostFileAsync(int uploaderId, AddFileRequest fileData);

        public Task<List<Models.File>> PostMultiFileAsync(int uploaderId, AddFilesRequest fileData);

        public Task<(byte[], string)> GetFileData(int fileId);

        public Task DeleteFile(int fileId);
    }
}