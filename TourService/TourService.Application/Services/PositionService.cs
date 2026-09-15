using TourService.Application.DTOs;
using TourService.Application.Interfaces;
using TourService.Domain.Models;

namespace TourService.Application.Services;

public class PositionService
{
    private readonly IPositionRepository _positionRepository;

    public PositionService(IPositionRepository positionRepository)
    {
        _positionRepository = positionRepository;
    }

    public async Task<TouristPosition> SetPositionAsync(SetPositionRequest request)
    {
        var position = new TouristPosition
        {
            TouristId = request.TouristId,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            UpdatedAt = DateTime.UtcNow
        };

        return await _positionRepository.UpsertAsync(position);
    }

    public async Task<TouristPosition?> GetPositionAsync(string touristId)
    {
        return await _positionRepository.GetByTouristIdAsync(touristId);
    }
}