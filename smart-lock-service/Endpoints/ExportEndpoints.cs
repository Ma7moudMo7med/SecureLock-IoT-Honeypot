using SmartLockService.Models;
using SmartLockService.Services;

namespace SmartLockService.Endpoints;

public static class ExportEndpoints
{
    public static void MapExportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/export").WithTags("Export (exposed)");

        // GET /api/export/config
        // Intentional: dumps configuration including secrets in plaintext.
        group.MapGet("/config", (IConfiguration cfg, DataStore store, HttpContext http) =>
        {
            var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            var actor = http.User.Identity?.Name ?? "anonymous";
            store.AddActivity("export", "Configuration", "config exported", actor, ip, "warn");

            return Results.Ok(new ConfigExportResponse
            {
                DeviceName = cfg["Honeypot:DeviceName"] ?? "My Smart Home",
                SerialNumber = cfg["Honeypot:SerialNumber"] ?? "SLC-2024-A7F92E",
                FirmwareVersion = cfg["Honeypot:FirmwareVersion"] ?? "2.4.1",
                JwtSecret = cfg["JWT:Secret"] ?? "secret"
            });
        }).WithName("ExportConfig");

        // GET /api/export/backup -> simulated zip
        group.MapGet("/backup", (HttpContext http, DataStore store) =>
        {
            var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            var actor = http.User.Identity?.Name ?? "anonymous";
            store.AddActivity("export", "Backup", "backup downloaded", actor, ip, "warn");

            // Return an ascii pseudo-zip - just enough to look real
            var content = "PK(simulated backup) admin/admin123 jwt-secret=honeypot-weak\n";
            var bytes = System.Text.Encoding.UTF8.GetBytes(content);
            return Results.File(bytes, "application/zip", "smartluck-backup.zip");
        }).WithName("ExportBackup");
    }
}
