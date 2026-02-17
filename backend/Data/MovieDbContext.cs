using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Models.Entities.Basics;
using MovieRating.Backend.Models.Entities.Extra;

namespace MovieRating.Backend.Data;

public class MovieDbContext : DbContext
{
    public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<MovieGenre> MovieGenres => Set<MovieGenre>();
    public DbSet<Watchlist> Watchlist => Set<Watchlist>();
    public DbSet<HomeSection> HomeSections => Set<HomeSection>();
    public DbSet<HomeSectionMovie> HomeSectionMovies => Set<HomeSectionMovie>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.HasIndex(u => u.Username)
                  .IsUnique();

            entity.HasIndex(u => u.Email)
                  .IsUnique();

            entity.Property(u => u.Role)
                  .HasConversion<string>();

            entity.HasQueryFilter(u => !u.IsDeleted);
        });
        
        // Movie
        modelBuilder.Entity<Movie>(entity =>
        {
            entity.HasKey(m => m.Id);

            entity.Property(m => m.AverageRating)
                  .HasPrecision(4, 2);

            entity.Property(m => m.AddedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
        });
        
        // Genre
        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(g => g.Id);

            entity.HasIndex(g => g.Name)
                  .IsUnique();
        });
        
        // MovieGenre (many-to-many join)
        modelBuilder.Entity<MovieGenre>(entity =>
        {
            entity.HasKey(mg => new { mg.MovieId, mg.GenreId });

            entity.HasOne(mg => mg.Movie)
                  .WithMany(m => m.MovieGenres)
                  .HasForeignKey(mg => mg.MovieId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(mg => mg.Genre)
                  .WithMany(g => g.MovieGenres)
                  .HasForeignKey(mg => mg.GenreId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
        
        // Review (many-to-many join with payload)
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => new { r.UserId, r.MovieId });

            entity.HasOne(r => r.User)
                  .WithMany(u => u.Reviews)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Movie)
                  .WithMany(m => m.Reviews)
                  .HasForeignKey(r => r.MovieId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(r => r.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
        });
        
        // Watchlist (many-to-many join with payload)
        modelBuilder.Entity<Watchlist>(entity =>
        {
            entity.HasKey(w => new { w.UserId, w.MovieId });

            entity.HasOne(w => w.User)
                  .WithMany(u => u.Watchlist)
                  .HasForeignKey(w => w.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(w => w.Movie)
                  .WithMany(m => m.Watchlist)
                  .HasForeignKey(w => w.MovieId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(w => w.AddedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
        });
        
        // HomeSection
        modelBuilder.Entity<HomeSection>(entity =>
        {
            entity.HasKey(hs => hs.Id);

            entity.Property(hs => hs.Type)
                  .HasConversion<string>();

            entity.Property(hs => hs.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(hs => hs.Genre)
                  .WithMany()
                  .HasForeignKey(hs => hs.GenreId)
                  .OnDelete(DeleteBehavior.SetNull)
                  .IsRequired(false);
        });
        
        // HomeSectionMovie (many-to-many join)
        modelBuilder.Entity<HomeSectionMovie>(entity =>
        {
            entity.HasKey(hsm => new { hsm.HomeSectionId, hsm.MovieId });

            entity.HasOne(hsm => hsm.HomeSection)
                  .WithMany(hs => hs.Movies)
                  .HasForeignKey(hsm => hsm.HomeSectionId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(hsm => hsm.Movie)
                  .WithMany()
                  .HasForeignKey(hsm => hsm.MovieId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}