$ErrorActionPreference = "Stop"

# Set environment variable
$env:DATABASE_URL = "file:./dev.db"

Write-Host "DATABASE_URL set to: $env:DATABASE_URL"
Write-Host "Running prisma generate..."

# Run prisma generate
& npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Prisma client generated!" -ForegroundColor Green
} else {
    Write-Host "FAILED: Prisma generate returned exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
