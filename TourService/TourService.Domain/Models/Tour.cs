using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using TourService.Domain.Enums;

namespace TourService.Domain.Models;

public class Tour
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string GuideId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public TourDifficulty Difficulty { get; set; }

    public List<string> Tags { get; set; } = new();

    public TourStatus Status { get; set; } = TourStatus.Draft;

    public double Price { get; set; } = 0;

    public double Length { get; set; }

    public int Duration { get; set; }

    public List<string> Images { get; set; } = new();

    public List<string> Reviews { get; set; } = new();

    [BsonIgnore]
    [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
    public bool? IsPurchased { get; set; }

    public List<KeyPoint> KeyPoints { get; set; } = new();
}