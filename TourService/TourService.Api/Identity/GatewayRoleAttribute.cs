namespace TourService.Api.Identity;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class GatewayRoleAttribute(string role) : Attribute
{
    public string Role { get; } = role;
}
