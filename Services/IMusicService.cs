using TuneBox.Models;
using Microsoft.AspNetCore.Http;
using TuneBox.Models.Dtos;

namespace TuneBox.Services;

public interface IMusicService
{
    Task<SongResponseDto> AddSongAsync(AddSongRequestDto songDto, IFormFile mp3File);
    Task<SongResponseDto?> GetSongByIdAsync(int songId);
    Task<IEnumerable<SongResponseDto>> GetAllSongsAsync(int skip, int count);
    Task<bool> DeleteSongAsync(int songId);

    Task<Genre> AddGenreAsync(Genre genre);
    Task<Genre?> GetGenreByNameAsync(string genreName);
    Task<ICollection<SongResponseDto>> GetSongsByGenreAsync(string genreName);
    Task<IEnumerable<Genre>> GetAllGenresAsync();
    Task<bool> DeleteGenreAsync(string genreName);

    Task<Playlist?> CreatePlaylistAsync(AddPlaylistRequestDto playlistDto);
    Task<PlaylistResponseDto?> GetPlaylistByIdAsync(int playlistId);
    Task<IEnumerable<PlaylistResponseDto>> GetUserPlaylistsAsync(int userId);
    Task<bool> AddSongToPlaylistAsync(int playlistId, int songId);
    Task<bool> RemoveSongFromPlaylistAsync(int playlistId, int songId);
    Task<PlaylistResponseDto?> UpdatePlaylistAsync(int playlistId, UpdatePlaylistRequestDto playlistDto);
    Task<bool> DeletePlaylistAsync(int playlistId);
    Task<bool> IsPlaylistOwnerAsync(int playlistId, int userId);

}
