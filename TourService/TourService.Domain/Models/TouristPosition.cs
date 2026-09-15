using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TourService.Domain.Models;

public class TouristPosition
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string TouristId { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}