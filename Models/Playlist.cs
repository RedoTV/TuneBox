namespace TuneBox.Models;

public class Playlist
{
    public int Id { get; set; }
    public string Name { get; set; } = null!; // Название плейлиста
    public DateTime CreatedAt { get; set; }  // Дата создания

    // Связи
    public int UserId { get; set; }  // Владелец плейлиста
    public ICollection<PlaylistSong> PlaylistSongs { get; set; } = null!; // Песни в плейлисте через промежуточную таблицу
}