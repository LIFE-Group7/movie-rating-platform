using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Models.Dashboard;
using MovieRating.Backend.Models.Generic;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Models.User;

namespace MovieRating.Backend.Data;

public class MovieDbContext : DbContext
{
    public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<ReviewMovie> ReviewMovies => Set<ReviewMovie>();
    
    public DbSet<ReviewShow> ReviewShows => Set<ReviewShow>();
    public DbSet<MovieGenre> MovieGenres => Set<MovieGenre>();
    public DbSet<Watchlist> Watchlist => Set<Watchlist>();
    public DbSet<HomeSection> HomeSections => Set<HomeSection>();
    public DbSet<HomeSectionMovie> HomeSectionMovies => Set<HomeSectionMovie>();
    
    public DbSet<HomeSectionShow> HomeSectionShows => Set<HomeSectionShow>();
    public DbSet<Show> Shows => Set<Show>();
    public DbSet<ShowGenre> ShowGenres => Set<ShowGenre>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
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
        
        modelBuilder.Entity<Movie>(entity =>
        {
            entity.HasKey(m => m.Id);

            entity.Property(m => m.AverageRating)
                  .HasPrecision(4, 2);

            entity.Property(m => m.AddedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
        });
        
        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(g => g.Id);

            entity.HasIndex(g => g.Name)
                  .IsUnique();
        });
        
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
        
        modelBuilder.Entity<ReviewMovie>(entity =>
        {
              entity.HasKey(r => new { r.UserId, r.MovieId });

              entity.HasOne(r => r.User)
                    .WithMany(u => u.MovieReviews)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

              entity.HasOne(r => r.Movie)
                    .WithMany(m => m.MovieReviews)
                    .HasForeignKey(r => r.MovieId)
                    .OnDelete(DeleteBehavior.Cascade);

              entity.Property(r => r.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");
            
              entity.HasQueryFilter(r => !r.User.IsDeleted);
        });
        
        modelBuilder.Entity<ReviewShow>(entity =>
        {
              entity.HasKey(r => new { r.UserId, r.ShowId });

              entity.HasOne(r => r.User)
                    .WithMany(u => u.ShowReviews)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

              entity.HasOne(r => r.Show)
                    .WithMany(sh => sh.ShowReviews)
                    .HasForeignKey(r => r.ShowId)
                    .OnDelete(DeleteBehavior.Cascade);

              entity.Property(r => r.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");
            
              entity.HasQueryFilter(r => !r.User.IsDeleted);
        });

        modelBuilder.Entity<Watchlist>(entity =>
        {
            entity.HasKey(w => w.Id); 

            entity.HasOne(w => w.User)
                  .WithMany(u => u.Watchlist)
                  .HasForeignKey(w => w.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(w => w.Movie)
                  .WithMany(m => m.Watchlist)
                  .HasForeignKey(w => w.MovieId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(w => w.Show)
                  .WithMany() 
                  .HasForeignKey(w => w.ShowId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(w => w.AddedAt)
                  .HasDefaultValueSql("GETUTCDATE()");

            entity.HasQueryFilter(w => !w.User.IsDeleted);

            entity.HasIndex(w => new { w.UserId, w.MovieId }).IsUnique().HasFilter("[MovieId] IS NOT NULL");
            entity.HasIndex(w => new { w.UserId, w.ShowId }).IsUnique().HasFilter("[ShowId] IS NOT NULL");
        });

        modelBuilder.Entity<HomeSection>(entity =>
        {
            entity.HasKey(hs => hs.Id);

            entity.Property(hs => hs.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(hs => hs.Genre)
                  .WithMany()
                  .HasForeignKey(hs => hs.GenreId)
                  .OnDelete(DeleteBehavior.SetNull)
                  .IsRequired(false);
        });
        
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
        
        modelBuilder.Entity<HomeSectionShow>(entity =>
        {
              entity.HasKey(hsm => new { hsm.HomeSectionId, hsm.ShowId });

              entity.HasOne(hsm => hsm.HomeSection)
                    .WithMany(hs => hs.Shows)
                    .HasForeignKey(hsm => hsm.HomeSectionId)
                    .OnDelete(DeleteBehavior.Cascade);

              entity.HasOne(hsm => hsm.Show)
                    .WithMany()
                    .HasForeignKey(hsm => hsm.ShowId)
                    .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Show>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.Property(s => s.AverageRating)
                  .HasPrecision(4, 2);

            entity.Property(s => s.AddedAt)
                  .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(s => s.Status)
                  .HasConversion<string>();
       });
            
        modelBuilder.Entity<ShowGenre>(entity =>
       {
            entity.HasKey(sg => new { sg.ShowId, sg.GenreId });

            entity.HasOne(sg => sg.Show)
                  .WithMany(s => s.ShowGenres)
                  .HasForeignKey(sg => sg.ShowId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(sg => sg.Genre)
                  .WithMany(g => g.ShowGenres)
                  .HasForeignKey(sg => sg.GenreId)
                  .OnDelete(DeleteBehavior.Restrict);
       });
    }
}