# ── Stage 1: Build ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy only the .csproj first so "dotnet restore" is cached when
# source files change but dependencies don't.
COPY MovieRating.Backend/MovieRating.Backend.csproj MovieRating.Backend/
RUN dotnet restore MovieRating.Backend/MovieRating.Backend.csproj

# Copy the rest of the source code and publish a Release build.
COPY MovieRating.Backend/ MovieRating.Backend/
RUN dotnet publish MovieRating.Backend/MovieRating.Backend.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Stage 2: Runtime ───────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# ASP.NET Core listens on port 8080 by default in containers.
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "MovieRating.Backend.dll"]
