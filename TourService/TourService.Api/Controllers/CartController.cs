using Microsoft.AspNetCore.Mvc;
using TourService.Application.DTOs;
using TourService.Application.Services;

namespace TourService.Api.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly CartService _cartService;

    public CartController(CartService cartService)
    {
        _cartService = cartService;
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart(AddToCartRequest request)
    {
        var cart = await _cartService.AddToCartAsync(request);

        if (cart == null)
            return BadRequest("Tour cannot be added to cart.");

        return Ok(cart);
    }

    [HttpGet("{touristId}")]
    public async Task<IActionResult> GetCart(string touristId)
    {
        var cart = await _cartService.GetCartAsync(touristId);

        if (cart == null)
            return NotFound();

        return Ok(cart);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(CheckoutRequest request)
    {
        var tokens = await _cartService.CheckoutAsync(request);

        if (tokens == null)
            return BadRequest("Cart is empty.");

        return Ok(tokens);
    }
}