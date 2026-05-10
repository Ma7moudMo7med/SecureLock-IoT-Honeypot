using SmartLockService.Models;

namespace SmartLockService.Services;

public sealed class DeviceService
{
    private readonly DataStore _store;

    public DeviceService(DataStore store) { _store = store; }

    public StatusResponse GetStatus()
    {
        var devices = _store.Devices.ToList();
        var doors  = devices.Where(d => d.Type == "door").ToList();
        var gates  = devices.Where(d => d.Type == "gate").ToList();
        var lights = devices.Where(d => d.Type == "light").ToList();

        var openDoors = doors.Count(d => d.Status == "unlocked" || d.Status == "open");
        var openGates = gates.Count(d => d.Status == "open");
        var lightsOn  = lights.Count(d => d.Status == "on");

        var anyUnlocked = openDoors > 0 || openGates > 0;

        return new StatusResponse
        {
            Devices = devices,
            TotalDoors = doors.Count,
            OpenDoors = openDoors,
            TotalGates = gates.Count,
            OpenGates = openGates,
            TotalLights = lights.Count,
            LightsOn = lightsOn,
            Secure = !anyUnlocked,
            SystemHealth = anyUnlocked ? "Attention" : "Secure",
            ServerTime = DateTime.UtcNow
        };
    }

    public SmartDevice? GetDevice(string id)
        => _store.Devices.FirstOrDefault(d => d.Id == id);

    public bool Lock(string deviceId, string actor, string sourceIp, out string? error)
    {
        error = null;
        var device = GetDevice(deviceId);
        if (device is null) { error = $"device '{deviceId}' not found"; return false; }

        device.Status = device.Type switch
        {
            "door"  => "locked",
            "gate"  => "closed",
            "light" => "off",
            _       => "locked"
        };
        device.LastUpdated = DateTime.UtcNow;
        _store.AddActivity(device.Id, device.Name, device.Type == "light" ? "turned off" : "locked", actor, sourceIp);
        return true;
    }

    public bool Unlock(string deviceId, string actor, string sourceIp, out string? error)
    {
        error = null;
        var device = GetDevice(deviceId);
        if (device is null) { error = $"device '{deviceId}' not found"; return false; }

        device.Status = device.Type switch
        {
            "door"  => "unlocked",
            "gate"  => "open",
            "light" => "on",
            _       => "unlocked"
        };
        device.LastUpdated = DateTime.UtcNow;
        _store.AddActivity(device.Id, device.Name, device.Type == "light" ? "turned on" : "unlocked", actor, sourceIp, "warn");
        return true;
    }

    public void LockAll(string actor, string sourceIp)
    {
        foreach (var d in _store.Devices.Where(d => d.Type == "door" || d.Type == "gate"))
        {
            d.Status = d.Type == "gate" ? "closed" : "locked";
            d.LastUpdated = DateTime.UtcNow;
        }
        _store.AddActivity("system", "All Doors", "locked all doors", actor, sourceIp);
    }

    public DeviceSettings GetSettings() => _store.Settings;

    public void UpdateSettings(DeviceSettings settings, string actor, string sourceIp)
    {
        _store.UpdateSettings(settings);
        _store.AddActivity("system", "Settings", "updated settings", actor, sourceIp);
    }
}
