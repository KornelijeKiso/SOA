using TourService.Application.DTOs;
using TourService.Application.Interfaces;
using TourService.Domain.Models;
using TourService.Domain.Enums;

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
        tour.IsPurchased = purchased;

        if (!purchased)
            tour.KeyPoints = tour.KeyPoints.Take(1).ToList();

        return tour;
    }

    public async Task<Tour?> PublishTourAsync(string tourId, PublishTourRequest request)
    {
        var tour = await _tourRepository.GetByIdAsync(tourId);

        if (tour == null || tour.GuideId != request.GuideId || tour.Status != TourStatus.Draft)
            return null;

        tour.Price = request.Price;
        tour.Length = request.Length;
        tour.Duration = request.Duration;
        if (request.Images != null)
            tour.Images = request.Images;
        tour.Status = TourStatus.Published;

        await _tourRepository.UpdateAsync(tour);
        return tour;
    }

    public async Task<Tour?> ArchiveTourAsync(string tourId, ArchiveTourRequest request)
    {
        var tour = await _tourRepository.GetByIdAsync(tourId);

        if (tour == null || tour.GuideId != request.GuideId)
            return null;

        tour.Status = TourStatus.Archived;

        await _tourRepository.UpdateAsync(tour);
        return tour;
    }

    public async Task<List<Tour>> GetPublishedToursForTouristAsync(string touristId)
    {
        var tours = await _tourRepository.GetPublishedAsync();

        foreach (var tour in tours)
        {
            var purchased = await _purchaseTokenRepository.ExistsAsync(touristId, tour.Id!);
            tour.IsPurchased = purchased;
            if (!purchased)
                tour.KeyPoints = tour.KeyPoints.Take(1).ToList();
        }

        return tours;
    }

    public async Task<Tour?> AddKeyPointAsync(string tourId, string guideId, AddKeyPointRequest request)
    {
        var tour = await _tourRepository.GetByIdAsync(tourId);

        if (tour == null)
            return null;

        if (tour.GuideId != guideId)
            throw new UnauthorizedAccessException("Only the author may add key points.");

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