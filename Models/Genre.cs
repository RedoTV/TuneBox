namespace TuneBox.Models;

public class Genre
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;  // Название жанра

    // Связи
    public ICollection<Song> Songs { get; set; } = null!; // Песни этого жанра
}