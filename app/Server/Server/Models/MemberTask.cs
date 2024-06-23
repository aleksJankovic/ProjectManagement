namespace Server.Models
{
    public class MemberTask
    {
        public int MemberId { get; set; }
        public Member Member { get; set; }

        public int TaskId { get; set; }
        public ProjectTask Task { get; set; }
    }
}
