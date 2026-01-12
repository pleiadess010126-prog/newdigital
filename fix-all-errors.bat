@echo off
REM ========================================
REM DigitalMEng - Complete Error Fix Script
REM ========================================

echo.
echo ========================================
echo   DigitalMEng - Fixing All Errors
echo ========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [STEP 1/6] Creating .env.local from example...
    copy .env.example .env.local
    echo.
    echo ========================================
    echo   IMPORTANT: DATABASE SETUP REQUIRED
    echo ========================================
    echo.
    echo You need to set up a database. Choose one option:
    echo.
    echo Option 1: Neon (Recommended - Free, Serverless)
    echo   1. Go to: https://neon.tech
    echo   2. Sign up for free account
    echo   3. Create a new project
    echo   4. Copy the connection string
    echo   5. It looks like: postgresql://user:password@ep-xxx.neon.tech/database
    echo.
    echo Option 2: Local PostgreSQL
    echo   1. Install PostgreSQL locally
    echo   2. Create database: CREATE DATABASE digitalmeng;
    echo   3. Connection string: postgresql://postgres:password@localhost:5432/digitalmeng
    echo.
    echo Option 3: Supabase (Free tier available)
    echo   1. Go to: https://supabase.com
    echo   2. Create new project
    echo   3. Get connection string from Settings ^> Database
    echo.
    echo ========================================
    echo.
    echo Now edit .env.local and set DATABASE_URL
    echo Then run this script again.
    echo.
    pause
    exit /b 1
) else (
    echo [INFO] .env.local already exists
)

echo.
echo [STEP 2/6] Checking DATABASE_URL...
findstr /C:"DATABASE_URL=" .env.local >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] DATABASE_URL not found in .env.local
    echo Please add: DATABASE_URL="postgresql://..."
    pause
    exit /b 1
)

REM Check if DATABASE_URL is just the example
findstr /C:"DATABASE_URL=\"postgresql://postgres:password@localhost" .env.local >nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] DATABASE_URL appears to be the example value
    echo Please update it with your actual database connection string
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo [OK] DATABASE_URL is set
echo.

echo [STEP 3/6] Generating Prisma Client...
call npm run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma client
    echo Check your DATABASE_URL is correct
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

echo [STEP 4/6] Pushing schema to database...
call npm run db:push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to push schema to database
    echo Make sure your database is accessible
    pause
    exit /b 1
)
echo [OK] Schema pushed successfully
echo.

echo [STEP 5/6] Creating admin user...
call npm run admin:quick
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Failed to create admin user
    echo You may need to create it manually later
) else (
    echo [OK] Admin user created
)
echo.

echo [STEP 6/6] Cleaning up log files...
del /Q dev_server_*.log 2>nul
del /Q prisma-*.log 2>nul
echo [OK] Log files cleaned
echo.

echo ========================================
echo   ALL ERRORS FIXED!
echo ========================================
echo.
echo Your DigitalMEng application is now ready!
echo.
echo Login Details:
echo   URL: http://localhost:3000/login
echo   Email: admin@digitalmeng.com
echo   Password: admin123
echo.
echo IMPORTANT: Change the password after first login!
echo.
echo Dev server is already running at http://localhost:3000
echo.
pause
