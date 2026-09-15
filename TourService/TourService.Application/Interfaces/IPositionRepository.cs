using TourService.Domain.Models;

namespace TourService.Application.Interfaces;

public interface IPositionRepository
{
    Task<TouristPosition?> GetByTouristIdAsync(string touristId);
    Task<TouristPosition> UpsertAsync(TouristPosition position);
}