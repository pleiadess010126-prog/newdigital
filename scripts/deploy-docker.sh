#!/bin/bash

# Automated Docker Deployment Script
# Builds and deploys the application using Docker

set -e

echo "🐳 Starting Docker deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker.${NC}"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo -e "${BLUE}📋 Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}⚠️  Warning: .env file not found${NC}"
fi

# Build Docker image
echo -e "${BLUE}🏗️  Building Docker image...${NC}"
docker build -t digitalmeng:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Stop and remove existing container
echo -e "${BLUE}🛑 Stopping existing container (if any)...${NC}"
docker stop digitalmeng-app 2>/dev/null || true
docker rm digitalmeng-app 2>/dev/null || true

# Run new container
echo -e "${BLUE}🚀 Starting new container...${NC}"
docker run -d \
  --name digitalmeng-app \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  digitalmeng:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Container started successfully${NC}"
    echo -e "${GREEN}🌐 Application is running at http://localhost:3000${NC}"
    
    # Wait for health check
    echo -e "${BLUE}⏳ Waiting for application to be healthy...${NC}"
    sleep 10
    
    # Check container status
    if docker ps | grep -q digitalmeng-app; then
        echo -e "${GREEN}✅ Container is running and healthy${NC}"
        echo -e "${BLUE}📊 Container logs:${NC}"
        docker logs --tail 20 digitalmeng-app
    else
        echo -e "${RED}❌ Container failed to start${NC}"
        echo -e "${RED}📊 Container logs:${NC}"
        docker logs digitalmeng-app
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
