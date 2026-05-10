using System.Text.RegularExpressions;
using SmartLockService.Models;
using SmartLockService.Services;

namespace SmartLockService.Endpoints;

public static class DebugEndpoints
{
    public static void MapDebugEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/debug").WithTags("Debug (exposed)");

        // Returns simulated system info. NEVER touches the host.
        group.MapGet("/system", (IConfiguration cfg, DataStore store) =>
        {
            var resp = new DebugSystemResponse
            {
                ServerTime = DateTime.UtcNow.ToString("O"),
                OperatingSystem = "Linux 5.15.0-iot (simulated)",
                Hostname = "smartlock-controller",
                FirmwareVersion = cfg["Honeypot:FirmwareVersion"] ?? "2.4.1",
                KernelVersion = "Linux smartlock 5.15.0-iot #1 SMP",
                Uptime = $"{(int)TimeSpan.FromMinutes(Environment.TickCount / 60_000.0).TotalHours}h {Environment.TickCount / 60_000 % 60}m",
                Environment = new()
                {
                    ["DEVICE_NAME"] = cfg["Honeypot:DeviceName"] ?? "My Smart Home",
                    ["SERIAL_NUMBER"] = cfg["Honeypot:SerialNumber"] ?? "SLC-2024-A7F92E",
                    ["ADMIN_USER"] = "admin",
                    ["ADMIN_PASS"] = "admin123",
                    ["JWT_SECRET"] = (cfg["JWT:Secret"] ?? "dev-secret"),
                    ["DATABASE_URL"] = "Server=db.internal;Database=smartlock;User=sa;Password=Admin@123",
                    ["MQTT_BROKER"] = "tcp://10.0.0.5:1883"
                },
                Routes = new()
                {
                    "/api/auth/login", "/api/auth/me", "/api/auth/logout",
                    "/api/device/status", "/api/device/lock", "/api/device/unlock",
                    "/api/device/settings",
                    "/api/admin/logs", "/api/admin/users", "/api/admin/sessions",
                    "/api/firmware/info", "/api/firmware/update",
                    "/api/export/config",
                    "/api/debug/system", "/api/debug/exec",
                    // hidden
                    "/api/.git/HEAD", "/api/backup.zip", "/api/wp-admin", "/api/.env"
                },
                Services = new()
                {
                    "smart-lock-service (running)",
                    "mqtt-bridge (simulated)",
                    "firmware-updater (idle)",
                    "zigbee-coordinator (simulated)",
                    "mosquitto (simulated)"
                }
            };
            return Results.Ok(resp);
        })
        .WithName("DebugSystem");

        // SAFE command-injection demo: payload is logged + echoed.
        // Never executed.
        group.MapPost("/exec", (HttpContext http, DataStore store) => HandleExec(http, store))
            .WithName("DebugExec")
            .WithSummary("Simulated command execution. Payloads are logged but never run.");

        group.MapGet("/exec", (HttpContext http, DataStore store) => HandleExec(http, store))
            .WithName("DebugExecGet");
    }

    private static async Task<IResult> HandleExec(HttpContext http, DataStore store)
    {
        string? cmd = http.Request.Query["cmd"];

        if (string.IsNullOrEmpty(cmd) && http.Request.HasFormContentType)
        {
            var form = await http.Request.ReadFormAsync();
            cmd = form["cmd"];
        }
        else if (string.IsNullOrEmpty(cmd) && http.Request.ContentLength is > 0)
        {
            using var reader = new StreamReader(http.Request.Body);
            var body = await reader.ReadToEndAsync();
            cmd = body;
        }

        cmd ??= string.Empty;

        var ip = http.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        var actor = http.User.Identity?.Name ?? "anonymous";
        store.AddActivity("debug", "Debug", "command injection attempt", actor, ip, "error", details: cmd);

        // Generate a simulated, plausible response so attackers see "something".
        var simulated = SimulateCommand(cmd);

        return Results.Ok(new
        {
            command = cmd,
            executed = false,
            simulated = true,
            output = simulated,
            warning = "This endpoint is simulated. No commands were executed on the host.",
            timestamp = DateTime.UtcNow
        });
    }

    private static string SimulateCommand(string cmd)
    {
        var trimmed = cmd.Trim();
        if (string.IsNullOrEmpty(trimmed)) return string.Empty;

        // Look at the first token only.
        var match = Regex.Match(trimmed, @"^[a-zA-Z_][\w\-/]*");
        var tool = match.Success ? match.Value.ToLowerInvariant() : "";

        return tool switch
        {
            "id"        => "uid=0(root) gid=0(root) groups=0(root)",
            "whoami"    => "root",
            "hostname"  => "smartlock-controller",
            "uname"     => "Linux smartlock-controller 5.15.0-iot #1 SMP x86_64 GNU/Linux",
            "pwd"       => "/opt/smartlock",
            "ls"        => "bin\nconfig\nfirmware\nlogs\nREADME.md",
            "cat"       => "(simulated) file contents redacted",
            "env"       => "DEVICE_NAME=My Smart Home\nADMIN_USER=admin\nADMIN_PASS=admin123\nJWT_SECRET=honeypot-weak-secret",
            "ps"        => "  PID TTY          TIME CMD\n    1 ?        00:00:01 dotnet\n   42 ?        00:00:00 mosquitto",
            "ifconfig"  => "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 10.0.0.10  netmask 255.255.255.0  broadcast 10.0.0.255",
            "ip"        => "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500",
            "netstat"   => "tcp  0  0 0.0.0.0:8080  0.0.0.0:*   LISTEN\ntcp  0  0 0.0.0.0:1883  0.0.0.0:*   LISTEN",
            "echo"      => trimmed.Length > 5 ? trimmed[5..] : "",
            _           => $"sh: {tool}: command logged for review (sandbox)"
        };
    }
}
