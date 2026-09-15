namespace TourService.Api.Identity;

public static class GatewayIdentity
{
    internal static readonly object EmailKey = new();

    public static string GetGatewayEmail(this HttpContext context)
        => (string)context.Items[EmailKey]!;
}
