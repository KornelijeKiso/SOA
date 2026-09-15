using TourService.Domain.Models;

namespace TourService.Application.Interfaces;

public interface IShoppingCartRepository
{
    Task<ShoppingCart?> GetByTouristIdAsync(string touristId);
    Task<ShoppingCart> SaveAsync(ShoppingCart cart);
    Task DeleteAsync(string cartId);
}