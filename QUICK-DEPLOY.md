# 🚀 Quick Deploy Guide - DigitalMEng

Choose your preferred deployment method and follow the steps below.

---

## 🎯 Option 1: Vercel (Recommended - Fastest)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/DigitalMEng)

### Manual Deploy (5 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod
```

**That's it!** Your app will be live in ~2 minutes.

---

## 🐳 Option 2: Docker (Self-Hosted)

### Quick Start

```bash
# 1. Clone and navigate to project
cd c:\Users\priya\.gemini\antigravity\DigitalMEng_repo

# 2. Create .env file with your settings
copy .env.example .env

# 3. Deploy with Docker Compose
docker-compose up -d

# 4. Check status
docker-compose ps
```

**Your app is now running at http://localhost:3000**

### Using Deployment Script (Windows)

```bash
# Run automated deployment script
.\scripts\deploy-vercel.bat
```

---

## ☁️ Option 3: AWS Amplify

### Automated Setup

```bash
# 1. Install Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configure AWS
amplify configure

# 3. Initialize and publish
amplify init
amplify publish
```

### GitHub Integration (Fully Automated)

1. Push your code to GitHub
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Click "New app" → "Host web app"
4. Connect your GitHub repository
5. Click "Save and deploy"

**Done!** Auto-deploys on every git push.

---

## 🔧 Environment Variables

Before deploying, set these environment variables:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here

# Generate secret with:
# openssl rand -base64 32
```

### Optional Variables (for full features)

```env
# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Billing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 📊 Deployment Comparison

| Method | Time | Difficulty | Cost | Auto-Deploy |
|--------|------|------------|------|-------------|
| **Vercel** | 5 min | ⭐ Easy | Free tier | ✅ Yes |
| **Docker** | 15 min | ⭐⭐ Medium | $5-20/mo | ⚠️ Manual |
| **AWS Amplify** | 20 min | ⭐⭐⭐ Advanced | Free tier | ✅ Yes |

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Application loads at your URL
- [ ] Login page works
- [ ] Dashboard displays correctly
- [ ] Database connection is successful
- [ ] Environment variables are set
- [ ] SSL certificate is active
- [ ] Custom domain is configured (if applicable)

---

## 🆘 Quick Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Error

```bash
# Test database connection
npm run db:generate
npm run db:push
```

### Environment Variables Not Loading

- **Vercel**: Check Project Settings → Environment Variables
- **Docker**: Verify `.env` file exists and is loaded
- **Amplify**: Check App Settings → Environment variables

---

## 🎉 Success!

Your DigitalMEng application is now live!

### Next Steps:

1. **Configure Custom Domain** (optional)
2. **Set up monitoring** (Vercel Analytics, AWS CloudWatch)
3. **Enable automatic backups** for your database
4. **Configure email notifications**

---

## 📞 Need Help?

- **Documentation**: See [AUTOMATED-DEPLOYMENT.md](./AUTOMATED-DEPLOYMENT.md)
- **GitHub Issues**: Report bugs or request features
- **Community**: Join our Discord/Slack

---

**Last Updated**: January 2026  
**Deployment Status**: ✅ Ready for Production
