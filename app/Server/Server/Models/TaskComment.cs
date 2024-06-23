using System;

namespace Server.Models
{
    public class TaskComment
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }

        public int MemberTaskId { get; set; }
        public int MemberId { get; set; }
        public Member Member { get; set; }

        public int TaskId { get; set; }
        public ProjectTask Task { get; set; }
    }
}
