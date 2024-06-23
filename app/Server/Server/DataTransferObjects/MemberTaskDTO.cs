namespace Server.DataTransferObjects
{
    public class MemberTaskDTO
    {
        public int MemberId { get; set; }
        public int TaskId { get; set; }
        public MemberDTO Member { get; set; }
        public ProjectTaskDTO Task { get; set; }
    }
}
