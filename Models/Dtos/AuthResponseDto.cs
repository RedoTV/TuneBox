namespace TuneBox.Models.Dtos;

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required string UserName { get; set; }
    public int UserId { get; set; }
}