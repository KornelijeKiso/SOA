using TourService.Domain.Models;

namespace TourService.Application.Interfaces;

public interface IPurchaseTokenRepository
{
    Task<TourPurchaseToken> CreateAsync(TourPurchaseToken token);
    Task<bool> ExistsAsync(string touristId, string tourId);
}