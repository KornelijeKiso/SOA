using MongoDB.Driver;
using TourService.Application.Interfaces;
using TourService.Domain.Models;
using TourService.Infrastructure.Mongo;

namespace TourService.Infrastructure.Repositories;

public class ShoppingCartRepository : IShoppingCartRepository
{
    private readonly IMongoCollection<ShoppingCart> _carts;

    public ShoppingCartRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _carts = database.GetCollection<ShoppingCart>("shoppingCarts");
    }

    public async Task<ShoppingCart?> GetByTouristIdAsync(string touristId)
    {
        return await _carts
            .Find(c => c.TouristId == touristId)
            .FirstOrDefaultAsync();
    }

    public async Task<ShoppingCart> SaveAsync(ShoppingCart cart)
    {
        cart.TotalPrice = cart.Items.Sum(i => i.Price);

        if (cart.Id == null)
        {
            await _carts.InsertOneAsync(cart);
            return cart;
        }

        await _carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
        return cart;
    }

    public async Task DeleteAsync(string cartId)
    {
        await _carts.DeleteOneAsync(c => c.Id == cartId);
    }
}