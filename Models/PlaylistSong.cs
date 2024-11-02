using System.ComponentModel.DataAnnotations;

namespace TuneBox.Models;

public class PlaylistSong
{
    [Key]
    public int Id { get; set; }
    public Playlist Playlist { get; set; } = null!;

    public int SongId { get; set; }
    public Song Song { get; set; } = null!;
}