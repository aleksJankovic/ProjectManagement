namespace Server.DataTransferObjects
{
    public class TaskActivityDTO
    {
        public string ProjectName { get; set; }
        public int TaskActivityId { get; set; }

        public int WorkerId { get; set; }

        public string Name { get; set; }
        
        public string Lastname { get; set; }
        
        public string RoleName { get; set; }
        
        public string Email { get; set; }
        
        public string Country { get; set;}
        
        public DateTime DateOfBirth { get; set; }

        public int TaskId { get; set; }
        
        public int ProjectId { get; set; }

        public DateTime DateModify { get; set; }
        public string Comment { get; set; }

        public int TaskActivityTypeId { get; set; }

        public int PercentageComplete { get; set; }
        
        public String TaskName { get; set; }
    }
}
