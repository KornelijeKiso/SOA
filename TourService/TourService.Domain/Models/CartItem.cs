namespace TourService.Domain.Models;

public class CartItem
{
    public string TourId { get; set; } = string.Empty;
    public string TourName { get; set; } = string.Empty;
    public double Price { get; set; }
}