using SmartLockService.Services;

namespace SmartLockService.Endpoints;

/// <summary>
/// Fake "hidden" routes that script kiddies and scanners commonly probe.
/// All responses are simulated and only logged.
/// </summary>
public static class HiddenEndpoints
{
    public static void MapHiddenEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api").WithTags("Hidden (decoys)");

        group.MapGet("/.git/HEAD", (HttpContext http, DataStore store) =>
        {
            LogProbe(http, store, "/.git/HEAD");
            return Results.Text("ref: refs/heads/main\n", "text/plain");
        });

        group.MapGet("/.git/config", (HttpContext http, DataStore store) =>
        {
            LogProbe(http, store, "/.git/config");
            return Results.Text(
                "[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n[remote \"origin\"]\n\turl = git@github.com:smartluck/firmware.git\n",
                "text/plain");
        });

        group.MapGet("/.env", (HttpContext http, DataStore store) =>
        {
            LogProbe(http, store, "/.env");
            return Results.Text(
                "ADMIN_USER=admin\nADMIN_PASS=admin123\nJWT_SECRET=honeypot-weak-secret\nDB_PASS=Admin@123\nMQTT_PASS=iotpass\n",
                "text/plain");
        });

        group.MapGet("/wp-admin", (HttpContext http, DataStore store) =>
        {
            LogProbe(http, store, "/wp-admin");
            return Results.Json(new { error = "WordPress admin not found here. Try /api/auth/login." }, statusCode: 404);
        });

        group.MapGet("/backup.zip", (HttpContext http, DataStore store) =>
        {
            LogProbe(http, store, "/backup.zip");
            return Results.File(System.Text.Encoding.UTF8.GetBytes("PK(decoy)"), "application/zip", "backup.zip");
        });

        group.MapGet("/phpinfo", (HttpContext http, DataStore store) =>
        {
            LogProbe(http, store, "/phpinfo");
            return Results.Text("PHP not installed. (decoy)", "text/plain");
        });
    }

    private static void LogProbe(HttpContext http, DataStore store, string path)
    {
        var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        var ua = http.Request.Headers.UserAgent.ToString();
        store.AddActivity("scanner", "Probe", $"hidden route probe {path}", "anonymous", ip, "warn", details: $"UA={ua}");
    }
}
