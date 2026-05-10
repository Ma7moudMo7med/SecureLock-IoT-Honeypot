using SmartLockService.Models;
using SmartLockService.Services;

namespace SmartLockService.Endpoints;

public static class FirmwareEndpoints
{
    public static void MapFirmwareEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/firmware").WithTags("Firmware");

        // Returns the current firmware info
        group.MapGet("/info", (IConfiguration cfg) => Results.Ok(new
        {
            currentVersion = cfg["Honeypot:FirmwareVersion"] ?? "2.4.1",
            latestVersion = "2.4.2",
            updateAvailable = true,
            releaseNotes = "Fixes a critical vulnerability in the access-control module. Patches CVE-2024-FAKE-1337.",
            channel = "stable",
            signed = false, // intentional
            checksum = "MD5:5d41402abc4b2a76b9719d911017c592"
        })).WithName("FirmwareInfo");

        // Fake firmware update - no signature checks, accepts arbitrary URL.
        group.MapPost("/update", (FirmwareUpdateRequest req, DataStore store, HttpContext http) =>
        {
            var actor = http.User.Identity?.Name ?? "anonymous";
            var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            store.AddActivity("firmware", "Firmware", $"firmware update requested -> {req.Version} from {req.Url ?? "<official>"}", actor, ip, "warn", details: $"force={req.ForceInstall}");

            return Results.Ok(new
            {
                status = "accepted",
                version = string.IsNullOrEmpty(req.Version) ? "unknown" : req.Version,
                appliedFrom = req.Url ?? "https://updates.smartluck.local/firmware.bin",
                signatureValidated = false,
                forceInstall = req.ForceInstall,
                message = "Update queued. Device will reboot in 30 seconds.",
                eta = DateTime.UtcNow.AddSeconds(30)
            });
        }).WithName("FirmwareUpdate");
    }
}
