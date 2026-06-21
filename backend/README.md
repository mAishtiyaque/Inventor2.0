# Backend — Inventor.Api

Quick start (development)

1. Copy `.env.example` to `.env` and fill values (especially `DATABASE_URL` if you use Postgres).

2. From repository root or project folder run:

```bash
cd backend/Inventor.Api
dotnet restore Inventor.Api.csproj
dotnet build Inventor.Api.csproj
dotnet run
```

3. Defaults from `launchSettings.json` (Development) include:
- HTTP: http://localhost:5048
- HTTPS: https://localhost:7175

Environment tips
- `ASPNETCORE_ENVIRONMENT=Development` is set by launch settings; to override, set the environment variable or add to `.env`.
- The app loads `.env` at startup; either provide `DATABASE_URL` or configure `DefaultConnection` in `appsettings.Development.json`.

Database / Migrations
- If you need to apply EF migrations locally:

```bash
# Install dotnet-ef if not installed
dotnet tool install --global dotnet-ef
# From project folder
cd backend/Inventor.Api
dotnet ef database update
```

Logging
- Logs are written to `backend/Inventor.Api/Logs/` via Serilog (see `appsettings.json`).

Troubleshooting
- If startup fails, check console output and `Logs/` files for exceptions.
- Ensure `DATABASE_URL` or `DefaultConnection` points to a reachable DB.

If you want, I can run these commands locally now or create a `backend/.env.local` with placeholder values.