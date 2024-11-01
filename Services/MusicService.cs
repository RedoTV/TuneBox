using TuneBox.Models;
using TuneBox.DbContexts;
using Microsoft.EntityFrameworkCore;
using TuneBox.Models.Dtos;
using NAudio.Wave;

namespace TuneBox.Services;
public class MusicService : IMusicService
{
    private readonly TuneBoxDbContext _tuneBoxContext;
    private readonly string _fileStoragePath;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public MusicService(TuneBoxDbContext tuneBoxContext, string fileStoragePath, IHttpContextAccessor httpContextAccessor)
    {
        _tuneBoxContext = tuneBoxContext;
        _fileStoragePath = fileStoragePath;
        _httpContextAccessor = httpContextAccessor;
    }

    // Метод для добавления песни с загрузкой mp3-файла
    public async Task<SongResponseDto> AddSongAsync(AddSongRequestDto songDto, IFormFile mp3File)
    {
        Genre? genre = await GetGenreByNameAsync(songDto.Genre);
        if (genre == null)
        {
            genre = new Genre() { Name = songDto.Name };
            await AddGenreAsync(genre);
        }

        // Создаем уникальное имя для файла и путь
        var fileName = $"{Guid.NewGuid()}.mp3";
        var filePath = Path.Combine(_fileStoragePath, fileName);

        // Сохраняем файл на сервер
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!); // Проверяем на наличие папки
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await mp3File.CopyToAsync(stream);
        }

        // Найдем длительность песни с помощью сторонней библиотеки
        TimeSpan duration;
        using (var reader = new Mp3FileReader(filePath))
        {
            duration = reader.TotalTime;
        }

        // Создать AudioUrl
        var request = _httpContextAccessor.HttpContext?.Request;
        string audioUrl = $"{request?.Scheme}://{request?.Host}/audio/mp3/{fileName}";

        //преобразуем dto в объект бд
        Song song = new Song()
        {
            Name = songDto.Name,
            Author = songDto.Author,
            Genre = genre,
            FilePath = filePath,
            Duration = duration,
            CreatedAt = DateTime.Now,
            AudioUrl = audioUrl
        };

        SongResponseDto songResponse = new SongResponseDto()
        {
            Name = songDto.Name,
            Author = songDto.Author,
            Genre = genre.Name,
            Duration = duration,
            CreatedAt = DateTime.Now,
            AudioUrl = audioUrl
        };

        _tuneBoxContext.Songs.Add(song);
        await _tuneBoxContext.SaveChangesAsync();
        return songResponse;
    }

    // Метод для получения песни по ID
    public async Task<Song?> GetSongByIdAsync(int songId)
    {
        return await _tuneBoxContext.Songs.FindAsync(songId);
    }

    public async Task<IEnumerable<Song>> GetAllSongsAsync()
    {
        return await _tuneBoxContext.Songs.ToListAsync();
    }

    public async Task<bool> DeleteSongAsync(int songId)
    {
        var song = await _tuneBoxContext.Songs.FindAsync(songId);
        if (song == null) return false;

        _tuneBoxContext.Songs.Remove(song);
        await _tuneBoxContext.SaveChangesAsync();
        return true;
    }

    // Методы для работы с жанрами
    public async Task<Genre> AddGenreAsync(Genre genre)
    {
        _tuneBoxContext.Genres.Add(genre);
        await _tuneBoxContext.SaveChangesAsync();
        return genre;
    }

    public async Task<Genre?> GetGenreByNameAsync(string genreName)
    {
        return await _tuneBoxContext.Genres
            .Where(g => g.Name == genreName)
            .SingleOrDefaultAsync();
    }

    public async Task<IEnumerable<Genre>> GetAllGenresAsync()
    {
        return await _tuneBoxContext.Genres.ToListAsync();
    }

    public async Task<bool> DeleteGenreAsync(int genreId)
    {
        var genre = await _tuneBoxContext.Genres.FindAsync(genreId);
        if (genre == null) return false;

        _tuneBoxContext.Genres.Remove(genre);
        await _tuneBoxContext.SaveChangesAsync();
        return true;
    }

    // Методы для работы с плейлистами
    public async Task<Playlist> CreatePlaylistAsync(Playlist playlist)
    {
        _tuneBoxContext.Playlists.Add(playlist);
        await _tuneBoxContext.SaveChangesAsync();
        return playlist;
    }

    public async Task<Playlist?> GetPlaylistByIdAsync(int playlistId)
    {
        return await _tuneBoxContext.Playlists
            .Include(p => p.PlaylistSongs)
            .ThenInclude(ps => ps.Song)
            .FirstOrDefaultAsync(p => p.Id == playlistId);
    }

    public async Task<IEnumerable<Playlist>> GetUserPlaylistsAsync(int userId)
    {
        return await _tuneBoxContext.Playlists
            .Where(p => p.UserId == userId)
            .Include(p => p.PlaylistSongs)
            .ThenInclude(ps => ps.Song)
            .ToListAsync();
    }

    public async Task<bool> AddSongToPlaylistAsync(int playlistId, int songId)
    {
        var playlist = await _tuneBoxContext.Playlists.FindAsync(playlistId);
        var song = await _tuneBoxContext.Songs.FindAsync(songId);

        if (playlist == null || song == null)
            return false;

        var playlistSong = new PlaylistSong { PlaylistId = playlistId, SongId = songId };
        _tuneBoxContext.PlaylistSongs.Add(playlistSong);
        await _tuneBoxContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveSongFromPlaylistAsync(int playlistId, int songId)
    {
        var playlistSong = await _tuneBoxContext.PlaylistSongs
            .FirstOrDefaultAsync(ps => ps.PlaylistId == playlistId && ps.SongId == songId);

        if (playlistSong == null) return false;

        _tuneBoxContext.PlaylistSongs.Remove(playlistSong);
        await _tuneBoxContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeletePlaylistAsync(int playlistId)
    {
        var playlist = await _tuneBoxContext.Playlists.FindAsync(playlistId);
        if (playlist == null) return false;

        _tuneBoxContext.Playlists.Remove(playlist);
        await _tuneBoxContext.SaveChangesAsync();
        return true;
    }
}
