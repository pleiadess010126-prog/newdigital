# 🚀 DigitalMEng AWS Hosting - Complete Step-by-Step Guide

## 📋 Prerequisites (Before You Start)

Make sure you have:
- [ ] AWS Account (create at https://aws.amazon.com if needed)
- [ ] Credit/Debit card linked to AWS for billing
- [ ] Docker Desktop installed on your computer
- [ ] AWS CLI installed (https://aws.amazon.com/cli/)
- [ ] Git installed

**Estimated Time:** 45-60 minutes  
**Estimated Monthly Cost:** $30-50 (can be lower with free tier)

---

# PART 1: AWS Account Setup (5 minutes)

## Step 1.1: Create AWS Account (Skip if you have one)

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the signup process
4. Add payment method (won't be charged if staying in free tier)

## Step 1.2: Install AWS CLI

### Windows:
```powershell
# Download and run the installer
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

### Or download manually:
https://awscli.amazonaws.com/AWSCLIV2.msi

## Step 1.3: Configure AWS CLI

Open PowerShell/Command Prompt and run:
```bash
aws configure
```

Enter when prompted:
```
AWS Access Key ID: (we'll create this next)
AWS Secret Access Key: (we'll create this next)
Default region name: us-east-1
Default output format: json
```

---

# PART 2: Create IAM User for Deployment (10 minutes)

## Step 2.1: Go to IAM Console

1. Login to AWS Console: https://console.aws.amazon.com
2. Search for "IAM" in the search bar
3. Click "IAM"

## Step 2.2: Create New User

1. Click "Users" in the left sidebar
2. Click "Create user"
3. User name: `digitalmeng-deployer`
4. Click "Next"

## Step 2.3: Set Permissions

1. Select "Attach policies directly"
2. Search and check these policies:
   - ✅ `AmazonEC2ContainerRegistryFullAccess`
   - ✅ `AmazonRDSFullAccess`
   - ✅ `AWSAppRunnerFullAccess`
   - ✅ `SecretsManagerReadWrite`
3. Click "Next"
4. Click "Create user"

## Step 2.4: Create Access Keys

1. Click on the user `digitalmeng-deployer`
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Select "Command Line Interface (CLI)"
5. Check the confirmation box
6. Click "Next" → "Create access key"

## Step 2.5: SAVE YOUR CREDENTIALS NOW!

```
AWS Access Key ID:     AKIA_________________
AWS Secret Access Key: ________________________________________
```

⚠️ **IMPORTANT**: Save these immediately! You won't see the secret key again.

## Step 2.6: Configure AWS CLI with Your Keys

```bash
aws configure
```

Enter your credentials when prompted.

---

# PART 3: Create RDS MySQL Database (15 minutes)

## Step 3.1: Go to RDS Console

1. In AWS Console, search for "RDS"
2. Click "RDS"
3. Click "Create database"

## Step 3.2: Choose Database Engine

1. Creation method: **Standard create**
2. Engine type: **MySQL**
3. Engine version: **MySQL 8.0.35** (latest 8.0)
4. Templates: **Free tier** (for testing) or **Production**

## Step 3.3: Settings

```
DB instance identifier: digitalmeng-db
Master username: digitalmeng_admin
Master password: [Create a strong password - SAVE THIS!]
Confirm password: [Same password]
```

**📝 SAVE THIS PASSWORD!**

## Step 3.4: Instance Configuration

For Free Tier:
- DB instance class: `db.t3.micro`

For Production:
- DB instance class: `db.t3.small` or `db.t3.medium`

## Step 3.5: Storage

- Storage type: `gp3`
- Allocated storage: `20 GB`
- Storage autoscaling: ✅ Enable
- Maximum storage: `100 GB`

## Step 3.6: Connectivity

- Compute resource: **Don't connect to an EC2**
- VPC: **Default VPC**
- DB subnet group: **default**
- Public access: **Yes** (Required for App Runner)
- VPC security group: **Create new**
- Security group name: `digitalmeng-db-sg`

## Step 3.7: Additional Configuration

- Initial database name: `digitalmeng`
- Enable automated backups: ✅ Yes (7 days)
- Enable encryption: ✅ Yes

## Step 3.8: Create Database

1. Click "Create database"
2. Wait 5-10 minutes for the database to be created
3. Status should change to "Available"

## Step 3.9: Get Database Endpoint

1. Click on your database `digitalmeng-db`
2. Find "Endpoint & port" section
3. Copy the endpoint:
   ```
   digitalmeng-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com
   ```

## Step 3.10: Configure Security Group

1. In the database details, click on the VPC security group
2. Click "Edit inbound rules"
3. Add rule:
   - Type: `MySQL/Aurora`
   - Port: `3306`
   - Source: `0.0.0.0/0` (Anywhere - for App Runner access)
4. Click "Save rules"

## Step 3.11: Your DATABASE_URL

```
mysql://digitalmeng_admin:YOUR_PASSWORD@digitalmeng-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com:3306/digitalmeng
```

Replace:
- `YOUR_PASSWORD` with your actual password
- `xxxxxxxxxxxx` with your actual endpoint

**📝 SAVE THIS DATABASE_URL!**

---

# PART 4: Create ECR Repository (5 minutes)

## Step 4.1: Go to ECR Console

1. Search for "ECR" or "Elastic Container Registry"
2. Click "ECR"

## Step 4.2: Create Repository

1. Click "Create repository"
2. Repository name: `digitalmeng`
3. Visibility: **Private**
4. Click "Create repository"

## Step 4.3: Get ECR URI

Copy the URI shown:
```
123456789012.dkr.ecr.us-east-1.amazonaws.com/digitalmeng
```

**📝 SAVE THIS URI!**

---

# PART 5: Build and Push Docker Image (10 minutes)

## Step 5.1: Open Terminal in Project Directory

```powershell
cd c:\Users\priya\.gemini\antigravity\DigitalMEng_repo
```

## Step 5.2: Login to ECR

Replace `123456789012` with your AWS Account ID:

```powershell
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

You should see: "Login Succeeded"

## Step 5.3: Build Docker Image

```powershell
docker build -t digitalmeng:latest .
```

Wait 5-10 minutes for the build to complete.

## Step 5.4: Tag the Image

Replace with your ECR URI:
```powershell
docker tag digitalmeng:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/digitalmeng:latest
```

## Step 5.5: Push to ECR

```powershell
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/digitalmeng:latest
```

Wait 5-10 minutes for the upload.

---

# PART 6: Create App Runner Service (10 minutes)

## Step 6.1: Go to App Runner Console

1. Search for "App Runner"
2. Click "AWS App Runner"
3. Click "Create service"

## Step 6.2: Source Configuration

1. Repository type: **Container registry**
2. Provider: **Amazon ECR**
3. Click "Browse" and select your `digitalmeng` repository
4. Image tag: `latest`
5. Deployment trigger: **Automatic** (recommended)
6. Click "Next"

## Step 6.3: Configure Service

### Service settings:
- Service name: `digitalmeng-production`
- CPU: `1 vCPU`
- Memory: `2 GB`
- Port: `3000`

### Environment variables (IMPORTANT!):

Click "Add environment variable" for each:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `mysql://digitalmeng_admin:PASSWORD@endpoint:3306/digitalmeng` |
| `NEXTAUTH_URL` | `https://your-service.us-east-1.awsapprunner.com` (update after creation) |
| `NEXTAUTH_SECRET` | `generate-a-random-32-char-string-here` |

To generate NEXTAUTH_SECRET, run locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6.4: Auto Scaling (Optional)

- Minimum instances: `1`
- Maximum instances: `3`
- Max concurrency: `100`

## Step 6.5: Health Check

- Path: `/api/health`
- Protocol: `HTTP`
- Timeout: `5 seconds`
- Interval: `10 seconds`

## Step 6.6: Create Service

1. Click "Next"
2. Review all settings
3. Click "Create & deploy"
4. Wait 10-15 minutes for deployment

## Step 6.7: Get Your App URL

Once deployed, you'll see:
```
Default domain: xxxxxxxxxxxxx.us-east-1.awsapprunner.com
```

**📝 THIS IS YOUR LIVE APP URL!**

## Step 6.8: Update NEXTAUTH_URL

1. Go back to App Runner service
2. Click "Configuration"
3. Update `NEXTAUTH_URL` to: `https://xxxxxxxxxxxxx.us-east-1.awsapprunner.com`
4. Click "Save changes"

---

# PART 7: Run Database Migrations (5 minutes)

## Step 7.1: Run Migrations Locally

Open terminal in your project:

```powershell
# Set the DATABASE_URL
$env:DATABASE_URL = "mysql://digitalmeng_admin:PASSWORD@your-rds-endpoint:3306/digitalmeng"

# Run migrations (creates all 19 tables)
npx prisma migrate deploy

# Create admin user (optional)
npm run admin:create
```

## Step 7.2: Verify Tables Created

```powershell
npx prisma studio
```

This opens a browser to view your database.

---

# PART 8: Verify Deployment (2 minutes)

## Step 8.1: Check Health Endpoint

Open in browser:
```
https://xxxxxxxxxxxxx.us-east-1.awsapprunner.com/api/health
```

Should return: `{"status":"ok"}`

## Step 8.2: Access Your App

Open:
```
https://xxxxxxxxxxxxx.us-east-1.awsapprunner.com
```

🎉 **Your app is now live on AWS!**

---

# PART 9: Add Custom Domain (Optional)

## Step 9.1: In App Runner Console

1. Go to your service
2. Click "Custom domains"
3. Click "Add domain"
4. Enter: `app.yourdomain.com`

## Step 9.2: Configure DNS

Add CNAME record in your domain provider:
```
Name: app
Type: CNAME
Value: (the value AWS gives you)
```

---

# 📋 Quick Reference - All Your Values

Save this filled out:

```
# AWS Account
AWS_ACCOUNT_ID=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Database
RDS_ENDPOINT=digitalmeng-db.xxxx.us-east-1.rds.amazonaws.com
DATABASE_URL=mysql://digitalmeng_admin:PASSWORD@endpoint:3306/digitalmeng

# ECR
ECR_URI=123456789012.dkr.ecr.us-east-1.amazonaws.com/digitalmeng

# App Runner
APP_URL=https://xxxxx.us-east-1.awsapprunner.com

# App Secrets
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://xxxxx.us-east-1.awsapprunner.com
```

---

# 💰 Monthly Cost Estimate

| Service | Free Tier | Production |
|---------|-----------|------------|
| App Runner (1 vCPU, 2GB) | ~$25 | ~$25 |
| RDS MySQL (t3.micro) | FREE (12 months) | ~$15 |
| ECR (storage) | ~$1 | ~$1 |
| Data Transfer | ~$2 | ~$5 |
| **TOTAL** | **~$28/month** | **~$46/month** |

---

# 🔄 Future Deployments

After first deployment, to update your app:

```powershell
# 1. Build new image
docker build -t digitalmeng:latest .

# 2. Tag for ECR
docker tag digitalmeng:latest YOUR_ECR_URI:latest

# 3. Push to ECR
docker push YOUR_ECR_URI:latest

# App Runner will automatically deploy the new version!
```

---

# 🆘 Troubleshooting

## App Runner shows "Create failed"
- Check CloudWatch logs for errors
- Verify DATABASE_URL is correct
- Make sure RDS security group allows access

## Database connection error
- Verify RDS is publicly accessible
- Check security group allows port 3306
- Verify DATABASE_URL format

## Health check fails
- Ensure `/api/health` endpoint works locally
- Check App Runner logs for startup errors

---

**Congratulations! Your DigitalMEng is now live on AWS! 🎉**
