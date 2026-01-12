#!/bin/bash

# Automated Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e

echo "🚀 Starting automated deployment to Vercel..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${BLUE}📦 Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if logged in to Vercel
echo -e "${BLUE}🔐 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${BLUE}Please login to Vercel:${NC}"
    vercel login
fi

# Run pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check if .env file exists
if [ ! -f .env ] && [ ! -f .env.local ]; then
    echo -e "${RED}⚠️  Warning: No .env or .env.local file found${NC}"
    echo -e "${BLUE}Make sure to set environment variables in Vercel dashboard${NC}"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Run linter
echo -e "${BLUE}🔍 Running linter...${NC}"
npm run lint || echo -e "${RED}⚠️  Linter warnings found (continuing anyway)${NC}"

# Generate Prisma client
echo -e "${BLUE}🗄️  Generating Prisma client...${NC}"
npm run db:generate

# Build locally to catch errors
echo -e "${BLUE}🏗️  Building application locally...${NC}"
npm run build

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

# Ask for deployment type
read -p "Deploy to production? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🌍 Deploying to PRODUCTION...${NC}"
    vercel --prod
else
    echo -e "${BLUE}🔧 Deploying to PREVIEW...${NC}"
    vercel
fi

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🎉 Your application is now live!${NC}"
