namespace Server.DataTransferObjects.Request.TaskComment;

public class AddTaskCommentRequest
{
    public int TaskId { get; set; }
    public string Text { get; set; }
}