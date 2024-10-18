using AutoMapper;
using TuneBox.Models;
using TuneBox.Models.Dtos;

namespace TuneBox.Mapper;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<UserSignInDto, User>();
        CreateMap<UserRegisterDto, User>();
    }
}
