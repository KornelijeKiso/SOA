using Microsoft.AspNetCore.Mvc;
using TourService.Api.Identity;
using TourService.Application.DTOs;
using TourService.Application.Services;

namespace TourService.Api.Controllers;

[ApiController]
[GatewayRole("TOURIST")]
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
        request.TouristId = HttpContext.GetGatewayEmail();
        var cart = await _cartService.AddToCartAsync(request);

        if (cart == null)
            return BadRequest("Tour cannot be added to cart.");

        return Ok(cart);
    }

    [HttpGet("{touristId}")]
    public async Task<IActionResult> GetCart(string touristId)
    {
        var cart = await _cartService.GetCartAsync(HttpContext.GetGatewayEmail());

        if (cart == null)
            return NotFound();

        return Ok(cart);
    }

    [HttpPost("remove")]
    public async Task<IActionResult> RemoveFromCart(RemoveFromCartRequest request)
    {
        request.TouristId = HttpContext.GetGatewayEmail();
        var cart = await _cartService.RemoveFromCartAsync(request);

        if (cart == null)
            return NotFound();

        return Ok(cart);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(CheckoutRequest request)
    {
        request.TouristId = HttpContext.GetGatewayEmail();
        var tokens = await _cartService.CheckoutAsync(request);

        if (tokens == null)
            return BadRequest("Cart is empty or contains a tour that is missing or not Published.");

        return Ok(tokens);
    }
}