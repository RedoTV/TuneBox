using Microsoft.EntityFrameworkCore;
using TuneBox.Models;

namespace TuneBox.DbContexts;

public class TuneBoxDbContext : DbContext
{
    public TuneBoxDbContext(DbContextOptions<TuneBoxDbContext> options) : base(options)
    {
    }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<Playlist> Playlist { get; set; }
}
