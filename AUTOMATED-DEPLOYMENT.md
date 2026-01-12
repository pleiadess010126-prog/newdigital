# 🚀 Automated Deployment Guide - DigitalMEng

This guide provides multiple automated hosting options for your DigitalMEng application.

## 📋 Table of Contents

1. [Vercel Deployment (Recommended)](#1-vercel-deployment-recommended)
2. [AWS Amplify Deployment](#2-aws-amplify-deployment)
3. [GitHub Actions CI/CD](#3-github-actions-cicd)
4. [Docker Deployment](#4-docker-deployment)
5. [Environment Variables Setup](#5-environment-variables-setup)

---

## 1. Vercel Deployment (Recommended)

**Best for**: Quick deployment, automatic SSL, global CDN, zero configuration

### Option A: Automated via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time - will ask configuration questions)
vercel

# Deploy to production
vercel --prod
```

### Option B: Automated via GitHub Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js settings
   - Click "Deploy"

3. **Configure Environment Variables** (in Vercel Dashboard):
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Click "Redeploy"

### ✅ Automatic Features:
- ✅ Auto-deploy on every `git push`
- ✅ Preview deployments for pull requests
- ✅ Automatic SSL certificates
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Database connection pooling

---

## 2. AWS Amplify Deployment

**Best for**: AWS ecosystem integration, full AWS services access

### Automated Setup Script

```bash
# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Configure AWS credentials
amplify configure

# Initialize Amplify in your project
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### GitHub Integration (Fully Automated)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Amplify deployment"
   git push origin main
   ```

2. **AWS Amplify Console**:
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
   - Click "New app" → "Host web app"
   - Select GitHub and authorize
   - Choose your repository and branch
   - Amplify auto-detects `amplify.yml` configuration
   - Click "Save and deploy"

3. **Configure Environment Variables**:
   - In Amplify Console → App settings → Environment variables
   - Add all required variables
   - Redeploy

### ✅ Automatic Features:
- ✅ Auto-deploy on every `git push`
- ✅ Branch-based deployments
- ✅ Built-in CI/CD
- ✅ Custom domain support
- ✅ SSL certificates
- ✅ Integration with AWS services (Cognito, DynamoDB, etc.)

---

## 3. GitHub Actions CI/CD

**Best for**: Custom deployment workflows, multiple environments, automated testing

### Automated Workflow Setup

The GitHub Actions workflows are already configured in `.github/workflows/`. They will automatically:

- ✅ Run on every push to `main` branch
- ✅ Run on every pull request
- ✅ Build and test the application
- ✅ Deploy to production (Vercel/Amplify)
- ✅ Run security checks
- ✅ Generate deployment reports

### Manual Trigger

You can also manually trigger deployments:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy to Production"
4. Click "Run workflow"
5. Select branch and click "Run workflow"

---

## 4. Docker Deployment

**Best for**: Self-hosted solutions, Kubernetes, cloud-agnostic deployment

### Quick Start

```bash
# Build Docker image
docker build -t digitalmeng:latest .

# Run container
docker run -p 3000:3000 --env-file .env digitalmeng:latest

# Or use Docker Compose
docker-compose up -d
```

### Automated Deployment to Cloud

#### AWS ECS/Fargate
```bash
# Build and push to ECR
./scripts/deploy-docker-aws.sh
```

#### Google Cloud Run
```bash
# Deploy to Cloud Run
./scripts/deploy-docker-gcp.sh
```

#### Azure Container Instances
```bash
# Deploy to Azure
./scripts/deploy-docker-azure.sh
```

---

## 5. Environment Variables Setup

### Required Variables

Create these in your hosting platform:

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# NextAuth (Required for authentication)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-here

# AI Services (Optional - for content generation)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# AWS Bedrock (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Stripe (Optional - for billing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🎯 Recommended Deployment Flow

### For Development/Testing:
1. **Vercel** - Fastest, easiest, free tier available
2. Push to GitHub → Auto-deploys to Vercel
3. Get instant preview URLs for testing

### For Production:
1. **AWS Amplify** - If using AWS services (Cognito, DynamoDB, Bedrock)
2. **Vercel** - If prioritizing speed and simplicity
3. **Docker + Cloud Run** - If need full control and portability

---

## 🔄 Continuous Deployment Workflow

```mermaid
graph LR
    A[Code Changes] --> B[Git Push]
    B --> C[GitHub Actions]
    C --> D{Tests Pass?}
    D -->|Yes| E[Build Application]
    D -->|No| F[Notify Developer]
    E --> G[Deploy to Staging]
    G --> H{Manual Approval}
    H -->|Approved| I[Deploy to Production]
    H -->|Rejected| F
    I --> J[Health Check]
    J -->|Success| K[Complete]
    J -->|Failed| L[Rollback]
```

---

## 🚨 Troubleshooting

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules
rm -rf node_modules
npm install
npm run build
```

### Database Connection Issues

```bash
# Test database connection
npm run db:test

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### Environment Variable Issues

```bash
# Verify environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"

# Check .env file exists
ls -la .env .env.local
```

---

## 📊 Deployment Comparison

| Feature | Vercel | AWS Amplify | Docker |
|---------|--------|-------------|--------|
| Setup Time | 5 min | 15 min | 30 min |
| Auto Deploy | ✅ | ✅ | ⚠️ Manual |
| Free Tier | ✅ | ✅ | Depends |
| Custom Domain | ✅ | ✅ | ✅ |
| SSL | ✅ Auto | ✅ Auto | ⚠️ Manual |
| Serverless | ✅ | ✅ | ❌ |
| AWS Integration | ⚠️ Limited | ✅ Full | ✅ Full |
| Scalability | ✅ Auto | ✅ Auto | ⚠️ Manual |
| Cost (Small) | Free | Free | $5-20/mo |
| Cost (Large) | $20-100/mo | $50-200/mo | $50-500/mo |

---

## 🎉 Quick Deploy Commands

### Deploy to Vercel (One Command)
```bash
npx vercel --prod
```

### Deploy to AWS Amplify (One Command)
```bash
amplify publish
```

### Deploy via Docker (One Command)
```bash
docker-compose up -d --build
```

---

## 📞 Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **AWS Amplify**: [AWS Support](https://aws.amazon.com/support/)
- **Docker**: [Docker Docs](https://docs.docker.com/)

---

**Last Updated**: January 2026  
**Status**: Ready for Production Deployment ✅
