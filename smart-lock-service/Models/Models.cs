using System.Text.Json.Serialization;

namespace SmartLockService.Models;

// =============================================================================
// Domain models (in-memory)
// =============================================================================

public sealed class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // intentionally plaintext
    public string Role { get; set; } = "user";
    public string Email { get; set; } = string.Empty;
}

public sealed class SmartDevice
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "door"; // door | gate | light
    public string Status { get; set; } = "locked"; // locked | unlocked | open | closed | on | off
    public bool Online { get; set; } = true;
    public int Battery { get; set; } = 100;
    public string FirmwareVersion { get; set; } = "2.4.1";
    public string Image { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public sealed class ActivityEntry
{
    public int Id { get; set; }
    public string DeviceId { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public string SourceIp { get; set; } = string.Empty;
    public string Severity { get; set; } = "info"; // info | warn | error
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Details { get; set; }
}

public sealed class DeviceSettings
{
    public string HomeName { get; set; } = "My Smart Home";
    public string TimeZone { get; set; } = "(UTC+02:00) Cairo, Egypt";
    public string DateFormat { get; set; } = "DD / MM / YYYY";
    public string TimeFormat { get; set; } = "12 Hour (AM / PM)";
    public string TemperatureUnit { get; set; } = "C";
    public string Language { get; set; } = "English";
    public bool DarkMode { get; set; } = true;
    public string AutoLogout { get; set; } = "30 minutes";
    public bool SoundEffects { get; set; } = true;
    public bool Animations { get; set; } = true;
    public bool TwoFactor { get; set; } = true;
    public bool LoginAlerts { get; set; } = true;
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool SystemAlerts { get; set; } = true;
    public bool MarketingUpdates { get; set; } = false;
}

// =============================================================================
// DTOs
// =============================================================================

public sealed class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public sealed class DeviceActionRequest
{
    public string DeviceId { get; set; } = string.Empty;
}

public sealed class FirmwareUpdateRequest
{
    public string Version { get; set; } = string.Empty;
    public string? Url { get; set; }
    public bool ForceInstall { get; set; } = false;
}

public sealed class ApiError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Detail { get; set; } // intentionally verbose
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public sealed class StatusResponse
{
    public List<SmartDevice> Devices { get; set; } = new();
    public int TotalDoors { get; set; }
    public int OpenDoors { get; set; }
    public int TotalGates { get; set; }
    public int OpenGates { get; set; }
    public int TotalLights { get; set; }
    public int LightsOn { get; set; }
    public bool Secure { get; set; }
    public string SystemHealth { get; set; } = "Secure";
    public DateTime ServerTime { get; set; } = DateTime.UtcNow;
}

public sealed class DebugSystemResponse
{
    public string ServerTime { get; set; } = string.Empty;
    public string OperatingSystem { get; set; } = string.Empty;
    public string Hostname { get; set; } = string.Empty;
    public string FirmwareVersion { get; set; } = string.Empty;
    public string KernelVersion { get; set; } = string.Empty;
    public string Uptime { get; set; } = string.Empty;
    public Dictionary<string, string> Environment { get; set; } = new();
    public List<string> Routes { get; set; } = new();
    public List<string> Services { get; set; } = new();
    public string? CommandOutput { get; set; }
}

public sealed class ConfigExportResponse
{
    public string DeviceName { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string FirmwareVersion { get; set; } = string.Empty;
    public string AdminUser { get; set; } = "admin";
    public string AdminPassword { get; set; } = "admin123"; // exposed on purpose
    public string ApiKey { get; set; } = "sk_live_honeypot_5f3e2c8d4a9b1f7e";
    public string JwtSecret { get; set; } = "honeypot-weak-secret-key";
    public string DatabaseUrl { get; set; } = "Server=db.internal;Database=smartlock;User Id=sa;Password=Admin@123;";
    public string MqttBroker { get; set; } = "tcp://10.0.0.5:1883";
    public string MqttPassword { get; set; } = "iotpass";
    public string ZigbeeNetworkKey { get; set; } = "01:03:05:07:09:0B:0D:0F:00:02:04:06:08:0A:0C:0D";
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
}

[JsonSerializable(typeof(LoginRequest))]
[JsonSerializable(typeof(LoginResponse))]
[JsonSerializable(typeof(DeviceActionRequest))]
[JsonSerializable(typeof(FirmwareUpdateRequest))]
[JsonSerializable(typeof(ApiError))]
[JsonSerializable(typeof(StatusResponse))]
[JsonSerializable(typeof(DeviceSettings))]
[JsonSerializable(typeof(DebugSystemResponse))]
[JsonSerializable(typeof(ConfigExportResponse))]
[JsonSerializable(typeof(ActivityEntry))]
[JsonSerializable(typeof(SmartDevice))]
[JsonSerializable(typeof(User))]
public partial class AppJsonContext : JsonSerializerContext { }
