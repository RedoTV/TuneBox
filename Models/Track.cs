namespace TuneBox.Models;

public class Track
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Author { get; set; } = null!;
    public TimeSpan Duration { get; set; }
}
