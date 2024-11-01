namespace TuneBox.Models.Dtos;

public class SongResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public ICollection<string> Genres { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string AudioUrl { get; set; } = string.Empty;
}
