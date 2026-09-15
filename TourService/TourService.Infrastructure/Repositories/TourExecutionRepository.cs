using MongoDB.Driver;
using TourService.Application.Interfaces;
using TourService.Domain.Models;
using TourService.Infrastructure.Mongo;

namespace TourService.Infrastructure.Repositories;

public class TourExecutionRepository : ITourExecutionRepository
{
    private readonly IMongoCollection<TourExecution> _executions;

    public TourExecutionRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _executions = database.GetCollection<TourExecution>("tourExecutions");
    }

    public async Task<TourExecution> CreateAsync(TourExecution execution)
    {
        await _executions.InsertOneAsync(execution);
        return execution;
    }

    public async Task<TourExecution?> GetActiveAsync(string touristId, string tourId)
    {
        return await _executions
            .Find(e =>
                e.TouristId == touristId &&
                e.TourId == tourId &&
                e.Status == "Started")
            .FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(TourExecution execution)
    {
        await _executions.ReplaceOneAsync(e => e.Id == execution.Id, execution);
    }
}