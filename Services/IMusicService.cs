using TuneBox.Models;
using Microsoft.AspNetCore.Http;
using TuneBox.Models.Dtos;

namespace TuneBox.Services;

public interface IMusicService
{
    Task<SongResponseDto> AddSongAsync(AddSongRequestDto songDto, IFormFile mp3File);
    Task<Song?> GetSongByIdAsync(int songId);
    Task<IEnumerable<Song>> GetAllSongsAsync();
    Task<bool> DeleteSongAsync(int songId);

    Task<Genre> AddGenreAsync(Genre genre);
    Task<Genre?> GetGenreByNameAsync(string genreName);
    Task<IEnumerable<Genre>> GetAllGenresAsync();
    Task<bool> DeleteGenreAsync(int genreId);

    Task<Playlist> CreatePlaylistAsync(Playlist playlist);
    Task<Playlist?> GetPlaylistByIdAsync(int playlistId);
    Task<IEnumerable<Playlist>> GetUserPlaylistsAsync(int userId);
    Task<bool> AddSongToPlaylistAsync(int playlistId, int songId);
    Task<bool> RemoveSongFromPlaylistAsync(int playlistId, int songId);
    Task<bool> DeletePlaylistAsync(int playlistId);
}
