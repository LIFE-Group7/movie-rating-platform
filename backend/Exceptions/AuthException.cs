namespace MovieRating.Backend.Exceptions;

// Base Exception
public class AuthException(string message) : Exception(message);

public class ValidationException(string message) : AuthException(message);

public class UserNotFoundException(string username) : AuthException($"User '{username}' was not found.");

public class InvalidCredentialsException() : AuthException("Invalid username or password.");