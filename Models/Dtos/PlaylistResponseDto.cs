namespace TuneBox.Models.Dtos;

public class PlaylistResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<SongResponseDto> Songs { get; set; } = new List<SongResponseDto>();

}
