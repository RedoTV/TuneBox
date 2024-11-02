using Microsoft.AspNetCore.Mvc;
using TuneBox.Models.Dtos;
using TuneBox.Services;

namespace TuneBox.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private IAuthService AuthService { get; }
    private ILogger<UsersController> Logger { get; }

    public UsersController(IAuthService authService, ILogger<UsersController> logger)
    {
        AuthService = authService;
        Logger = logger;
    }

    [HttpPost("Register")]
    public async Task<IActionResult> Register(UserRegisterDto user)
    {
        try
        {
            var registerResponse = await AuthService.Register(user);
            return Ok(registerResponse);
        }
        catch (Exception exc)
        {
            Logger.LogError(exc.Message);
            return BadRequest(exc.Message);
        }
    }

    [HttpPost("SignIn")]
    public async Task<IActionResult> SignIn(UserSignInDto user)
    {
        try
        {
            var signInResponse = await AuthService.SignIn(user);
            return Ok(signInResponse);
        }
        catch (Exception exc)
        {
            Logger.LogError(exc.Message);
            return BadRequest(exc.Message);
        }
    }
}