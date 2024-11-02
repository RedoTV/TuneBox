using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneBox.Models.Dtos;
using TuneBox.Services;

namespace TuneBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistsController : ControllerBase
{
    private readonly IMusicService _musicService;

    public PlaylistsController(IMusicService musicService)
    {
        _musicService = musicService;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreatePlaylist(AddPlaylistRequestDto playlistDto)
    {
        var userClaimId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userClaimId == null)
            return BadRequest("User ID not found in claims.");

        var userId = int.Parse(userClaimId);
        var playlist = await _musicService.CreatePlaylistAsync(playlistDto);

        return Ok(new { userId, playlist });
    }

    [HttpGet("{playlistId}")]
    public async Task<IActionResult> GetPlaylistById(int playlistId)
    {
        var playlist = await _musicService.GetPlaylistByIdAsync(playlistId);
        if (playlist == null)
            return NotFound();

        return Ok(playlist);
    }

    [Authorize]
    [HttpPut("{playlistId}")]
    public async Task<IActionResult> UpdatePlaylist(int playlistId, [FromBody] UpdatePlaylistRequestDto playlistDto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return BadRequest("User ID not found in claims.");

        var userId = int.Parse(userIdClaim);

        if (!await _musicService.IsPlaylistOwnerAsync(userId, playlistId))
        {
            return Forbid();
        }

        var updatedPlaylist = await _musicService.UpdatePlaylistAsync(playlistId, playlistDto);
        if (updatedPlaylist == null)
            return NotFound();

        return Ok(updatedPlaylist);
    }

    [Authorize]
    [HttpDelete("{playlistId}")]
    public async Task<IActionResult> DeletePlaylist(int playlistId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return BadRequest("User ID not found in claims.");

        var userId = int.Parse(userIdClaim);

        if (!await _musicService.IsPlaylistOwnerAsync(userId, playlistId))
        {
            return Forbid();
        }

        var success = await _musicService.DeletePlaylistAsync(playlistId);
        if (!success)
            return NotFound();

        return NoContent();
    }

    [Authorize]
    [HttpPost("{playlistId}/songs/{songId}")]
    public async Task<IActionResult> AddSongToPlaylist(int playlistId, int songId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return BadRequest("User ID not found in claims.");

        var userId = int.Parse(userIdClaim);

        if (!await _musicService.IsPlaylistOwnerAsync(userId, playlistId))
        {
            return Forbid();
        }

        var success = await _musicService.AddSongToPlaylistAsync(playlistId, songId);
        if (!success)
            return NotFound();

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{playlistId}/songs/{songId}")]
    public async Task<IActionResult> RemoveSongFromPlaylist(int playlistId, int songId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return BadRequest("User ID not found in claims.");

        var userId = int.Parse(userIdClaim);

        if (!await _musicService.IsPlaylistOwnerAsync(userId, playlistId))
        {
            return Forbid();
        }

        var success = await _musicService.RemoveSongFromPlaylistAsync(playlistId, songId);
        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpGet("users/{userId}/playlists")]
    public async Task<IEnumerable<PlaylistResponseDto>> GetUserPlaylists(int userId)
    {
        return await _musicService.GetUserPlaylistsAsync(userId);
    }
}
