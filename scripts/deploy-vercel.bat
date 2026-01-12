@echo off
REM Automated Vercel Deployment Script for Windows
REM This script automates the deployment process to Vercel

echo.
echo ========================================
echo   Automated Vercel Deployment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Vercel CLI not found. Installing...
    call npm install -g vercel
)

REM Check if logged in to Vercel
echo [INFO] Checking Vercel authentication...
vercel whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Please login to Vercel:
    call vercel login
)

REM Run pre-deployment checks
echo [INFO] Running pre-deployment checks...

REM Check if .env file exists
if not exist .env (
    if not exist .env.local (
        echo [WARNING] No .env or .env.local file found
        echo [INFO] Make sure to set environment variables in Vercel dashboard
    )
)

REM Install dependencies
echo [INFO] Installing dependencies...
call npm ci
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

REM Run linter
echo [INFO] Running linter...
call npm run lint
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Linter warnings found (continuing anyway)
)

REM Generate Prisma client
echo [INFO] Generating Prisma client...
call npm run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma client
    exit /b 1
)

REM Build locally to catch errors
echo [INFO] Building application locally...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    exit /b 1
)

REM Deploy to Vercel
echo [INFO] Deploying to Vercel...
echo.

set /p DEPLOY_PROD="Deploy to production? (y/n): "
if /i "%DEPLOY_PROD%"=="y" (
    echo [INFO] Deploying to PRODUCTION...
    call vercel --prod
) else (
    echo [INFO] Deploying to PREVIEW...
    call vercel
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Deployment completed successfully!
    echo   Your application is now live!
    echo ========================================
    echo.
) else (
    echo.
    echo [ERROR] Deployment failed
    exit /b 1
)

pause
