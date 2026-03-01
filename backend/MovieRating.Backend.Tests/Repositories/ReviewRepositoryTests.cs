using Microsoft.EntityFrameworkCore;
using MovieRating.Backend.Data;
using MovieRating.Backend.Models.Movie;
using MovieRating.Backend.Models.Show;
using MovieRating.Backend.Models.User;
using MovieRating.Backend.Repositories;
using Xunit;

namespace MovieRating.Backend.Tests.Repositories;

public class ReviewRepositoryTests
{
    [Fact]
    public async Task UpdateShowReviewAsync_RecomputesShowStats_AndDoesNotTouchMovieStats()
    {
        await using var context = CreateContext();
        await SeedBaseEntitiesAsync(context);

        context.ReviewShows.Add(new ReviewShow
        {
            UserId = 1,
            ShowId = 1,
            Rating = 6,
            Comment = "Initial"
        });
        await context.SaveChangesAsync();

        var repository = new ReviewRepository(context);

        var result = await repository.UpdateShowReviewAsync(new ReviewShow
        {
            UserId = 1,
            ShowId = 1,
            Rating = 10,
            Comment = "Updated"
        });

        Assert.True(result.IsSuccess);

        var show = await context.Shows.FindAsync(1);
        var movie = await context.Movies.FindAsync(1);

        Assert.NotNull(show);
        Assert.NotNull(movie);
        Assert.Equal(1, show!.ReviewCount);
        Assert.Equal(10, show.AverageRating, 3);

        Assert.Equal(4, movie!.AverageRating, 3);
        Assert.Equal(2, movie.ReviewCount);
    }

    [Fact]
    public async Task DeleteShowReviewAsync_RecomputesShowStats_AndDoesNotTouchMovieStats()
    {
        await using var context = CreateContext();
        await SeedBaseEntitiesAsync(context);

        context.Users.Add(new User
        {
            Id = 2,
            Username = "user2",
            Email = "user2@example.com",
            PasswordHash = "hash"
        });

        context.ReviewShows.AddRange(
            new ReviewShow
            {
                UserId = 1,
                ShowId = 1,
                Rating = 4,
                Comment = "A"
            },
            new ReviewShow
            {
                UserId = 2,
                ShowId = 1,
                Rating = 8,
                Comment = "B"
            });

        await context.SaveChangesAsync();

        var repository = new ReviewRepository(context);

        var result = await repository.DeleteShowReviewAsync(1, 1);

        Assert.True(result.IsSuccess);

        var show = await context.Shows.FindAsync(1);
        var movie = await context.Movies.FindAsync(1);

        Assert.NotNull(show);
        Assert.NotNull(movie);
        Assert.Equal(1, show!.ReviewCount);
        Assert.Equal(8, show.AverageRating, 3);

        Assert.Equal(4, movie!.AverageRating, 3);
        Assert.Equal(2, movie.ReviewCount);
    }

    [Fact]
    public async Task AddShowReviewAsync_WhenShowMissing_ReturnsShowNotFound()
    {
        await using var context = CreateContext();
        context.Users.Add(new User
        {
            Id = 1,
            Username = "user1",
            Email = "user1@example.com",
            PasswordHash = "hash"
        });
        await context.SaveChangesAsync();

        var repository = new ReviewRepository(context);

        var result = await repository.AddShowReviewAsync(new ReviewShow
        {
            UserId = 1,
            ShowId = 99,
            Rating = 8,
            Comment = "Missing show"
        });

        Assert.False(result.IsSuccess);
        Assert.Equal("Show not found.", result.Error);
    }

    private static MovieDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<MovieDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new MovieDbContext(options);
    }

    private static async Task SeedBaseEntitiesAsync(MovieDbContext context)
    {
        context.Users.Add(new User
        {
            Id = 1,
            Username = "user1",
            Email = "user1@example.com",
            PasswordHash = "hash"
        });

        var show = new Show
        {
            Id = 1,
            Title = "Example Show",
            FirstAirDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        var movie = new Movie
        {
            Id = 1,
            Title = "Example Movie",
            ReleaseDate = DateOnly.FromDateTime(DateTime.UtcNow),
            DurationMinutes = 120
        };

        movie.UpdateReviewStats(4, 2);

        context.Shows.Add(show);
        context.Movies.Add(movie);

        await context.SaveChangesAsync();
    }
}
