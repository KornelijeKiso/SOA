using TourService.Domain.Models;

namespace TourService.Application.Interfaces;

public interface ITourExecutionRepository
{
    Task<TourExecution> CreateAsync(TourExecution execution);
    Task<TourExecution?> GetActiveAsync(string touristId, string tourId);
    Task UpdateAsync(TourExecution execution);
}