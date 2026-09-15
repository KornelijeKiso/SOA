using TourService.Application.DTOs;
using TourService.Application.Interfaces;
using TourService.Domain.Enums;
using TourService.Domain.Models;

namespace TourService.Application.Services;

public class CartService
{
    private readonly IShoppingCartRepository _cartRepository;
    private readonly ITourRepository _tourRepository;
    private readonly IPurchaseTokenRepository _purchaseTokenRepository;

    public CartService(
        IShoppingCartRepository cartRepository,
        ITourRepository tourRepository,
        IPurchaseTokenRepository purchaseTokenRepository)
    {
        _cartRepository = cartRepository;
        _tourRepository = tourRepository;
        _purchaseTokenRepository = purchaseTokenRepository;
    }

    public async Task<ShoppingCart?> AddToCartAsync(AddToCartRequest request)
    {
        var tour = await _tourRepository.GetByIdAsync(request.TourId);

        if (tour == null)
            return null;

        if (tour.Status == TourStatus.Archived)
            return null;

        var alreadyPurchased = await _purchaseTokenRepository.ExistsAsync(
            request.TouristId,
            request.TourId
        );

        if (alreadyPurchased)
            return null;

        var cart = await _cartRepository.GetByTouristIdAsync(request.TouristId)
                   ?? new ShoppingCart { TouristId = request.TouristId };

        var alreadyInCart = cart.Items.Any(i => i.TourId == request.TourId);

        if (!alreadyInCart)
        {
            cart.Items.Add(new CartItem
            {
                TourId = tour.Id!,
                TourName = tour.Name,
                Price = tour.Price
            });
        }

        return await _cartRepository.SaveAsync(cart);
    }

    public async Task<ShoppingCart?> GetCartAsync(string touristId)
    {
        return await _cartRepository.GetByTouristIdAsync(touristId);
    }

    public async Task<List<TourPurchaseToken>?> CheckoutAsync(CheckoutRequest request)
    {
        var cart = await _cartRepository.GetByTouristIdAsync(request.TouristId);

        if (cart == null || cart.Items.Count == 0)
            return null;

        var tokens = new List<TourPurchaseToken>();

        foreach (var item in cart.Items)
        {
            var token = new TourPurchaseToken
            {
                TouristId = request.TouristId,
                TourId = item.TourId,
                TourName = item.TourName,
                PurchasedAt = DateTime.UtcNow
            };

            tokens.Add(await _purchaseTokenRepository.CreateAsync(token));
        }

        await _cartRepository.DeleteAsync(cart.Id!);

        return tokens;
    }
}