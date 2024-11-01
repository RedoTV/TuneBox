namespace TuneBox.Models;

public class Song
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public string? AudioUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Новый путь к mp3-файлу
    public string? FilePath { get; set; }

    // Связи
    public Genre Genre { get; set; } = null!;
    public ICollection<PlaylistSong> PlaylistSongs { get; set; } = null!;
}
