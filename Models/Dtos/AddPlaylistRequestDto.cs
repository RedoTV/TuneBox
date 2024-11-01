namespace TuneBox.Models.Dtos;

public class AddPlaylistRequestDto
{
    public required string Name { get; set; } = string.Empty; // Название плейлиста
    public int UserId { get; set; }  // Владелец плейлиста
}
