using SmartLockService.Models;
using SmartLockService.Services;

namespace SmartLockService.Endpoints;

public static class DeviceEndpoints
{
    public static void MapDeviceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/device").WithTags("Device").RequireAuthorization();

        group.MapGet("/status", (DeviceService devices) => Results.Ok(devices.GetStatus()))
            .WithName("DeviceStatus");

        group.MapGet("/list", (DeviceService devices) => Results.Ok(devices.GetStatus().Devices))
            .WithName("DeviceList");

        group.MapGet("/{id}", (string id, DeviceService devices) =>
        {
            var d = devices.GetDevice(id);
            return d is null ? Results.NotFound(new ApiError { Code = "NOT_FOUND", Message = $"device '{id}' not found" }) : Results.Ok(d);
        });

        group.MapPost("/lock", (DeviceActionRequest req, DeviceService devices, HttpContext http) =>
        {
            var actor = http.User.Identity?.Name ?? "unknown";
            var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            if (!devices.Lock(req.DeviceId, actor, ip, out var err))
                return Results.NotFound(new ApiError { Code = "NOT_FOUND", Message = err ?? "not found" });
            return Results.Ok(new { message = "locked", deviceId = req.DeviceId });
        }).WithName("LockDevice");

        group.MapPost("/unlock", (DeviceActionRequest req, DeviceService devices, HttpContext http) =>
        {
            var actor = http.User.Identity?.Name ?? "unknown";
            var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            if (!devices.Unlock(req.DeviceId, actor, ip, out var err))
                return Results.NotFound(new ApiError { Code = "NOT_FOUND", Message = err ?? "not found" });
            return Results.Ok(new { message = "unlocked", deviceId = req.DeviceId });
        }).WithName("UnlockDevice");

        group.MapPost("/lock-all", (DeviceService devices, HttpContext http) =>
        {
            var actor = http.User.Identity?.Name ?? "unknown";
            var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            devices.LockAll(actor, ip);
            return Results.Ok(new { message = "all doors locked" });
        }).WithName("LockAllDevices");

        group.MapGet("/settings", (DeviceService devices) => Results.Ok(devices.GetSettings()))
            .WithName("GetSettings");

        group.MapPost("/settings", (DeviceSettings settings, DeviceService devices, HttpContext http) =>
        {
            var actor = http.User.Identity?.Name ?? "unknown";
            var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            // intentionally no validation - vulnerable
            devices.UpdateSettings(settings, actor, ip);
            return Results.Ok(devices.GetSettings());
        }).WithName("UpdateSettings");
    }
}
