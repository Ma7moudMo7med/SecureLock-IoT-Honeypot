using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SmartLockService.Endpoints;
using SmartLockService.Services;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------------------------------------------------------
// Services
// -----------------------------------------------------------------------------
builder.Services.AddSingleton<DataStore>();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<DeviceService>();

// CORS - permissive on purpose (vulnerable IoT product)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// JWT Authentication
var jwtSecret = builder.Configuration["JWT:Secret"]
    ?? "honeypot-weak-secret-key-do-not-use-in-real-systems-1234567890";
var jwtIssuer = builder.Configuration["JWT:Issuer"] ?? "SmartLuckController";
var jwtAudience = builder.Configuration["JWT:Audience"] ?? "SmartLuckClients";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Smart Luck Controller API",
        Version = "v1",
        Description = "Vulnerable-by-design Smart Lock honeypot API.\n\nAccounts: admin/admin123, technician/tech123."
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Paste your JWT here (without the 'Bearer ' prefix)."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// -----------------------------------------------------------------------------
// Pipeline
// -----------------------------------------------------------------------------
var app = builder.Build();

// Force-prime the DataStore so seeding runs before first request.
_ = app.Services.GetRequiredService<DataStore>();

app.UseCors();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Smart Luck Controller API v1");
    c.RoutePrefix = "swagger";
});

app.UseAuthentication();
app.UseAuthorization();

// -----------------------------------------------------------------------------
// Top-level endpoints
// -----------------------------------------------------------------------------
app.MapGet("/", () => Results.Json(new
{
    service = "Smart Luck Controller API",
    version = builder.Configuration["Honeypot:FirmwareVersion"] ?? "2.4.1",
    status = "running",
    docs = "/swagger",
    health = "/health"
}));

app.MapGet("/health", () => Results.Json(new
{
    status = "ok",
    time = DateTime.UtcNow
})).WithTags("Health");

// Standardised banner - simulates an embedded device fingerprint
app.MapGet("/api", (IConfiguration cfg) => Results.Json(new
{
    name = "Smart Luck Controller",
    serial = cfg["Honeypot:SerialNumber"] ?? "SLC-2024-A7F92E",
    firmware = cfg["Honeypot:FirmwareVersion"] ?? "2.4.1",
    vendor = "Smart Luck Inc.",
    server = "EmbeddedHttp/1.0 (linux-iot)",
    apiVersion = "v1"
}));

// -----------------------------------------------------------------------------
// Endpoint groups
// -----------------------------------------------------------------------------
app.MapAuthEndpoints();
app.MapDeviceEndpoints();
app.MapAdminEndpoints();
app.MapFirmwareEndpoints();
app.MapDebugEndpoints();
app.MapExportEndpoints();
app.MapHiddenEndpoints();

// -----------------------------------------------------------------------------
// Server header (intentionally leaks version info)
// -----------------------------------------------------------------------------
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Powered-By"] = "SmartLuck/2.4.1 (.NET 8)";
    ctx.Response.Headers["Server"] = "EmbeddedHttp/1.0";
    await next();
});

app.Run();
