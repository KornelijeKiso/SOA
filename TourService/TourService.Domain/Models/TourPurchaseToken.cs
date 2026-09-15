using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TourService.Domain.Models;

public class TourPurchaseToken
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string TouristId { get; set; } = string.Empty;

    public string TourId { get; set; } = string.Empty;
    public string TourName { get; set; } = string.Empty;

    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
}