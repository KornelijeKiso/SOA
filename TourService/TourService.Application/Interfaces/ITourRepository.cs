using TourService.Domain.Models;

namespace TourService.Application.Interfaces;

public interface ITourRepository
{
    Task<Tour> CreateAsync(Tour tour);
    Task<List<Tour>> GetByGuideIdAsync(string guideId);
    Task<Tour?> GetByIdAsync(string id);
    Task<List<Tour>> GetPublishedAsync();
    Task UpdateAsync(Tour tour);
}