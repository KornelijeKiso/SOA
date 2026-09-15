using Microsoft.AspNetCore.Mvc;
using TourService.Api.Identity;
using TourService.Application.DTOs;
using TourService.Application.Services;

namespace TourService.Api.Controllers;

[ApiController]
[GatewayRole("TOURIST")]
[Route("api/positions")]
public class PositionController : ControllerBase
{
    private readonly PositionService _positionService;

    public PositionController(PositionService positionService)
    {
        _positionService = positionService;
    }

    [HttpPost]
    public async Task<IActionResult> SetPosition(SetPositionRequest request)
    {
        request.TouristId = HttpContext.GetGatewayEmail();
        var position = await _positionService.SetPositionAsync(request);
        return Ok(position);
    }

    [HttpGet("{touristId}")]
    public async Task<IActionResult> GetPosition(string touristId)
    {
        var position = await _positionService.GetPositionAsync(HttpContext.GetGatewayEmail());

        if (position == null)
            return NotFound();

        return Ok(position);
    }
}