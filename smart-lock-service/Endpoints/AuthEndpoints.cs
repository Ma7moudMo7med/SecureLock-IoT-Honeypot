using Microsoft.AspNetCore.Mvc;
using SmartLockService.Models;
using SmartLockService.Services;

namespace SmartLockService.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", (LoginRequest req, AuthService auth, HttpContext http) =>
        {
            var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            var (resp, err) = auth.Login(req, ip);
            return err is not null
                ? Results.Json(err, statusCode: StatusCodes.Status401Unauthorized)
                : Results.Ok(resp);
        })
        .WithName("Login")
        .WithSummary("Authenticate against the smart lock controller (intentionally weak).");

        group.MapGet("/me", (HttpContext http) =>
        {
            if (http.User?.Identity?.IsAuthenticated != true)
                return Results.Unauthorized();

            var username = http.User.Identity?.Name ?? "";
            var role = http.User.Claims.FirstOrDefault(c => c.Type.EndsWith("/role") || c.Type == "role")?.Value ?? "user";
            return Results.Ok(new { username, role });
        })
        .RequireAuthorization()
        .WithName("Me");

        group.MapPost("/logout", () => Results.Ok(new { message = "logged out" }))
            .WithName("Logout");
    }
}
