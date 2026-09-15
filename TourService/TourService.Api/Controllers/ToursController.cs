using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> CreateTour(CreateTourRequest request)
    {
        var tour = await _toursService.CreateTourAsync(request);
        return Ok(tour);
    }

    [HttpGet("guide/{guideId}")]
    public async Task<IActionResult> GetGuideTours(string guideId)
    {
        var tours = await _toursService.GetGuideToursAsync(guideId);
        return Ok(tours);
    }

    [HttpGet("{tourId}/tourist/{touristId}")]
    public async Task<IActionResult> GetTourForTourist(string tourId, string touristId)
    {
        var tour = await _toursService.GetTourForTouristAsync(touristId, tourId);

        if (tour == null)
            return NotFound();

        return Ok(tour);
    }

    [HttpPost("{tourId}/key-points")]
    public async Task<IActionResult> AddKeyPoint(string tourId, AddKeyPointRequest request)
    {
        var tour = await _toursService.AddKeyPointAsync(tourId, request);

        if (tour == null)
            return NotFound();

        return Ok(tour);
    }
}