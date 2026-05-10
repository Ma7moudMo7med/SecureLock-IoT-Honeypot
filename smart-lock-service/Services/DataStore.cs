using SmartLockService.Models;

namespace SmartLockService.Services;

/// <summary>
/// Thread-safe in-memory data store. Acts as a stand-in for a real DB —
/// the structure is PostgreSQL-ready (every entity has an Id and timestamps).
/// </summary>
public sealed class DataStore
{
    private readonly object _lock = new();
    private int _logCounter = 0;

    public List<User> Users { get; } = new();
    public List<SmartDevice> Devices { get; } = new();
    public List<ActivityEntry> Activity { get; } = new();
    public DeviceSettings Settings { get; private set; } = new();

    public DataStore()
    {
        SeedUsers();
        SeedDevices();
        SeedActivity();
    }

    // -------------------------------------------------------------------------
    private void SeedUsers()
    {
        Users.AddRange(new[]
        {
            new User { Id = 1, Username = "admin",      Password = "admin123", Role = "admin",      Email = "admin@smartluck.com" },
            new User { Id = 2, Username = "technician", Password = "tech123",  Role = "technician", Email = "tech@smartluck.com" },
            new User { Id = 3, Username = "guest",      Password = "guest",    Role = "guest",      Email = "guest@smartluck.com" },
        });
    }

    private void SeedDevices()
    {
        Devices.AddRange(new[]
        {
            new SmartDevice { Id = "door-main",   Name = "Main Door",   Type = "door",  Status = "locked",   Battery = 87, FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-1), Image = "/door-main.png" },
            new SmartDevice { Id = "door-front",  Name = "Front Door",  Type = "door",  Status = "locked",   Battery = 72, FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-2), Image = "/door-front.png" },
            new SmartDevice { Id = "door-back",   Name = "Back Door",   Type = "door",  Status = "unlocked", Battery = 65, FirmwareVersion = "2.4.0", LastUpdated = DateTime.UtcNow.AddSeconds(-30), Image = "/door-back.png" },
            new SmartDevice { Id = "door-garage", Name = "Garage Door", Type = "door",  Status = "locked",   Battery = 91, FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-1), Image = "/door-garage.png" },
            new SmartDevice { Id = "gate-main",   Name = "Main Gate",   Type = "gate",  Status = "closed",   Battery = 80, FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-5), Image = "/gate-main.png" },
            new SmartDevice { Id = "light-living",Name = "Living Room", Type = "light", Status = "on",       Battery = 100,FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-3), Image = "/light-bg.png" },
            new SmartDevice { Id = "light-kitchen",Name= "Kitchen",     Type = "light", Status = "on",       Battery = 100,FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-4), Image = "/light-bg.png" },
            new SmartDevice { Id = "light-porch", Name = "Porch",       Type = "light", Status = "on",       Battery = 100,FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-2), Image = "/light-bg.png" },
            new SmartDevice { Id = "light-bed1",  Name = "Bedroom 1",   Type = "light", Status = "off",      Battery = 100,FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-12), Image = "/light-bg.png" },
            new SmartDevice { Id = "light-bed2",  Name = "Bedroom 2",   Type = "light", Status = "off",      Battery = 100,FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-30), Image = "/light-bg.png" },
            new SmartDevice { Id = "light-garden",Name = "Garden",      Type = "light", Status = "off",      Battery = 100,FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-45), Image = "/light-bg.png" },
            new SmartDevice { Id = "light-hall",  Name = "Hallway",     Type = "light", Status = "off",      Battery = 100,FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-15), Image = "/light-bg.png" },
            new SmartDevice { Id = "light-office",Name = "Office",      Type = "light", Status = "off",      Battery = 100,FirmwareVersion = "2.4.1", LastUpdated = DateTime.UtcNow.AddMinutes(-20), Image = "/light-bg.png" },
        });
    }

    private void SeedActivity()
    {
        AddActivity("door-front",  "Front Door",  "locked",   "admin", "10.0.0.4", "info", DateTime.UtcNow.AddMinutes(-1));
        AddActivity("door-back",   "Back Door",   "unlocked", "admin", "10.0.0.4", "warn", DateTime.UtcNow.AddMinutes(-2));
        AddActivity("door-main",   "Main Door",   "locked",   "admin", "10.0.0.4", "info", DateTime.UtcNow.AddMinutes(-5));
        AddActivity("door-garage", "Garage Door", "locked",   "admin", "10.0.0.4", "info", DateTime.UtcNow.AddMinutes(-10));
        AddActivity("gate-main",   "Main Gate",   "closed",   "scheduler", "127.0.0.1", "info", DateTime.UtcNow.AddMinutes(-15));
        AddActivity("light-living","Living Room", "turned on","scheduler", "127.0.0.1", "info", DateTime.UtcNow.AddMinutes(-20));
    }

    // -------------------------------------------------------------------------
    public void AddActivity(string deviceId, string deviceName, string action, string actor, string sourceIp, string severity = "info", DateTime? timestamp = null, string? details = null)
    {
        lock (_lock)
        {
            _logCounter++;
            Activity.Insert(0, new ActivityEntry
            {
                Id = _logCounter,
                DeviceId = deviceId,
                DeviceName = deviceName,
                Action = action,
                Actor = actor,
                SourceIp = sourceIp,
                Severity = severity,
                Timestamp = timestamp ?? DateTime.UtcNow,
                Details = details
            });

            // keep last 500 entries
            if (Activity.Count > 500)
            {
                Activity.RemoveRange(500, Activity.Count - 500);
            }
        }
    }

    public void UpdateSettings(DeviceSettings updated)
    {
        lock (_lock) { Settings = updated; }
    }
}
