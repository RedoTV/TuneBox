using TuneBox.Models;
using TuneBox.DbContexts;
using Microsoft.EntityFrameworkCore;
using TuneBox.Models.Dtos;
using NAudio.Wave;
using System.Security.Claims;
using AutoMapper;

namespace TuneBox.Services
{
    public class MusicService : IMusicService
    {
        private readonly TuneBoxDbContext _tuneBoxContext;
        private readonly string _fileStoragePath;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        // Конструктор сервиса для инициализации зависимостей
        public MusicService(TuneBoxDbContext tuneBoxContext, string fileStoragePath, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _tuneBoxContext = tuneBoxContext;
            _fileStoragePath = fileStoragePath;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        // Метод для добавления песни с загрузкой mp3-файла
        public async Task<SongResponseDto> AddSongAsync(AddSongRequestDto songDto, IFormFile mp3File)
        {
            List<Genre> genres = new List<Genre>();

            // Добавляем жанры, если они еще не существуют
            foreach (var genreName in songDto.Genres)
            {
                var genre = await GetGenreByNameAsync(genreName) ?? await AddGenreAsync(new Genre { Name = genreName });
                genres.Add(genre);
            }

            // Создаем уникальное имя для файла и путь для сохранения
            var fileName = $"{Guid.NewGuid()}.mp3";
            var filePath = Path.Combine(_fileStoragePath, fileName);

            // Создаем директорию, если ее нет
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

            // Сохраняем mp3-файл на сервере
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

            // Формируем URL для доступа к файлу
            var request = _httpContextAccessor.HttpContext?.Request;
            string audioUrl = $"{request?.Scheme}://{request?.Host}/audios/{fileName}";

            // Преобразуем DTO в объект песни для сохранения в БД
            var song = new Song()
            {
                Name = songDto.Name,
                Author = songDto.Author,
                Genres = genres,
                FilePath = filePath,
                Duration = duration,
                CreatedAt = DateTime.Now,
                AudioUrl = audioUrl
            };

            // Добавляем песню в БД и сохраняем изменения
            _tuneBoxContext.Songs.Add(song);
            await _tuneBoxContext.SaveChangesAsync();

            // Преобразуем объект песни в DTO для ответа
            return _mapper.Map<SongResponseDto>(song);
        }

        // Метод для получения песни по ID
        public async Task<SongResponseDto?> GetSongByIdAsync(int songId)
        {
            var song = await _tuneBoxContext.Songs
                .Include(s => s.Genres)
                .FirstOrDefaultAsync(s => s.Id == songId);

            if (song == null)
                return null;

            // Преобразуем песню в DTO
            return _mapper.Map<SongResponseDto>(song);
        }

        // Метод для получения всех песен с пагинацией
        public async Task<IEnumerable<SongResponseDto>> GetAllSongsAsync(int skip, int count)
        {
            var songs = await _tuneBoxContext.Songs
                .Include(s => s.Genres)
                .Skip(skip)
                .Take(count)
                .ToArrayAsync();

            // Преобразуем коллекцию песен в DTO
            return _mapper.Map<IEnumerable<SongResponseDto>>(songs);
        }

        // Метод для удаления песни по ID
        public async Task<bool> DeleteSongAsync(int songId)
        {
            var song = await _tuneBoxContext.Songs.FindAsync(songId);
            if (song == null) return false;

            // Удаляем файл, связанный с песней
            if (File.Exists(song.FilePath))
            {
                File.Delete(song.FilePath);
            }

            // Удаляем песню из БД
            _tuneBoxContext.Songs.Remove(song);
            await _tuneBoxContext.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<SongResponseDto>> SearchSongsByNameOrAuthorAsync(string searchTerm)
        {
            var songs = await _tuneBoxContext.Songs
                .Include(s => s.Genres)
                .Where(s => EF.Functions.Like(s.Name, $"%{searchTerm}%") || EF.Functions.Like(s.Author, $"%{searchTerm}%"))
                .ToListAsync();

            // Преобразуем коллекцию песен в DTO
            return _mapper.Map<IEnumerable<SongResponseDto>>(songs);
        }

        // Методы для работы с жанрами
        public async Task<Genre> AddGenreAsync(Genre genre)
        {
            // Если жанр уже существует, не добавляем
            if (_tuneBoxContext.Genres.Where(g => g.Name == genre.Name).Any())
                return genre;

            // Добавляем новый жанр в БД
            _tuneBoxContext.Genres.Add(genre);
            await _tuneBoxContext.SaveChangesAsync();
            return genre;
        }

        // Метод для получения жанра по имени
        public async Task<Genre?> GetGenreByNameAsync(string genreName)
        {
            return await _tuneBoxContext.Genres
                .Where(g => g.Name == genreName)
                .SingleOrDefaultAsync();
        }

        // Получение всех песен по жанру
        public async Task<ICollection<SongResponseDto>> GetSongsByGenreAsync(string genreName)
        {
            var genre = await _tuneBoxContext.Genres
                .Include(g => g.Songs)
                .FirstOrDefaultAsync(g => g.Name == genreName);

            if (genre == null || genre.Songs == null || !genre.Songs.Any())
            {
                // Если жанр не найден или у него нет песен, возвращаем пустой список
                return new List<SongResponseDto>();
            }

            // Преобразуем песни жанра в DTO
            return _mapper.Map<ICollection<SongResponseDto>>(genre.Songs);
        }

        // Получение всех жанров
        public async Task<IEnumerable<Genre>> GetAllGenresAsync()
        {
            return await _tuneBoxContext.Genres.ToListAsync();
        }

        // Удаление жанра по имени
        public async Task<bool> DeleteGenreAsync(string genreName)
        {
            var genre = await _tuneBoxContext.Genres.Where(g => g.Name == genreName).FirstAsync();
            if (genre == null) return false;

            // Удаляем жанр из БД
            _tuneBoxContext.Genres.Remove(genre);
            await _tuneBoxContext.SaveChangesAsync();
            return true;
        }

        // Методы для работы с плейлистами
        public async Task<PlaylistResponseDto?> GetPlaylistByIdAsync(int playlistId)
        {
            var playlist = await _tuneBoxContext.Playlists
                .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                .ThenInclude(s => s.Genres)
                .FirstOrDefaultAsync(p => p.Id == playlistId);

            if (playlist == null) return null;

            // Преобразуем плейлист в DTO
            return _mapper.Map<PlaylistResponseDto>(playlist);
        }

        // Получение всех плейлистов с ограничением по количеству
        public async Task<IEnumerable<PlaylistResponseDto>> GetAllPlaylistsAsync(int limit)
        {
            var playlists = await _tuneBoxContext.Playlists
                .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                .ThenInclude(s => s.Genres)
                .Take(limit)
                .ToListAsync();

            // Преобразуем коллекцию плейлистов в DTO
            return _mapper.Map<IEnumerable<PlaylistResponseDto>>(playlists);
        }

        // Создание нового плейлиста
        public async Task<Playlist?> CreatePlaylistAsync(AddPlaylistRequestDto playlistDto)
        {
            // Извлекаем ID пользователя из claims
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return null; // Если пользователя нет, возвращаем null

            int userId = int.Parse(userIdClaim.Value);

            var playlist = new Playlist
            {
                Name = playlistDto.Name,
                UserId = userId, // Присваиваем ID пользователя
                CreatedAt = DateTime.UtcNow
            };

            // Добавляем новый плейлист в БД
            _tuneBoxContext.Playlists.Add(playlist);
            await _tuneBoxContext.SaveChangesAsync();

            // Возвращаем созданный плейлист
            return _mapper.Map<Playlist>(playlist);
        }

        // Поиск плейлистов по имени
        public async Task<IEnumerable<PlaylistResponseDto>> SearchPlaylistsByNameAsync(string name)
        {
            var playlists = await _tuneBoxContext.Playlists
                .Where(p => p.Name.Contains(name))
                .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                .ThenInclude(s => s.Genres)
                .ToListAsync();

            // Преобразуем плейлисты в DTO
            return _mapper.Map<IEnumerable<PlaylistResponseDto>>(playlists);
        }

        // Получение плейлистов пользователя по ID
        public async Task<IEnumerable<PlaylistResponseDto>> GetUserPlaylistsAsync(int userId)
        {
            var playlists = await _tuneBoxContext.Playlists
                .Where(p => p.UserId == userId)
                .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                .ThenInclude(s => s.Genres)
                .ToListAsync();

            // Преобразуем плейлисты в DTO
            return _mapper.Map<IEnumerable<PlaylistResponseDto>>(playlists);
        }

        // Обновление плейлиста
        public async Task<PlaylistResponseDto?> UpdatePlaylistAsync(int playlistId, UpdatePlaylistRequestDto playlistDto)
        {
            // Ищем плейлист по ID
            var playlist = await _tuneBoxContext.Playlists
                .Include(p => p.PlaylistSongs)
                .ThenInclude(ps => ps.Song)
                .ThenInclude(s => s.Genres)
                .FirstOrDefaultAsync(p => p.Id == playlistId);

            if (playlist == null)
                return null; // Если плейлист не найден, возвращаем null

            // Обновляем данные плейлиста на основе DTO
            if (!string.IsNullOrEmpty(playlistDto.Name))
            {
                playlist.Name = playlistDto.Name;
            }

            // Сохраняем изменения в БД
            _tuneBoxContext.Playlists.Update(playlist);
            await _tuneBoxContext.SaveChangesAsync();

            // Преобразуем обновленный плейлист в DTO
            return _mapper.Map<PlaylistResponseDto>(playlist);
        }

        // Удаление плейлиста
        public async Task<bool> DeletePlaylistAsync(int playlistId)
        {
            var playlist = await _tuneBoxContext.Playlists.FindAsync(playlistId);
            if (playlist == null) return false;

            // Удаляем плейлист из БД
            _tuneBoxContext.Playlists.Remove(playlist);
            await _tuneBoxContext.SaveChangesAsync();
            return true;
        }

        // Добавление песни в плейлист
        public async Task<bool> AddSongToPlaylistAsync(int playlistId, int songId)
        {
            var playlist = await _tuneBoxContext.Playlists.FindAsync(playlistId);
            var song = await _tuneBoxContext.Songs.FindAsync(songId);

            if (playlist == null || song == null)
                return false;

            // Создаем связь между песней и плейлистом
            var playlistSong = new PlaylistSong { SongId = songId, Playlist = playlist };
            _tuneBoxContext.PlaylistSongs.Add(playlistSong);
            await _tuneBoxContext.SaveChangesAsync();
            return true;
        }

        // Удаление песни из плейлиста
        public async Task<bool> RemoveSongFromPlaylistAsync(int playlistId, int songId)
        {
            var playlistSong = await _tuneBoxContext.PlaylistSongs
                .Include(playlistSong => playlistSong.Playlist)
                .FirstOrDefaultAsync(playlistSong => playlistSong.Playlist.Id == playlistId && playlistSong.SongId == songId);

            if (playlistSong == null) return false;

            // Удаляем связь между песней и плейлистом
            _tuneBoxContext.PlaylistSongs.Remove(playlistSong);
            await _tuneBoxContext.SaveChangesAsync();
            return true;
        }

        // Проверка, является ли пользователь владельцем плейлиста
        public async Task<bool> IsPlaylistOwnerAsync(int playlistId, int userId)
        {
            return await _tuneBoxContext.Playlists
                .AnyAsync(p => p.Id == playlistId && p.UserId == userId);
        }
    }
}