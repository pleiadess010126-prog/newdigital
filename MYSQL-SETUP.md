# 🔧 MySQL Setup Guide - DigitalMEng

Complete guide to set up DigitalMEng with **MySQL database**.

---

## 🚀 **QUICK START**

### **One Command Setup:**

```bash
npm run fix:errors
```

This will guide you through MySQL setup and fix all errors.

---

## 📋 **Prerequisites**

You need a MySQL database. Choose one option:

### **Option 1: PlanetScale (Recommended - Easiest)**
✅ Free tier available  
✅ No local installation  
✅ Serverless MySQL  
✅ Auto-scaling  

**Setup Time**: 5 minutes

### **Option 2: Local MySQL**
✅ Full control  
✅ No internet required  
✅ Good for development  

**Setup Time**: 15 minutes

### **Option 3: Railway**
✅ Free tier  
✅ Easy setup  
✅ Auto-deploy  

**Setup Time**: 5 minutes

---

## 🗄️ **Database Setup**

### **Option 1: PlanetScale (Recommended)**

#### **Step 1: Create Account**
1. Go to https://planetscale.com
2. Sign up (free account)
3. Verify email

#### **Step 2: Create Database**
1. Click "New database"
2. Name: `digitalmeng`
3. Region: Choose closest to you
4. Click "Create database"

#### **Step 3: Get Connection String**
1. Click "Connect"
2. Select "Prisma" from framework dropdown
3. Copy the connection string
4. It looks like:
   ```
   mysql://username:password@aws.connect.psdb.cloud/digitalmeng?sslaccept=strict
   ```

#### **Step 4: Update .env.local**
```env
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/digitalmeng?sslaccept=strict"
```

---

### **Option 2: Local MySQL**

#### **Step 1: Install MySQL**

**Windows**:
1. Download from: https://dev.mysql.com/downloads/installer/
2. Run installer
3. Choose "Developer Default"
4. Set root password (remember this!)
5. Complete installation

**Mac**:
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

#### **Step 2: Create Database**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE digitalmeng;

# Create user (optional but recommended)
CREATE USER 'digitalmeng'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON digitalmeng.* TO 'digitalmeng'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

#### **Step 3: Update .env.local**
```env
# Using root user
DATABASE_URL="mysql://root:your_root_password@localhost:3306/digitalmeng"

# Or using dedicated user
DATABASE_URL="mysql://digitalmeng:your_password@localhost:3306/digitalmeng"
```

---

### **Option 3: Railway**

#### **Step 1: Create Account**
1. Go to https://railway.app
2. Sign up with GitHub
3. Verify account

#### **Step 2: Create MySQL Database**
1. Click "New Project"
2. Select "Provision MySQL"
3. Wait for deployment (~30 seconds)

#### **Step 3: Get Connection String**
1. Click on MySQL service
2. Go to "Connect" tab
3. Copy "MySQL Connection URL"
4. Format:
   ```
   mysql://root:password@containers-us-west-xxx.railway.app:3306/railway
   ```

#### **Step 4: Update .env.local**
```env
DATABASE_URL="mysql://root:password@containers-us-west-xxx.railway.app:3306/railway"
```

---

## ⚙️ **Complete Setup Process**

### **Step 1: Update Environment**

Create/edit `.env.local`:

```env
# MySQL Database (choose one from above)
DATABASE_URL="mysql://..."

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-min-32-chars
JWT_SECRET=your-jwt-secret-min-32-chars

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
DEMO_MODE=true
```

### **Step 2: Run Setup Script**

```bash
npm run fix:errors
```

This will:
1. ✅ Verify MySQL connection
2. ✅ Generate Prisma client
3. ✅ Create all database tables
4. ✅ Create admin user
5. ✅ Clean up logs

### **Step 3: Verify Setup**

```bash
# Open Prisma Studio to view database
npm run db:studio
```

You should see all tables created.

---

## ✅ **Verification Checklist**

After setup, verify:

- [ ] `.env.local` exists with DATABASE_URL
- [ ] MySQL database exists
- [ ] Can connect to MySQL
- [ ] Prisma client generated
- [ ] All tables created (check with `npm run db:studio`)
- [ ] Admin user exists
- [ ] Can login at http://localhost:3000/login

---

## 🔐 **Default Admin Credentials**

```
URL: http://localhost:3000/login
Email: admin@digitalmeng.com
Password: admin123
```

⚠️ **Change password immediately after first login!**

---

## 🛠️ **Manual Setup (If Script Fails)**

### **Step 1: Generate Prisma Client**
```bash
npm run db:generate
```

### **Step 2: Create Tables**
```bash
npm run db:push
```

### **Step 3: Create Admin**
```bash
npm run admin:quick
```

---

## 🐛 **Troubleshooting**

### **Error: "Can't connect to MySQL server"**

**Causes**:
- MySQL server not running
- Wrong host/port
- Firewall blocking connection

**Solutions**:
```bash
# Check MySQL is running (Local)
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status mysql

# Test connection
mysql -h localhost -u root -p

# Check firewall (if using remote MySQL)
```

---

### **Error: "Access denied for user"**

**Cause**: Wrong username/password

**Solution**:
```bash
# Reset MySQL root password (Local)
# Or check your connection string credentials
```

---

### **Error: "Unknown database 'digitalmeng'"**

**Cause**: Database doesn't exist

**Solution**:
```bash
mysql -u root -p
CREATE DATABASE digitalmeng;
EXIT;
```

---

### **Error: "Prisma Client could not locate the Query Engine"**

**Solution**:
```bash
# Clear and regenerate
rm -rf node_modules/.prisma
npm run db:generate
```

---

## 📊 **Database Schema**

The setup creates these tables:

- `users` - User accounts
- `organizations` - Multi-tenant organizations
- `organization_members` - User-org relationships
- `campaigns` - Marketing campaigns
- `content_items` - Generated content
- `topic_pillars` - Content topics
- `platform_connections` - Social media connections
- `subscriptions` - Billing subscriptions
- `usage_records` - Usage tracking
- `invoices` - Billing history
- `ai_agents` - AI automation agents
- `risk_alerts` - SEO risk monitoring
- `activity_logs` - Audit trail
- `api_keys` - API access
- `affiliates` - Affiliate program
- `affiliate_transactions` - Commission tracking
- `affiliate_payouts` - Payout history
- `sessions` - User sessions

---

## 🔄 **Switching from PostgreSQL/SQLite**

If you previously used PostgreSQL or SQLite:

### **Step 1: Backup Data (Optional)**
```bash
# Export existing data
npm run db:studio
# Manually export important data
```

### **Step 2: Update Schema**
Schema is already updated to MySQL!

### **Step 3: Update .env.local**
```env
DATABASE_URL="mysql://..."
```

### **Step 4: Recreate Database**
```bash
npm run db:generate
npm run db:push
npm run admin:quick
```

---

## 🎯 **Production Deployment**

### **For Production, Use**:

1. **PlanetScale** (Recommended)
   - Production branch
   - Auto-scaling
   - Built-in backups

2. **AWS RDS MySQL**
   - Full control
   - Multi-AZ deployment
   - Automated backups

3. **Google Cloud SQL**
   - Managed MySQL
   - High availability
   - Auto-scaling

### **Production .env**:
```env
DATABASE_URL="mysql://user:password@production-host:3306/digitalmeng?sslaccept=strict"
DEMO_MODE=false
NEXTAUTH_SECRET=<strong-secret>
JWT_SECRET=<strong-secret>
```

---

## 📞 **Need Help?**

### **Check Connection**:
```bash
# Test MySQL connection
mysql -h your-host -u your-user -p

# View Prisma connection
npm run db:studio
```

### **View Logs**:
```bash
# Check for errors
cat prisma-error.log
```

### **Reset Everything**:
```bash
# Drop all tables and start fresh
npx prisma db push --force-reset
npm run admin:quick
```

---

## 📚 **Related Documentation**

- `PROJECT-ANALYSIS-REPORT.md` - All errors and fixes
- `ADMIN-CREATION-GUIDE.md` - Admin user management
- `AUTOMATED-DEPLOYMENT.md` - Production deployment

---

**Status**: ✅ **READY FOR MYSQL SETUP**  
**Command**: `npm run fix:errors`  
**Database**: MySQL  
**Time**: 5-15 minutes (depending on option)

---

**Last Updated**: January 8, 2026  
**Database**: MySQL (PlanetScale/Local/Railway)
