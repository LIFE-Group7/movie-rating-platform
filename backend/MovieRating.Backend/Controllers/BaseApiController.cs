using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Common;

namespace MovieRating.Backend.Controllers;

// A shared base class for controllers to inherit from, keeping common logic in one place
[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    // Handles errors for generic Result<T> types (when data was expected but an error occurred)
    protected IActionResult HandleError<T>(Result<T> result)
    {
        // Maps our internal application error types to standard HTTP status codes
        var statusCode = result.Type switch
        {
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status500InternalServerError // Fallback for unexpected errors
        };

        // Packages the error into a standardized format for the client to read
        return Problem(detail: result.Error, statusCode: statusCode, title: result.Type.ToString());
    }

    // Handles errors for standard Result types (when only success/failure matters)
    protected IActionResult HandleError(Result result)
    {
        var statusCode = result.Type switch
        {
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status500InternalServerError
        };

        return Problem(detail: result.Error, statusCode: statusCode, title: result.Type.ToString());
    }
}