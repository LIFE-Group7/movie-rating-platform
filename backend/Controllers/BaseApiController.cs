using Microsoft.AspNetCore.Mvc;
using MovieRating.Backend.Common;

namespace MovieRating.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected IActionResult HandleError<T>(Result<T> result)    
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