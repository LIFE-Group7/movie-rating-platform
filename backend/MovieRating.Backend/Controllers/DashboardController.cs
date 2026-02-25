using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MovieRating.Backend.Controllers;

[Authorize (Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : BaseApiController
{
    
}