@echo off
REM DigitalMEng AWS Deployment Script for Windows
REM Usage: deploy-aws.bat [environment]

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set AWS_REGION=us-east-1
set ECR_REPO=digitalmeng

echo.
echo ========================================
echo   DigitalMEng AWS Deployment
echo ========================================
echo Environment: %ENVIRONMENT%
echo Region: %AWS_REGION%
echo.

REM Get AWS Account ID
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set AWS_ACCOUNT_ID=%%i
if "%AWS_ACCOUNT_ID%"=="" (
    echo ERROR: Could not get AWS Account ID. Please run 'aws configure' first.
    exit /b 1
)

set ECR_URI=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/%ECR_REPO%

echo AWS Account: %AWS_ACCOUNT_ID%
echo ECR URI: %ECR_URI%
echo.

REM Step 1: Create ECR Repository
echo [Step 1/5] Creating ECR Repository (if not exists)...
aws ecr describe-repositories --repository-names %ECR_REPO% --region %AWS_REGION% 2>nul || aws ecr create-repository --repository-name %ECR_REPO% --region %AWS_REGION%

REM Step 2: Login to ECR
echo [Step 2/5] Logging into ECR...
for /f "tokens=*" %%i in ('aws ecr get-login-password --region %AWS_REGION%') do set ECR_PASSWORD=%%i
echo !ECR_PASSWORD! | docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com

REM Step 3: Build Docker image
echo [Step 3/5] Building Docker image...
docker build -t %ECR_REPO%:latest .

REM Step 4: Tag for ECR
echo [Step 4/5] Tagging image for ECR...
docker tag %ECR_REPO%:latest %ECR_URI%:latest

REM Step 5: Push to ECR
echo [Step 5/5] Pushing to ECR...
docker push %ECR_URI%:latest

echo.
echo ========================================
echo   SUCCESS! Image pushed to ECR
echo ========================================
echo.
echo ECR Image: %ECR_URI%:latest
echo.
echo NEXT STEPS:
echo   1. Go to AWS App Runner console
echo   2. Create new service with ECR image
echo   3. Configure environment variables
echo   4. Deploy!
echo.
echo Or create App Runner service via CLI:
echo   aws apprunner create-service --service-name digitalmeng-%ENVIRONMENT% --source-configuration imageRepository={imageIdentifier=%ECR_URI%:latest,imageRepositoryType=ECR}
echo.

endlocal
