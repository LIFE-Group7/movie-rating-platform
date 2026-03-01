namespace MovieRating.Backend.Common;

// Enums should be used to provide meaningful context to state.
public enum ErrorType { None, Validation, Conflict, NotFound, Unauthorized, Failure, Forbidden }

// This acts as a 'Data Transfer Object' (DTO) for operation outcomes.
// Use of static factory methods (Success/Failure) improves readability over direct constructor calls.
public record Result(bool IsSuccess, string? Error, ErrorType Type = ErrorType.None)
{
    public static Result Success() => new(true, null);
    public static Result Failure(string error, ErrorType type) => new(false, error, type);
}

// Generic Result pattern avoids returning 'null' and forces the caller 
// to acknowledge the success state before accessing Data.
public record Result<T>(bool IsSuccess, T? Data, string? Error, ErrorType Type = ErrorType.None)
{
    public static Result<T> Success(T data) => new(true, data, null);
    public static Result<T> Failure(string error, ErrorType type) => new(false, default, error, type);
}