using MongoDB.Driver;
using TourService.Application.Interfaces;
using TourService.Domain.Models;
using TourService.Infrastructure.Mongo;

namespace TourService.Infrastructure.Repositories;

public class PositionRepository : IPositionRepository
{
    private readonly IMongoCollection<TouristPosition> _positions;

    public PositionRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _positions = database.GetCollection<TouristPosition>("touristPositions");
    }

    public async Task<TouristPosition?> GetByTouristIdAsync(string touristId)
    {
        return await _positions
            .Find(p => p.TouristId == touristId)
            .FirstOrDefaultAsync();
    }

    public async Task<TouristPosition> UpsertAsync(TouristPosition position)
    {
        var existing = await GetByTouristIdAsync(position.TouristId);

        if (existing == null)
        {
            await _positions.InsertOneAsync(position);
            return position;
        }

        position.Id = existing.Id;
        position.UpdatedAt = DateTime.UtcNow;

        await _positions.ReplaceOneAsync(p => p.Id == existing.Id, position);
        return position;
    }
}