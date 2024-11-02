using Microsoft.EntityFrameworkCore;
using TuneBox.Models;

namespace TuneBox.DbContexts;

public class TuneBoxDbContext : DbContext
{
    public TuneBoxDbContext(DbContextOptions<TuneBoxDbContext> options) : base(options)
    {
    }

    public DbSet<Genre> Genres { get; set; }
    public DbSet<Playlist> Playlists { get; set; }
    public DbSet<Song> Songs { get; set; }
    public DbSet<PlaylistSong> PlaylistSongs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
