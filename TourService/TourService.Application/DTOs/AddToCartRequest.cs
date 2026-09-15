namespace TourService.Application.DTOs;

public class AddToCartRequest
{
    public string TouristId { get; set; } = string.Empty;
    public string TourId { get; set; } = string.Empty;
}