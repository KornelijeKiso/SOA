using MongoDB.Driver;
using TourService.Application.Interfaces;
using TourService.Domain.Models;
using TourService.Infrastructure.Mongo;

namespace TourService.Infrastructure.Repositories;

public class PurchaseTokenRepository : IPurchaseTokenRepository
{
    private readonly IMongoCollection<TourPurchaseToken> _tokens;

    public PurchaseTokenRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _tokens = database.GetCollection<TourPurchaseToken>("tourPurchaseTokens");
    }

    public async Task<TourPurchaseToken> CreateAsync(TourPurchaseToken token)
    {
        await _tokens.InsertOneAsync(token);
        return token;
    }

    public async Task<bool> ExistsAsync(string touristId, string tourId)
    {
        return await _tokens
            .Find(t => t.TouristId == touristId && t.TourId == tourId)
            .AnyAsync();
    }
}