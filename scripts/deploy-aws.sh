#!/bin/bash
# AWS Deployment Script for DigitalMEng
# Usage: ./scripts/deploy-aws.sh [environment]

set -e

ENVIRONMENT=${1:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPO="digitalmeng"
IMAGE_TAG=$(git rev-parse --short HEAD)

echo "🚀 DigitalMEng AWS Deployment"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo "Image Tag: $IMAGE_TAG"
echo ""

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO"

echo "📦 Step 1: Creating ECR Repository (if not exists)..."
aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_REPO --region $AWS_REGION

echo "🔐 Step 2: Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "🏗️ Step 3: Building Docker image..."
docker build -t $ECR_REPO:$IMAGE_TAG -t $ECR_REPO:latest .

echo "🏷️ Step 4: Tagging images for ECR..."
docker tag $ECR_REPO:$IMAGE_TAG $ECR_URI:$IMAGE_TAG
docker tag $ECR_REPO:latest $ECR_URI:latest

echo "📤 Step 5: Pushing to ECR..."
docker push $ECR_URI:$IMAGE_TAG
docker push $ECR_URI:latest

echo ""
echo "✅ Image pushed successfully!"
echo "   ECR URI: $ECR_URI:$IMAGE_TAG"
echo ""
echo "📋 Next Steps:"
echo "   1. Go to AWS App Runner console"
echo "   2. Create new service with ECR image: $ECR_URI:latest"
echo "   3. Configure environment variables"
echo "   4. Deploy!"
echo ""
echo "🔗 Or use the AWS CLI:"
echo "   aws apprunner create-service --service-name digitalmeng-$ENVIRONMENT --source-configuration imageRepository={imageIdentifier=$ECR_URI:latest,imageRepositoryType=ECR}"
