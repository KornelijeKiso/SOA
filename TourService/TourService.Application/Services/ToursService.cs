using TourService.Application.DTOs;
using TourService.Application.Interfaces;
using TourService.Domain.Models;

namespace TourService.Application.Services;

public class ToursService
{
    private readonly ITourRepository _tourRepository;
    private readonly IPurchaseTokenRepository _purchaseTokenRepository;

    public ToursService(
        ITourRepository tourRepository,
        IPurchaseTokenRepository purchaseTokenRepository)
    {
        _tourRepository = tourRepository;
        _purchaseTokenRepository = purchaseTokenRepository;
    }

    public async Task<Tour> CreateTourAsync(CreateTourRequest request)
    {
        var tour = new Tour
        {
            GuideId = request.GuideId,
            Name = request.Name,
            Description = request.Description,
            Difficulty = request.Difficulty,
            Tags = request.Tags
        };

        return await _tourRepository.CreateAsync(tour);
    }

    public async Task<List<Tour>> GetGuideToursAsync(string guideId)
    {
        return await _tourRepository.GetByGuideIdAsync(guideId);
    }

    public async Task<Tour?> GetTourForTouristAsync(string touristId, string tourId)
    {
        var tour = await _tourRepository.GetByIdAsync(tourId);

        if (tour == null)
            return null;

        var purchased = await _purchaseTokenRepository.ExistsAsync(touristId, tourId);

        if (!purchased)
            tour.KeyPoints = new List<KeyPoint>();

        return tour;
    }

    public async Task<Tour?> AddKeyPointAsync(string tourId, AddKeyPointRequest request)
    {
        var tour = await _tourRepository.GetByIdAsync(tourId);

        if (tour == null)
            return null;

        tour.KeyPoints.Add(new KeyPoint
        {
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Name = request.Name,
            Description = request.Description,
            Image = request.Image
        });

        await _tourRepository.UpdateAsync(tour);

        return tour;
    }
}