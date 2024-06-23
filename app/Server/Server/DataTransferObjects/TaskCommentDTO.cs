namespace Server.DataTransferObjects;

public class TaskCommentDTO
{
    public int TaskId { get; set; }
    public int TaskCommentId { get; set; }
    public int WriterId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Text { get; set; }
    public string WriterFirstName { get; set; }
    public string WriterLastName { get; set; }
    
}