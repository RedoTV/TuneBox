using TuneBox.Models;
using TuneBox.Models.Dtos;

namespace TuneBox.Services;

public interface IAuthService
{
    Task<AuthResponseDto> SignIn(UserSignInDto user);
    Task<AuthResponseDto> Register(UserRegisterDto user);
    string GenerateToken(User user);
}