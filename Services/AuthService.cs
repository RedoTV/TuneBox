using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TuneBox.DbContexts;
using TuneBox.Extentions;
using TuneBox.Models;
using TuneBox.Models.Dtos;

namespace TuneBox.Services;

public class AuthService(UsersDbContext _usersDbContext, IMapper _mapper, IConfiguration _configuration) : IAuthService
{
    public async Task<AuthResponseDto> SignIn(UserSignInDto user)
    {
        User mappedUser = _mapper.Map<User>(user);

        User? foundedUser = await _usersDbContext.Users
            .Where(u => u.Name == mappedUser.Name)
            .FirstOrDefaultAsync();

        if (foundedUser is null)
            throw new ArgumentException("user with that name was not found");

        bool verifyResult = VerifyPassword(user.Password, foundedUser.HashedPassword, Convert.FromHexString(foundedUser.Salt));
        if (!verifyResult)
            throw new VerificationException("password is incorrect");

        string token = GenerateToken(foundedUser);

        return new AuthResponseDto
        {
            Token = token,
            UserName = foundedUser.Name,
            UserId = foundedUser.Id
        };
    }

    public async Task<AuthResponseDto> Register(UserRegisterDto user)
    {
        User mappedUser = _mapper.Map<User>(user);

        if (!mappedUser.ValidateEmail())
            throw new ValidationException("Email not valid");

        if (_usersDbContext.Users.Any(u => u.Email == mappedUser.Email))
            throw new ArgumentException("User with this email already exists");

        if (_usersDbContext.Users.Any(u => u.Name == mappedUser.Name))
            throw new ArgumentException("User with this name already exists");

        if (user.Password.Length < 8)
            throw new ArgumentException("User password must be 8 or greater chars length");

        string hashedPassword = HashPassword(user.Password, out byte[] salt);

        mappedUser.HashedPassword = hashedPassword;
        mappedUser.Salt = Convert.ToHexString(salt);
        mappedUser.Role = "User";

        await _usersDbContext.Users.AddAsync(mappedUser);
        await _usersDbContext.SaveChangesAsync();

        User userInDb = await _usersDbContext.Users.Where(u => u.Email == mappedUser.Email).FirstAsync();
        string token = GenerateToken(userInDb);

        return new AuthResponseDto
        {
            Token = token,
            UserName = userInDb.Name,
            UserId = userInDb.Id
        };
    }

    private readonly int _keySize = 64;
    private readonly int _iterations = 350000;
    private readonly HashAlgorithmName _hashAlgorithm = HashAlgorithmName.SHA512;
    string HashPassword(string password, out byte[] salt)
    {
        salt = RandomNumberGenerator.GetBytes(_keySize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            _iterations,
            _hashAlgorithm,
            _keySize);
        return Convert.ToHexString(hash);
    }

    bool VerifyPassword(string password, string hash, byte[] salt)
    {
        var hashToCompare = Rfc2898DeriveBytes.Pbkdf2(password, salt, _iterations, _hashAlgorithm, _keySize);
        return CryptographicOperations.FixedTimeEquals(hashToCompare, Convert.FromHexString(hash));
    }

    public string GenerateToken(User user)
    {
        List<Claim> claimsForToken =
        [
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        ];

        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature);

        var token = new JwtSecurityToken(
            claims: claimsForToken,
            issuer: _configuration.GetSection("Jwt:Issuer").Value,
            audience: _configuration.GetSection("Jwt:Audience").Value,
            signingCredentials: credentials,
            expires: DateTime.Now.AddHours(6)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}