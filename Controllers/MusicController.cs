using Microsoft.AspNetCore.Mvc;
using TuneBox.Models;

namespace TuneBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MusicController : ControllerBase
{
    private readonly ILogger<MusicController> _logger;

    public MusicController(ILogger<MusicController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IEnumerable<Track> Get()
    {
        return Enumerable.Range(1, 5).Select(index => new Track() { Id = index, Name = "Кокос" })
        .ToArray();
    }
}
