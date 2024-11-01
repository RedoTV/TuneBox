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

    // Method to get all songs
    [HttpGet("songs")]
    public async Task<IEnumerable<SongResponseDto>> GetAllSongs(int skip, int count)
    {
        return await _musicService.GetAllSongsAsync(skip, count);
    }

    // Method to add a new song with mp3 file
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

    // Method to get song details by ID
    [HttpGet("songs/{songId}")]
    public async Task<ActionResult<SongResponseDto>> GetSongById(int songId)
    {
        var song = await _musicService.GetSongByIdAsync(songId);
        if (song == null) return NotFound();

        return song;
    }

    // Method to delete a song by ID
    [HttpDelete("songs/{songId}")]
    public async Task<IActionResult> DeleteSong(int songId)
    {
        var success = await _musicService.DeleteSongAsync(songId);
        if (!success) return NotFound();

        return NoContent();
    }

    // Method to get songs by genre
    [HttpGet("genres/{genreName}/songs")]
    public async Task<ICollection<SongResponseDto>> GetSongsByGenre(string genreName)
    {
        return await _musicService.GetSongsByGenreAsync(genreName);
    }

    // Method to get all genres
    [HttpGet("genres")]
    public async Task<IEnumerable<Genre>> GetAllGenres()
    {
        return await _musicService.GetAllGenresAsync();
    }

    // Method to delete a genre by ID
    [HttpDelete("genres/{genreName}")]
    public async Task<IActionResult> DeleteGenre(string genreName)
    {
        var success = await _musicService.DeleteGenreAsync(genreName);
        if (!success) return NotFound();

        return NoContent();
    }

    // Method to create a new playlist
    [HttpPost("playlists")]
    public async Task<IActionResult> CreatePlaylist(Playlist playlist)
    {
        var createdPlaylist = await _musicService.CreatePlaylistAsync(playlist);
        return Ok(createdPlaylist);
    }

    // Method to get a playlist by ID
    [HttpGet("playlists/{playlistId}")]
    public async Task<ActionResult<Playlist>> GetPlaylistById(int playlistId)
    {
        var playlist = await _musicService.GetPlaylistByIdAsync(playlistId);
        if (playlist == null) return NotFound();

        return playlist;
    }

    // Method to get user playlists
    [HttpGet("users/{userId}/playlists")]
    public async Task<IEnumerable<Playlist>> GetUserPlaylists(int userId)
    {
        return await _musicService.GetUserPlaylistsAsync(userId);
    }

    // Method to add a song to a playlist
    [HttpPost("playlists/{playlistId}/songs/{songId}")]
    public async Task<IActionResult> AddSongToPlaylist(int playlistId, int songId)
    {
        var success = await _musicService.AddSongToPlaylistAsync(playlistId, songId);
        if (!success) return NotFound();

        return NoContent();
    }

    // Method to remove a song from a playlist
    [HttpDelete("playlists/{playlistId}/songs/{songId}")]
    public async Task<IActionResult> RemoveSongFromPlaylist(int playlistId, int songId)
    {
        var success = await _musicService.RemoveSongFromPlaylistAsync(playlistId, songId);
        if (!success) return NotFound();

        return NoContent();
    }

    // Method to delete a playlist by ID
    [HttpDelete("playlists/{playlistId}")]
    public async Task<IActionResult> DeletePlaylist(int playlistId)
    {
        var success = await _musicService.DeletePlaylistAsync(playlistId);
        if (!success) return NotFound();

        return NoContent();
    }
}
