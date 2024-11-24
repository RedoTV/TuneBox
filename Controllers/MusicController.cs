using Microsoft.AspNetCore.Authorization;
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

    // Methods open to public access (no authorization required)
    [HttpGet("songs")]
    public async Task<IEnumerable<SongResponseDto>> GetAllSongs(int skip = 0, int count = 10)
    {
        return await _musicService.GetAllSongsAsync(skip, count);
    }

    [HttpGet("songs/{songId}")]
    public async Task<ActionResult<SongResponseDto>> GetSongById(int songId)
    {
        var song = await _musicService.GetSongByIdAsync(songId);
        if (song == null) return NotFound();

        return song;
    }

    [HttpGet("genres/{genreName}/songs")]
    public async Task<ICollection<SongResponseDto>> GetSongsByGenre(string genreName)
    {
        return await _musicService.GetSongsByGenreAsync(genreName);
    }

    [HttpGet("genres")]
    public async Task<IEnumerable<Genre>> GetAllGenres()
    {
        return await _musicService.GetAllGenresAsync();
    }

    // Admin-only methods
    [Authorize(Policy = "AdminPolicy")]
    [HttpPost("songs")]
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

    [HttpGet("songs/search")]
    public async Task<IEnumerable<SongResponseDto>> SearchSongs([FromQuery] string searchTerm)
    {
        return await _musicService.SearchSongsByNameOrAuthorAsync(searchTerm);
    }


    [Authorize(Policy = "AdminPolicy")]
    [HttpDelete("songs/{songId}")]
    public async Task<IActionResult> DeleteSong(int songId)
    {
        var success = await _musicService.DeleteSongAsync(songId);
        if (!success) return NotFound();

        return NoContent();
    }

    [Authorize(Policy = "AdminPolicy")]
    [HttpDelete("genres/{genreName}")]
    public async Task<IActionResult> DeleteGenre(string genreName)
    {
        var success = await _musicService.DeleteGenreAsync(genreName);
        if (!success) return NotFound();

        return NoContent();
    }
}
