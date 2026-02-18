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
    [EmailAddress] 
    [RegularExpression(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", ErrorMessage = "Invalid email format.")]
    [MaxLength(100)]
    public required string Email { get; set; }

    [Required]
    [StrongPassword]
    [MaxLength(100)]
    public required string Password { get; set; }
}