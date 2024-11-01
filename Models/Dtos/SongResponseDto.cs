namespace TuneBox.Models.Dtos;

public class SongResponseDto
{
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public string Genre { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string AudioUrl { get; set; } = string.Empty;
}
