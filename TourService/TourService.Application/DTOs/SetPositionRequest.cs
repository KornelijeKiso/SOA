namespace TourService.Application.DTOs;

public class SetPositionRequest
{
    public string TouristId { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }
}