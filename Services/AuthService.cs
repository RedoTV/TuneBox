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
    public async Task<string> SignIn(UserSignInDto user)
    {
        User mappedUser = _mapper.Map<User>(user);

        User? foundedUser = await _usersDbContext.Users
            .Where(u => u.Name == mappedUser.Name)
            .FirstOrDefaultAsync();

        //if user with this name doesn't exist in DB throw new Exception 
        if (foundedUser is null)
            throw new ArgumentException("user with that name was not found");

        //if the password is incorrect, throw an exception
        bool verifyResult = VerifyPassword(user.Password, foundedUser.HashedPassword, Convert.FromHexString(foundedUser.Salt));
        if (!verifyResult)
            throw new VerificationException("password is incorrect");

        Console.WriteLine($"USER ID: {foundedUser.Id}");
        string token = GenerateToken(foundedUser);
        return token;
    }

    public async Task<string> Register(UserRegisterDto user)
    {
        User mappedUser = _mapper.Map<User>(user);

        //if request email not valid return empty string
        if (!mappedUser.ValidateEmail())
            throw new ValidationException("Email not valid");

        //if user with this email exists in DB throw new Exception 
        if (_usersDbContext.Users.Any(u => u.Email == mappedUser.Email))
            throw new ArgumentException("User with this email already exists");

        //if user with this name exists in DB throw new Exception 
        if (_usersDbContext.Users.Any(u => u.Name == mappedUser.Name))
            throw new ArgumentException("User with this name already exists");

        //if user with this name exists in DB throw new Exception 
        if (user.Password.Length < 8)
            throw new ArgumentException("User password must be 8 or greater chars length");

        string hashedPassword = HashPassword(user.Password, out byte[] salt);

        //init empty properties
        mappedUser.HashedPassword = hashedPassword;
        mappedUser.Salt = Convert.ToHexString(salt);
        mappedUser.Role = "User";

        //add new user to db
        await _usersDbContext.Users.AddAsync(mappedUser);
        await _usersDbContext.SaveChangesAsync();

        User userInDb = await _usersDbContext.Users.Where(u => u.Email == mappedUser.Email).FirstAsync();
        //generate jwt token after saving a new user to DB
        string token = GenerateToken(userInDb);
        return token;
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