namespace TuneBox.Models;

public class Song
{
    public int Id { get; set; }

    // Название трека
    public string Name { get; set; } = string.Empty;

    // Исполнитель трека
    public string Author { get; set; } = string.Empty;

    // Длительность трека
    public TimeSpan Duration { get; set; }

    // Дополнительно можно добавить альбом, жанр и URL аудиофайла
    public string? Album { get; set; }   // Опционально, если нужно указать альбом
    public string? Genre { get; set; }   // Опциональный жанр
    public string? AudioUrl { get; set; }   // URL аудиофайла

    // Метаданные
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Дата добавления трека
    // Связи
    public ICollection<PlaylistSong> PlaylistSongs { get; set; } = null!; // Связь с плейлистами через промежуточную таблицу
}