using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Framework;
using Server.Models;

namespace Server.DataTransferObjects
{
    public class MemberDTO
    {
        [Required]
        public int Id { get; set; }
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public int RoleId { get; set; } 
        
        public String Linkedin { get; set; } = String.Empty;

        public String Github { get; set; } = String.Empty;

        public String Status { get; set; } = String.Empty;

        public bool IsDisabled { get; set; } = false;

        public String PhoneNumber { get; set; } = String.Empty;
        
        public String Country { get; set; } = String.Empty;
        
        public String City { get; set; } = String.Empty;

        public DateTime DateOfBirth { get; set; } = DateTime.UnixEpoch;

        public DateTime DateAdded { get; set; } = DateTime.UnixEpoch;

        [Required]
        public string RoleName { get; set; } = String.Empty;

        public String? ProjectRoleName { get; set; }

        public int? ProjectRoleId { get; set; }
    }
}
