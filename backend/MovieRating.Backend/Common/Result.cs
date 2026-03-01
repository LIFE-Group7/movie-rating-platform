namespace MovieRating.Backend.Common;

public enum ErrorType { None, Validation, Conflict, NotFound, Unauthorized, Failure, Forbidden }

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