namespace MovieRating.Backend.Common;

public enum ErrorType
{
    None,
    Validation,     // 400
    Conflict,       // 409
    NotFound,       // 404
    Unauthorized,   // 401
    Failure         // 500
}

// Result wrapper for void methods
public record Result(bool IsSuccess, string? Error, ErrorType Type = ErrorType.None)
{
    public static Result Success() => new(true, null);
    public static Result Failure(string error, ErrorType type) => new(false, error, type);
}

// Result wrapper for methods returning data
public record Result<T>(bool IsSuccess, T? Data, string? Error, ErrorType Type = ErrorType.None)
{
    public static Result<T> Success(T data) => new(true, data, null);
    public static Result<T> Failure(string error, ErrorType type) => new(false, default, error, type);
}