using Microsoft.EntityFrameworkCore;
using TuneBox.Models;

namespace TuneBox.DbContexts;

public class UsersDbContext : DbContext
{
    public UsersDbContext(DbContextOptions<UsersDbContext> options) : base(options)
    {
        Database.EnsureCreated();
    }

    public DbSet<User> Users { get; set; }
}
