# Load DATABASE_URL from .env file
$dbUrl = (Get-Content .env | Select-String '^DATABASE_URL=' | ForEach-Object { $_.ToString().Replace('DATABASE_URL=', '') }).Trim()

if (-not $dbUrl) {
    Write-Error "DATABASE_URL not found in .env file"
    exit 1
}

# Set the environment variable for this session
$env:DATABASE_URL = $dbUrl

# Run Prisma DB Push
Write-Output "Pushing Prisma schema to database..."
npx prisma db push --skip-generate

if ($LASTEXITCODE -eq 0) {
    Write-Output "`nGenerating Prisma Client..."
    npx prisma generate
}

if ($LASTEXITCODE -eq 0) {
    Write-Output "`nDatabase push and client generation completed successfully!"
} else {
    Write-Error "Prisma command failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
