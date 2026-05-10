using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SmartLockService.Models;

namespace SmartLockService.Services;

/// <summary>
/// Auth service. Intentionally weak:
///   - Plaintext password compare
///   - User-enumeration error messages
///   - No rate limiting
///   - Permissive JWT settings
/// </summary>
public sealed class AuthService
{
    private readonly DataStore _store;
    private readonly IConfiguration _config;

    public AuthService(DataStore store, IConfiguration config)
    {
        _store = store;
        _config = config;
    }

    public (LoginResponse? Response, ApiError? Error) Login(LoginRequest req, string sourceIp)
    {
        var username = (req.Username ?? string.Empty).Trim();
        var password = req.Password ?? string.Empty;

        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            return (null, new ApiError
            {
                Code = "INVALID_INPUT",
                Message = "Username and password are required.",
                Detail = $"username='{username}' password.length={password.Length}"
            });
        }

        var user = _store.Users.FirstOrDefault(u =>
            string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));

        // Intentional user enumeration
        if (user is null)
        {
            _store.AddActivity("auth", "Authentication", $"failed login (unknown user '{username}')", username, sourceIp, "warn");
            return (null, new ApiError
            {
                Code = "USER_NOT_FOUND",
                Message = $"User '{username}' does not exist.",
                Detail = "Hint: try one of the seeded accounts."
            });
        }

        if (!string.Equals(user.Password, password, StringComparison.Ordinal))
        {
            _store.AddActivity("auth", "Authentication", $"failed login for '{username}'", username, sourceIp, "warn");
            return (null, new ApiError
            {
                Code = "WRONG_PASSWORD",
                Message = $"Incorrect password for user '{username}'.",
                Detail = $"Stored password length is {user.Password.Length}." // verbose on purpose
            });
        }

        var (token, expires) = IssueToken(user);
        _store.AddActivity("auth", "Authentication", $"successful login for '{username}'", username, sourceIp, "info");

        return (new LoginResponse
        {
            Token = token,
            Username = user.Username,
            Role = user.Role,
            ExpiresAt = expires
        }, null);
    }

    public (string Token, DateTime ExpiresAt) IssueToken(User user)
    {
        var secret = _config["JWT:Secret"] ?? "dev-secret";
        var issuer = _config["JWT:Issuer"] ?? "SmartLuckController";
        var audience = _config["JWT:Audience"] ?? "SmartLuckClients";
        var minutes = int.TryParse(_config["JWT:ExpiresMinutes"], out var m) ? m : 120;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddMinutes(minutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("email", user.Email),
        };

        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(jwt), expires);
    }
}
