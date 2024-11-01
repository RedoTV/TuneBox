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
        List<Genre> genres = new List<Genre>();
        foreach (var genreName in songDto.Genres)
        {
            var genre = await GetGenreByNameAsync(genreName) ?? await AddGenreAsync(new Genre { Name = genreName });
            genres.Add(genre);
        }

        // Создаем уникальное имя для файла и путь в корневой директории "audios"
        var fileName = $"{Guid.NewGuid()}.mp3";
        var filePath = Path.Combine(_fileStoragePath, fileName);

        // Создаем директорию, если ее нет
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

        // Сохраняем файл на сервер
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await mp3File.CopyToAsync(stream);
        }

        // Определение длительности аудиофайла
        TimeSpan duration;
        using (var reader = new Mp3FileReader(filePath))
        {
            duration = reader.TotalTime;
        }

        // Создаем URL для доступа к аудиофайлу
        var request = _httpContextAccessor.HttpContext?.Request;
        string audioUrl = $"{request?.Scheme}://{request?.Host}/audios/{fileName}";

        // Преобразуем DTO в объект базы данных
        Song song = new Song()
        {
            Name = songDto.Name,
            Author = songDto.Author,
            Genres = genres,
            FilePath = filePath,
            Duration = duration,
            CreatedAt = DateTime.Now,
            AudioUrl = audioUrl
        };

        SongResponseDto songResponse = await MapSongToResponse(song);

        _tuneBoxContext.Songs.Add(song);
        await _tuneBoxContext.SaveChangesAsync();
        return songResponse;
    }


    // Метод для получения песни по ID
    public async Task<SongResponseDto?> GetSongByIdAsync(int songId)
    {
        var song = await _tuneBoxContext.Songs
            .Include(s => s.Genres)
            .FirstOrDefaultAsync(s => s.Id == songId);

        if (song == null)
            return null;

        return await MapSongToResponse(song);
    }

    public async Task<IEnumerable<SongResponseDto>> GetAllSongsAsync(int skip, int count)
    {
        var songs = await _tuneBoxContext.Songs
            .Include(s => s.Genres)
            .Skip(skip)
            .Take(count)
            .ToArrayAsync();

        return await MapSongsToResponses(songs);
    }

    public async Task<bool> DeleteSongAsync(int songId)
    {
        var song = await _tuneBoxContext.Songs.FindAsync(songId);
        if (song == null) return false;

        // Удаляем файл, связанный с песней, из хранилища
        if (File.Exists(song.FilePath))
        {
            File.Delete(song.FilePath);
        }

        _tuneBoxContext.Songs.Remove(song);
        await _tuneBoxContext.SaveChangesAsync();
        return true;
    }


    // Методы для работы с жанрами
    public async Task<Genre> AddGenreAsync(Genre genre)
    {
        if (_tuneBoxContext.Genres.Where(g => g.Name == genre.Name).Any())
            return genre;

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

    public async Task<ICollection<SongResponseDto>> GetSongsByGenreAsync(string genreName)
    {
        var genre = await _tuneBoxContext.Genres
            .Include(g => g.Songs)
            .FirstOrDefaultAsync(g => g.Name == genreName);

        if (genre == null || genre.Songs == null || !genre.Songs.Any())
        {
            // Вернем пустой список, если жанр не найден или у него нет песен
            return new List<SongResponseDto>();
        }

        return await MapSongsToResponses(genre.Songs);
    }

    public async Task<IEnumerable<Genre>> GetAllGenresAsync()
    {
        return await _tuneBoxContext.Genres.ToListAsync();
    }

    public async Task<bool> DeleteGenreAsync(string genreName)
    {
        var genre = await _tuneBoxContext.Genres.Where(g => g.Name == genreName).FirstAsync();
        if (genre == null) return false;

        _tuneBoxContext.Genres.Remove(genre);
        await _tuneBoxContext.SaveChangesAsync();
        return true;
    }

    // Методы для работы с плейлистами
    public async Task<Playlist> CreatePlaylistAsync(AddPlaylistRequestDto playlistDto)
    {
        var playlist = new Playlist
        {
            Name = playlistDto.Name,
            UserId = playlistDto.UserId,
            CreatedAt = DateTime.UtcNow
        };

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

    private async Task<SongResponseDto> MapSongToResponse(Song song)
    {
        return await Task.Run(() =>
        {
            var genres = song.Genres.Select(g => g.Name).ToList();
            SongResponseDto songResponse = new SongResponseDto()
            {
                Id = song.Id,
                Name = song.Name,
                Author = song.Author,
                Genres = genres,
                Duration = song.Duration,
                CreatedAt = DateTime.Now,
                AudioUrl = song.AudioUrl!
            };

            return songResponse;
        });
    }

    private async Task<ICollection<SongResponseDto>> MapSongsToResponses(IEnumerable<Song> songs)
    {
        var songResponses = new List<SongResponseDto>();
        foreach (var song in songs)
        {
            songResponses.Add(await MapSongToResponse(song));
        }
        return songResponses;
    }
}
