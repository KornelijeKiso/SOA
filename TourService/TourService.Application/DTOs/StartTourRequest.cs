namespace TourService.Application.DTOs;

public class StartTourRequest
{
    public string TouristId { get; set; } = string.Empty;
    public string TourId { get; set; } = string.Empty;
}