# Movie Rating Platform

Full-stack movie and TV rating platform with:

- ASP.NET Core backend + EF Core
- React + Vite frontend
- xUnit backend tests and Vitest frontend tests

## Project Structure

- `backend/MovieRating.Backend` — API and data layer
- `backend/MovieRating.Backend.Tests` — backend test project
- `frontend/movie-rating-frontend` — React app
- `devops` — docker/k8s manifests

## Backend

From repository root:

`dotnet run --project backend/MovieRating.Backend/MovieRating.Backend.csproj`

Run tests:

`dotnet test backend/MovieRating.Backend.Tests/MovieRating.Backend.Tests.csproj`

## Frontend

From `frontend/movie-rating-frontend`:

`npm install`

`npm run dev`

Validation commands:

`npm run lint`

`npm run test`

`npm run build`
