namespace TourService.Application.DTOs;

public class LocationUpdateRequest
{
    public string TouristId { get; set; } = string.Empty;
    public string TourId { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }
}