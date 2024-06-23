using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class Member
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "First name is required.")]
        public string FirstName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Last name is required.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } = string.Empty;
    
        [Required]
        public bool IsDisabled { get; set; } = false;
        
        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        public Role Role { get; set; }
        
        public string? RefreshToken { get; set; }
        
        public DateTime? RefreshTokenExpiresAt { get; set; }

        public String Linkedin { get; set; } = String.Empty;

        public String Github { get; set; } = String.Empty;

        public String Status { get; set; } = String.Empty;

        public String PhoneNumber { get; set; } = String.Empty;
        
        public String Country { get; set; } = String.Empty;
        
        public String City { get; set; } = String.Empty;
        
        public DateTime DateAdded { get; set; } = DateTime.Now;

        public DateTime DateOfBirth { get; set; } = DateTime.UnixEpoch;
        
        public int? AvatarId { get; set; }
        
        public File? Avatar { get; set; }
        
        public ICollection<Project> ProjectsLead { get; set; } = new List<Project>();

        public ICollection<ProjectTask> TasksLead { get; set; } = new List<ProjectTask>();
        public ICollection<MemberTask> Tasks { get; set; } = new List<MemberTask>();

        public ICollection<MemberProject> MemberProjects { get; set; } = new List<MemberProject>();

        public ICollection<File> UploadedFiles { get; set; } = new List<File>();

        public ICollection<TaskActivity> TaskActivities { get; set; } = new List<TaskActivity>();

        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        public string? PasswordToken { get; set; }

        public DateTime? PasswordTokenExpiresAt { get; set; }

        public ICollection<TaskComment> TaskComments { get; set; } = new List<TaskComment>();
    }
}
