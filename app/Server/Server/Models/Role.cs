using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class Role
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RoleId { get; set; }
        [Required]
        public string RoleName { get; set; }
        [Required]
        public bool IsDefault { get; set; } = false;
        [Required] 
        public bool IsFallback { get; set; } = false; // Rola na koju će korisnik da se smesti ako se obriše ona na kojoj je trenutno

        public ICollection<Member> Members { get; set; } = new List<Member>();
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
