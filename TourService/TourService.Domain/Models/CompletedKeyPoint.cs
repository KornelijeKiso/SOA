namespace TourService.Domain.Models;

public class CompletedKeyPoint
{
    public string KeyPointId { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}