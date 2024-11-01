using AutoMapper;
using TuneBox.Models;
using TuneBox.Models.Dtos;

namespace TuneBox.Mapper;

public class MusicProfile : Profile
{
    public MusicProfile()
    {
        CreateMap<AddSongRequestDto, Song>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FilePath, opt => opt.Ignore());
    }
}
