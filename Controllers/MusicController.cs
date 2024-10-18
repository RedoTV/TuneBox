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
    public IEnumerable<Song> Get()
    {
        return Enumerable.Range(1, 5).Select(index => new Song() { Id = index, Name = "Кокос" })
        .ToArray();
    }
}
