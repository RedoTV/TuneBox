using TuneBox.Models;
using TuneBox.Models.Dtos;

namespace TuneBox.Services;

public interface IAuthService
{
    public Task<string> SignIn(UserSignInDto user);
    public Task<string> Register(UserRegisterDto user);
    public string GenerateToken(User user);
}