namespace TourService.Api.Identity;

public sealed class GatewayIdentityMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            await next(context);
            return;
        }

        var emailHeaders = context.Request.Headers["X-User-Email"];
        var roleHeaders = context.Request.Headers["X-User-Role"];
        var email = emailHeaders.ToString().Trim();
        var role = roleHeaders.ToString().Trim();

        if (emailHeaders.Count != 1 || roleHeaders.Count != 1 ||
            string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(role))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "X-User-Email and X-User-Role are required." });
            return;
        }

        if (role != "GUIDE" && role != "TOURIST")
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "Unsupported user role." });
            return;
        }

        var requiredRole = context.GetEndpoint()?.Metadata.GetMetadata<GatewayRoleAttribute>();
        if (requiredRole != null && requiredRole.Role != role)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "This operation is not allowed for your role." });
            return;
        }

        foreach (var name in new[] { "guideId", "touristId" })
        {
            var routeId = context.Request.RouteValues[name]?.ToString();
            var queryIds = context.Request.Query[name];
            if ((routeId != null && routeId != email) || queryIds.Any(id => id != email))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new { error = "The requested user does not match the gateway identity." });
                return;
            }
        }

        context.Items[GatewayIdentity.EmailKey] = email;
        await next(context);
    }
}
