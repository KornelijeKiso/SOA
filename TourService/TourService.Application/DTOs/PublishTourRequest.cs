namespace TourService.Application.DTOs;

public class PublishTourRequest
{
    public string GuideId { get; set; } = string.Empty;
    public double Price { get; set; }
    public double Length { get; set; }
    public int Duration { get; set; }
    public List<string>? Images { get; set; }
}
