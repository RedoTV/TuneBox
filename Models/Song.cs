namespace TuneBox.Models;

public class Song
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public string? AudioUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? FilePath { get; set; }

    // Связи
    public ICollection<Genre> Genres { get; set; } = null!;
    public ICollection<PlaylistSong> PlaylistSongs { get; set; } = null!;
}
