using TourService.Domain.Enums;

namespace TourService.Application.DTOs;

public class CreateTourRequest
{
    public string GuideId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public TourDifficulty Difficulty { get; set; }

    public List<string> Tags { get; set; } = new();
}