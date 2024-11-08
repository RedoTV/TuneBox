using AutoMapper;
using TuneBox.Models;
using TuneBox.Models.Dtos;

namespace TuneBox.Mapper;

public class MusicProfile : Profile
{
    public MusicProfile()
    {
        // Маппинг для песни
        CreateMap<Song, SongResponseDto>()
            .ForMember(dest => dest.Genres, opt => opt.MapFrom(src => src.Genres.Select(g => g.Name)))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now))  // добавим текущую дату
            .ForMember(dest => dest.AudioUrl, opt => opt.MapFrom(src => src.AudioUrl));  // учитываем URL

        // Маппинг для плейлиста
        CreateMap<Playlist, PlaylistResponseDto>()
            .ForMember(dest => dest.Songs, opt => opt.MapFrom(src => src.PlaylistSongs.Select(ps => ps.Song).ToList()));

        // Маппинг для добавления песни
        CreateMap<AddSongRequestDto, Song>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())  // игнорируем Id при добавлении
            .ForMember(dest => dest.FilePath, opt => opt.Ignore());  // игнорируем путь к файлу

        // Маппинг для добавления плейлиста
        CreateMap<AddPlaylistRequestDto, Playlist>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())  // игнорируем Id при добавлении
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())  // игнорируем дату создания
            .ForMember(dest => dest.UserId, opt => opt.Ignore());  // игнорируем Id пользователя
    }
}
