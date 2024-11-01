namespace TuneBox.Models.Dtos;

public class AddSongRequestDto
{
    public required string Name { get; set; } = string.Empty;
    public required string Author { get; set; }
    public required string Genre { get; set; }
}