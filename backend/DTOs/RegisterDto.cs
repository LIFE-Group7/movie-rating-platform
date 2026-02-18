using System.ComponentModel; // Required for [DefaultValue]
using System.ComponentModel.DataAnnotations;
using MovieRating.Backend.Validation;

namespace MovieRating.Backend.DTOs;

public class RegisterDto
{
    [Required]
    [MaxLength(50)]
    public required string Username { get; set; }

    [Required]
    [EmailAddress] // Native validation
    [RegularExpression(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", ErrorMessage = "Invalid email format.")]
    [DefaultValue("string@email.com")] 
    public required string Email { get; set; }

    [Required]
    [StrongPassword]
    public required string Password { get; set; }
}