using Microsoft.AspNetCore.Mvc;
using TourService.Api.Identity;
using TourService.Application.DTOs;
using TourService.Application.Services;

namespace TourService.Api.Controllers;

[ApiController]
[GatewayRole("TOURIST")]
[Route("api/executions")]
public class TourExecutionController : ControllerBase
{
    private readonly TourExecutionService _executionService;

    public TourExecutionController(TourExecutionService executionService)
    {
        _executionService = executionService;
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartTour(StartTourRequest request)
    {
        request.TouristId = HttpContext.GetGatewayEmail();
        var execution = await _executionService.StartTourAsync(request);

        if (execution == null)
            return BadRequest("Tour must exist, be Published or Archived, and be purchased by the tourist. A current position must be defined before creating an execution.");

        return Ok(execution);
    }

    [HttpPost("{touristId}/{tourId}/abandon")]
    public async Task<IActionResult> AbandonTour(string touristId, string tourId)
    {
        var execution = await _executionService.AbandonTourAsync(HttpContext.GetGatewayEmail(), tourId);

        if (execution == null)
            return NotFound();

        return Ok(execution);
    }

    [HttpPost("{touristId}/{tourId}/complete")]
    public async Task<IActionResult> CompleteTour(string touristId, string tourId)
    {
        var execution = await _executionService.CompleteTourAsync(HttpContext.GetGatewayEmail(), tourId);

        if (execution == null)
            return NotFound();

        return Ok(execution);
    }

    [HttpPost("location-update")]
    public async Task<IActionResult> UpdateLocation(LocationUpdateRequest request)
    {
        request.TouristId = HttpContext.GetGatewayEmail();
        var execution = await _executionService.UpdateLocationAsync(request);

        if (execution == null)
            return NotFound();

        return Ok(execution);
    }
}