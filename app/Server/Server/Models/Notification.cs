using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models;

public class Notification
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    [Required]
    public String Title { get; set; }
    
    [Required]
    public String Description { get; set; }

    [Required] 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required] 
    public bool IsRead { get; set; } = false;
    
    public int MemberId { get; set; }
    
    public Member Member { get; set; }
}