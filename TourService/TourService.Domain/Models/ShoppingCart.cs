using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TourService.Domain.Models;

public class ShoppingCart
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string TouristId { get; set; } = string.Empty;

    public List<CartItem> Items { get; set; } = new();

    public double TotalPrice { get; set; }
}