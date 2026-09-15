using MongoDB.Driver;
using TourService.Application.Interfaces;
using TourService.Domain.Models;
using TourService.Infrastructure.Mongo;

namespace TourService.Infrastructure.Repositories;

public class TourRepository : ITourRepository
{
    private readonly IMongoCollection<Tour> _tours;

    public TourRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _tours = database.GetCollection<Tour>("tours");
    }

    public async Task<Tour> CreateAsync(Tour tour)
    {
        await _tours.InsertOneAsync(tour);
        return tour;
    }

    public async Task<List<Tour>> GetByGuideIdAsync(string guideId)
    {
        return await _tours.Find(t => t.GuideId == guideId).ToListAsync();
    }

    public async Task<Tour?> GetByIdAsync(string id)
    {
        return await _tours.Find(t => t.Id == id).FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(Tour tour)
    {
        await _tours.ReplaceOneAsync(t => t.Id == tour.Id, tour);
    }
}