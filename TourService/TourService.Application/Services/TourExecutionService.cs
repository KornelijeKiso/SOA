using TourService.Application.DTOs;
using TourService.Application.Interfaces;
using TourService.Domain.Models;

namespace TourService.Application.Services;

public class TourExecutionService
{
    private readonly ITourExecutionRepository _executionRepository;
    private readonly ITourRepository _tourRepository;
    private readonly IPurchaseTokenRepository _purchaseTokenRepository;

    private const double KeyPointCompletionDistanceKm = 0.1;

    public TourExecutionService(
        ITourExecutionRepository executionRepository,
        ITourRepository tourRepository,
        IPurchaseTokenRepository purchaseTokenRepository)
    {
        _executionRepository = executionRepository;
        _tourRepository = tourRepository;
        _purchaseTokenRepository = purchaseTokenRepository;
    }

    public async Task<TourExecution?> StartTourAsync(StartTourRequest request)
    {
        var purchased = await _purchaseTokenRepository.ExistsAsync(
            request.TouristId,
            request.TourId
        );

        if (!purchased)
            return null;

        var existing = await _executionRepository.GetActiveAsync(
            request.TouristId,
            request.TourId
        );

        if (existing != null)
            return existing;

        var execution = new TourExecution
        {
            TouristId = request.TouristId,
            TourId = request.TourId,
            Status = "Started",
            StartTime = DateTime.UtcNow,
            LastActivity = DateTime.UtcNow
        };

        return await _executionRepository.CreateAsync(execution);
    }

    public async Task<TourExecution?> AbandonTourAsync(string touristId, string tourId)
    {
        var execution = await _executionRepository.GetActiveAsync(touristId, tourId);

        if (execution == null)
            return null;

        execution.Status = "Abandoned";
        execution.AbandonmentTime = DateTime.UtcNow;
        execution.LastActivity = DateTime.UtcNow;

        await _executionRepository.UpdateAsync(execution);

        return execution;
    }

    public async Task<TourExecution?> CompleteTourAsync(string touristId, string tourId)
    {
        var execution = await _executionRepository.GetActiveAsync(touristId, tourId);

        if (execution == null)
            return null;

        execution.Status = "Completed";
        execution.CompletionTime = DateTime.UtcNow;
        execution.LastActivity = DateTime.UtcNow;

        await _executionRepository.UpdateAsync(execution);

        return execution;
    }

    public async Task<TourExecution?> UpdateLocationAsync(LocationUpdateRequest request)
    {
        var execution = await _executionRepository.GetActiveAsync(
            request.TouristId,
            request.TourId
        );

        if (execution == null)
            return null;

        var tour = await _tourRepository.GetByIdAsync(request.TourId);

        if (tour == null)
            return null;

        execution.LastActivity = DateTime.UtcNow;

        foreach (var keyPoint in tour.KeyPoints)
        {
            var alreadyCompleted = execution.CompletedKeyPoints
                .Any(kp => kp.KeyPointId == keyPoint.Id);

            if (alreadyCompleted)
                continue;

            var distance = CalculateDistanceKm(
                request.Latitude,
                request.Longitude,
                keyPoint.Latitude,
                keyPoint.Longitude
            );

            if (distance <= KeyPointCompletionDistanceKm)
            {
                execution.CompletedKeyPoints.Add(new CompletedKeyPoint
                {
                    KeyPointId = keyPoint.Id,
                    CompletedAt = DateTime.UtcNow
                });
            }
        }

        await _executionRepository.UpdateAsync(execution);

        return execution;
    }

    private static double CalculateDistanceKm(
        double lat1,
        double lon1,
        double lat2,
        double lon2)
    {
        const double earthRadiusKm = 6371;

        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a =
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(ToRadians(lat1)) *
            Math.Cos(ToRadians(lat2)) *
            Math.Sin(dLon / 2) *
            Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return earthRadiusKm * c;
    }

    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
}