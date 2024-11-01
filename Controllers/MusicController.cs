using Microsoft.AspNetCore.Mvc;
using TuneBox.Models;
using TuneBox.Models.Dtos;
using TuneBox.Services;

namespace TuneBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MusicController : ControllerBase
{
    private readonly ILogger<MusicController> _logger;
    private readonly IMusicService _musicService;

    public MusicController(ILogger<MusicController> logger, IMusicService musicService)
    {
        _logger = logger;
        _musicService = musicService;
    }

    // Метод для получения всех песен
    [HttpGet]
    public async Task<IEnumerable<Song>> GetAllSongs()
    {
        return await _musicService.GetAllSongsAsync();
    }

    // Метод для добавления новой песни с mp3-файлом
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> AddSong([FromForm] AddSongRequestDto song, IFormFile mp3File)
    {
        if (mp3File == null || mp3File.Length == 0)
        {
            return BadRequest("MP3 file is required.");
        }

        var addedSong = await _musicService.AddSongAsync(song, mp3File);
        return Ok(addedSong);
    }


    // Метод для получения информации о песне по ID
    [HttpGet("{songId}")]
    public async Task<ActionResult<Song>> GetSongById(int songId)
    {
        var song = await _musicService.GetSongByIdAsync(songId);
        if (song == null) return NotFound();

        return song;
    }
}
