# 🚀 DigitalMEng AWS Deployment Plan

## Executive Summary
This guide covers 3 deployment strategies for **DigitalMEng** on AWS, from simplest to most scalable.

---

## 📊 Deployment Options Comparison

| Option | Complexity | Monthly Cost | Scalability | Best For |
|--------|-----------|--------------|-------------|----------|
| **Option A: AWS App Runner** | ⭐ Low | $15-50 | Auto-scaling | Quick start, MVP |
| **Option B: ECS Fargate** | ⭐⭐ Medium | $30-100 | High | Production, Teams |
| **Option C: EKS (Kubernetes)** | ⭐⭐⭐ High | $100-300+ | Enterprise | Large scale, Multi-region |

---

## ✅ RECOMMENDED: Option A - AWS App Runner

**AWS App Runner** is the fastest way to deploy. It handles infrastructure, scaling, and load balancing automatically.

### Prerequisites
1. AWS Account with billing enabled
2. AWS CLI installed and configured
3. Docker installed locally
4. ECR (Elastic Container Registry) access

### Step 1: Create ECR Repository

```bash
# Create ECR repository
aws ecr create-repository \
    --repository-name digitalmeng \
    --region us-east-1

# Get login command
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### Step 2: Build and Push Docker Image

```bash
# Build the image
docker build -t digitalmeng:latest .

# Tag for ECR
docker tag digitalmeng:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/digitalmeng:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/digitalmeng:latest
```

### Step 3: Create App Runner Service

1. Go to **AWS Console → App Runner**
2. Click **Create service**
3. Choose **Container registry** → **Amazon ECR**
4. Select your `digitalmeng:latest` image
5. Configure:
   - Service name: `digitalmeng-prod`
   - Port: `3000`
   - CPU: 1 vCPU
   - Memory: 2 GB
   - Deployment: **Automatic** (deploys on new image push)

### Step 4: Configure Environment Variables

In App Runner console, add these environment variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@your-rds-host:5432/digitalmeng
NEXTAUTH_URL=https://your-domain.awsapprunner.com
NEXTAUTH_SECRET=your-secret-key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Step 5: Configure Custom Domain (Optional)

1. In App Runner → Your Service → Custom domains
2. Click **Add domain**
3. Enter your domain (e.g., `app.digitalmeng.com`)
4. Add the provided CNAME to your DNS

---

## 🗄️ Database Setup: Amazon RDS (PostgreSQL)

### Create RDS Instance

1. Go to **AWS Console → RDS**
2. Click **Create database**
3. Configuration:
   - Engine: **PostgreSQL 15**
   - Template: **Free tier** (for testing) or **Production**
   - Instance: `db.t3.micro` (free tier) or `db.t3.small`
   - Storage: 20 GB gp3
   - DB name: `digitalmeng`
   - Master username: `digitalmeng_admin`
   - Password: (generate a strong one)

4. Connectivity:
   - VPC: Default VPC
   - Public access: **Yes** (for App Runner connectivity)
   - Security group: Create new, allow port 5432 from App Runner

### Connection String Format
```
DATABASE_URL=postgresql://digitalmeng_admin:YOUR_PASSWORD@your-rds-endpoint.region.rds.amazonaws.com:5432/digitalmeng
```

### Run Migrations
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 🔐 Secrets Management: AWS Secrets Manager

For production, store secrets securely:

```bash
aws secretsmanager create-secret \
    --name digitalmeng/production \
    --secret-string '{
        "DATABASE_URL": "postgresql://...",
        "NEXTAUTH_SECRET": "...",
        "OPENAI_API_KEY": "...",
        "ANTHROPIC_API_KEY": "..."
    }'
```

---

## 📦 Option B: ECS Fargate (Production-Ready)

For more control and lower costs at scale.

### Architecture
```
Internet → ALB (Load Balancer) → ECS Fargate → RDS PostgreSQL
                                      ↓
                              ElastiCache (Redis - Optional)
```

### Step 1: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name digitalmeng-cluster --capacity-providers FARGATE
```

### Step 2: Task Definition

Create `task-definition.json`:

```json
{
  "family": "digitalmeng",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "digitalmeng",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/digitalmeng:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"}
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:digitalmeng/production:DATABASE_URL::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/digitalmeng",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Step 3: Create Service

```bash
aws ecs create-service \
    --cluster digitalmeng-cluster \
    --service-name digitalmeng-service \
    --task-definition digitalmeng \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

---

## 🌐 CDN & Static Assets: CloudFront

For optimal performance:

```yaml
# CloudFront Distribution
Origins:
  - App Runner endpoint (dynamic content)
  - S3 bucket (static assets, uploads)

Behaviors:
  - /_next/static/* → S3 (cached forever)
  - /api/* → App Runner (no cache)
  - Default → App Runner (cache 1 hour)
```

---

## 📊 Monitoring: CloudWatch

### Create Dashboard

```bash
aws cloudwatch put-dashboard --dashboard-name DigitalMEng --dashboard-body file://dashboard.json
```

### Key Metrics to Monitor
- **Response Time**: P50, P95, P99
- **Error Rate**: 4xx, 5xx
- **CPU/Memory Utilization**
- **Database Connections**
- **AI API Latency**

### Alarms

```bash
aws cloudwatch put-metric-alarm \
    --alarm-name "DigitalMEng-HighErrorRate" \
    --metric-name 5XXCount \
    --namespace AWS/AppRunner \
    --statistic Sum \
    --period 300 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT:alerts
```

---

## 🔄 CI/CD: GitHub Actions

Create `.github/workflows/deploy-aws.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build, tag, and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/digitalmeng:$IMAGE_TAG .
          docker push $ECR_REGISTRY/digitalmeng:$IMAGE_TAG
          docker tag $ECR_REGISTRY/digitalmeng:$IMAGE_TAG $ECR_REGISTRY/digitalmeng:latest
          docker push $ECR_REGISTRY/digitalmeng:latest
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 💰 Cost Estimate

### Development/Testing (Free Tier + Low Usage)
| Service | Monthly Cost |
|---------|-------------|
| App Runner (1 vCPU, 2GB) | ~$25 |
| RDS PostgreSQL (t3.micro) | ~$15 (free tier: $0) |
| S3 (5GB) | ~$0.12 |
| CloudWatch | ~$3 |
| **Total** | **~$43/month** |

### Production (Medium Traffic)
| Service | Monthly Cost |
|---------|-------------|
| App Runner (2 vCPU, 4GB, auto-scale) | ~$100 |
| RDS PostgreSQL (t3.small, Multi-AZ) | ~$50 |
| S3 (50GB + transfer) | ~$5 |
| CloudFront (100GB transfer) | ~$10 |
| Secrets Manager | ~$1 |
| CloudWatch + Alarms | ~$10 |
| **Total** | **~$176/month** |

---

## 🚀 Quick Start Commands

```bash
# 1. Configure AWS CLI
aws configure

# 2. Create ECR and push image
./scripts/deploy-aws.sh

# 3. Create App Runner service (via console or CLI)

# 4. Run migrations
DATABASE_URL=your-rds-url npx prisma migrate deploy

# 5. Verify deployment
curl https://your-app.awsapprunner.com/api/health
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Docker builds successfully locally
- [ ] All environment variables documented
- [ ] Database credentials secured
- [ ] API keys (OpenAI, Anthropic) configured
- [ ] Domain name ready (if using custom domain)

### Deployment
- [ ] ECR repository created
- [ ] Docker image pushed to ECR
- [ ] RDS database created and migrated
- [ ] App Runner service created
- [ ] Environment variables configured
- [ ] Health check passing

### Post-Deployment
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS verified
- [ ] CloudWatch alarms configured
- [ ] CI/CD pipeline tested
- [ ] Load testing completed

---

## 🆘 Troubleshooting

### App Runner Service Not Starting
1. Check CloudWatch logs: `/aws/apprunner/digitalmeng-prod/service`
2. Verify environment variables
3. Check database connectivity
4. Ensure health check endpoint responds

### Database Connection Issues
1. Verify security group allows inbound on port 5432
2. Check RDS public accessibility setting
3. Verify DATABASE_URL format
4. Test connection: `npx prisma db pull`

### Slow Response Times
1. Check RDS instance size
2. Enable RDS Performance Insights
3. Add ElastiCache for session/cache
4. Review Next.js ISR/SSR strategy

---

**Ready to deploy? Start with Option A (App Runner) for the fastest path to production!** 🚀
