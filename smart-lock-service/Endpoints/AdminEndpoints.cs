using SmartLockService.Models;
using SmartLockService.Services;

namespace SmartLockService.Endpoints;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        // NOTE: deliberately NOT calling RequireAuthorization - exposed admin route
        // for honeypot research.
        var group = app.MapGroup("/api/admin").WithTags("Admin (exposed)");

        group.MapGet("/logs", (DataStore store, int? limit, string? severity) =>
        {
            IEnumerable<ActivityEntry> logs = store.Activity;
            if (!string.IsNullOrWhiteSpace(severity))
                logs = logs.Where(l => string.Equals(l.Severity, severity, StringComparison.OrdinalIgnoreCase));

            var take = limit is > 0 ? limit.Value : 100;
            return Results.Ok(logs.Take(take).ToList());
        })
        .WithName("AdminLogs")
        .WithSummary("Returns recent activity logs. Exposed without auth on purpose.");

        group.MapGet("/users", (DataStore store) =>
        {
            // Verbose - returns plaintext passwords (honeypot)
            return Results.Ok(store.Users.Select(u => new {
                u.Id, u.Username, u.Password, u.Role, u.Email
            }));
        })
        .WithName("AdminUsers");

        group.MapGet("/sessions", () =>
        {
            // Predictable / sequential session IDs - intentional weakness
            var rng = new Random(42);
            var sessions = Enumerable.Range(1, 8).Select(i => new
            {
                sessionId = i.ToString("D6"),
                user = i % 2 == 0 ? "admin" : "technician",
                ip = $"10.0.0.{rng.Next(2, 250)}",
                userAgent = "Mozilla/5.0 SmartLockApp/2.4.1",
                createdAt = DateTime.UtcNow.AddMinutes(-i * 7)
            }).ToList();
            return Results.Ok(sessions);
        })
        .WithName("AdminSessions");
    }
}
