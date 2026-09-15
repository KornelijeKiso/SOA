namespace TourService.Domain.Models;

public class KeyPoint
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
}