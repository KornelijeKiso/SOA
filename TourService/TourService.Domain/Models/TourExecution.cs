using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TourService.Domain.Models;

public class TourExecution
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string TouristId { get; set; } = string.Empty;
    public string TourId { get; set; } = string.Empty;

    public string Status { get; set; } = "Started";

    public DateTime StartTime { get; set; } = DateTime.UtcNow;
    public DateTime? CompletionTime { get; set; }
    public DateTime? AbandonmentTime { get; set; }

    public DateTime LastActivity { get; set; } = DateTime.UtcNow;

    public List<CompletedKeyPoint> CompletedKeyPoints { get; set; } = new();
}