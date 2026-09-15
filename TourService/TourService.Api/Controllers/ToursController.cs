using Microsoft.AspNetCore.Mvc;
using TourService.Api.Identity;
using TourService.Application.DTOs;
using TourService.Application.Services;

namespace TourService.Api.Controllers;

[ApiController]
[Route("api/tours")]
public class ToursController : ControllerBase
{
    private readonly ToursService _toursService;

    public ToursController(ToursService toursService)
    {
        _toursService = toursService;
    }

    [HttpPost]
    [GatewayRole("GUIDE")]
    public async Task<IActionResult> CreateTour(CreateTourRequest request)
    {
        request.GuideId = HttpContext.GetGatewayEmail();
        var tour = await _toursService.CreateTourAsync(request);
        return Ok(tour);
    }

    [HttpGet("guide/{guideId}")]
    [GatewayRole("GUIDE")]
    public async Task<IActionResult> GetGuideTours(string guideId)
    {
        var tours = await _toursService.GetGuideToursAsync(HttpContext.GetGatewayEmail());
        return Ok(tours);
    }

    [HttpGet("{tourId}/tourist/{touristId}")]
    [GatewayRole("TOURIST")]
    public async Task<IActionResult> GetTourForTourist(string tourId, string touristId)
    {
        var tour = await _toursService.GetTourForTouristAsync(HttpContext.GetGatewayEmail(), tourId);

        if (tour == null)
            return NotFound();

        return Ok(tour);
    }

    [HttpPost("{tourId}/publish")]
    [GatewayRole("GUIDE")]
    public async Task<IActionResult> PublishTour(string tourId, PublishTourRequest request)
    {
        request.GuideId = HttpContext.GetGatewayEmail();
        var tour = await _toursService.PublishTourAsync(tourId, request);

        if (tour == null)
            return BadRequest("Tour must exist, belong to the supplied guide, and be Draft.");

        return Ok(tour);
    }

    [HttpPost("{tourId}/archive")]
    [GatewayRole("GUIDE")]
    public async Task<IActionResult> ArchiveTour(string tourId, ArchiveTourRequest request)
    {
        request.GuideId = HttpContext.GetGatewayEmail();
        var tour = await _toursService.ArchiveTourAsync(tourId, request);

        if (tour == null)
            return BadRequest("Tour must exist and belong to the supplied guide.");

        return Ok(tour);
    }

    [HttpGet("published")]
    [GatewayRole("TOURIST")]
    public async Task<IActionResult> GetPublishedTours([FromQuery] string touristId)
    {
        var tours = await _toursService.GetPublishedToursForTouristAsync(HttpContext.GetGatewayEmail());
        return Ok(tours);
    }

    [HttpPost("{tourId}/key-points")]
    [GatewayRole("GUIDE")]
    public async Task<IActionResult> AddKeyPoint(string tourId, AddKeyPointRequest request)
    {
        TourService.Domain.Models.Tour? tour;
        try
        {
            tour = await _toursService.AddKeyPointAsync(tourId, HttpContext.GetGatewayEmail(), request);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Only the author may add key points." });
        }

        if (tour == null)
            return NotFound();

        return Ok(tour);
    }
}