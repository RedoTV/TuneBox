using System.ComponentModel.DataAnnotations;

namespace TuneBox.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [EmailAddress]
    public required string Email { get; set; }

    public required string Name { get; set; }
    public required string HashedPassword { get; set; }
    public required string Salt { get; set; }
    public required string Role { get; set; }
}