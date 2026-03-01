using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace MovieRating.Backend.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
public class StrongPasswordAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        var password = value as string;
        if (string.IsNullOrEmpty(password)) return false;

        // Min 6 chars
        if (password.Length < 6) return false;

        // Check for at least one special symbol
        return Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]");
    }

    public override string FormatErrorMessage(string name)
    {
        return $"{name} must be at least 6 characters long and contain at least one special symbol.";
    }
}