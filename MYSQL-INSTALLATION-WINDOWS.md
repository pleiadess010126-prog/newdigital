# 🗄️ MySQL Installation Guide for Windows - DigitalMEng

Complete step-by-step guide to install MySQL and set up your DigitalMEng database.

---

## 🚀 **AUTOMATED INSTALLATION (Recommended)**

### **One Command:**

```bash
.\install-mysql.bat
```

This script will:
1. ✅ Check if MySQL is installed
2. ✅ Open download page if needed
3. ✅ Create database
4. ✅ Set up user
5. ✅ Configure .env.local
6. ✅ Generate Prisma client
7. ✅ Create all tables
8. ✅ Create admin user

**Just follow the prompts!**

---

## 📋 **Manual Installation Steps**

If you prefer manual installation:

### **Step 1: Download MySQL**

1. Go to: https://dev.mysql.com/downloads/installer/
2. Click **"Download"** on **"mysql-installer-community"**
3. Click **"No thanks, just start my download"**
4. Save the file (mysql-installer-community-8.x.x.msi)

### **Step 2: Run Installer**

1. **Double-click** the downloaded .msi file
2. **Choose Setup Type**: Select **"Developer Default"**
3. Click **"Next"**

### **Step 3: Installation**

1. Click **"Execute"** to install all components
2. Wait for installation (5-10 minutes)
3. Click **"Next"** when complete

### **Step 4: MySQL Server Configuration**

1. **Type and Networking**:
   - Config Type: **Development Computer**
   - Port: **3306** (default)
   - Click **"Next"**

2. **Authentication Method**:
   - Select: **"Use Strong Password Encryption"**
   - Click **"Next"**

3. **Accounts and Roles**:
   - Set **Root Password**: Choose a strong password
   - **IMPORTANT**: Remember this password!
   - Click **"Next"**

4. **Windows Service**:
   - Service Name: **MySQL80** (default)
   - ✅ Check **"Start the MySQL Server at System Startup"**
   - Click **"Next"**

5. **Apply Configuration**:
   - Click **"Execute"**
   - Wait for completion
   - Click **"Finish"**

### **Step 5: Complete Installation**

1. Click **"Next"** through remaining screens
2. Click **"Finish"**

### **Step 6: Verify Installation**

Open **Command Prompt** and run:

```bash
mysql --version
```

You should see:
```
mysql  Ver 8.0.xx for Win64 on x86_64
```

---

## 🗄️ **Database Setup**

### **Step 1: Open MySQL**

```bash
mysql -u root -p
```

Enter your root password when prompted.

### **Step 2: Create Database**

```sql
CREATE DATABASE digitalmeng;
```

### **Step 3: Create User (Recommended)**

```sql
-- Create dedicated user
CREATE USER 'digitalmeng'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON digitalmeng.* TO 'digitalmeng'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### **Step 4: Test Connection**

```bash
mysql -u digitalmeng -p digitalmeng
```

Enter the password you set. If successful, you'll see:
```
mysql>
```

Type `EXIT;` to quit.

---

## ⚙️ **Configure DigitalMEng**

### **Step 1: Create .env.local**

Create file: `.env.local` in project root:

```env
# MySQL Database Connection
DATABASE_URL="mysql://digitalmeng:your_password@localhost:3306/digitalmeng"

# Or using root user:
# DATABASE_URL="mysql://root:your_root_password@localhost:3306/digitalmeng"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production-min-32-chars-required
JWT_SECRET=dev-jwt-secret-change-in-production-minimum-32-chars

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DigitalMEng
NODE_ENV=development
DEMO_MODE=true

# Session
SESSION_COOKIE_NAME=session_token
SESSION_MAX_AGE=604800
```

### **Step 2: Generate Prisma Client**

```bash
npm run db:generate
```

### **Step 3: Create Database Tables**

```bash
npm run db:push
```

This creates all tables in your MySQL database.

### **Step 4: Create Admin User**

```bash
npm run admin:quick
```

---

## ✅ **Verify Everything Works**

### **1. Check MySQL Service**

**Windows Services**:
1. Press `Win + R`
2. Type `services.msc`
3. Find **MySQL80**
4. Status should be **"Running"**

### **2. Check Database**

```bash
mysql -u digitalmeng -p
```

```sql
USE digitalmeng;
SHOW TABLES;
```

You should see all tables listed.

### **3. Check Prisma Studio**

```bash
npm run db:studio
```

Opens browser with database viewer.

### **4. Test Login**

1. Go to: http://localhost:3000/login
2. Email: `admin@digitalmeng.com`
3. Password: `admin123`
4. Should redirect to dashboard

---

## 🔧 **Troubleshooting**

### **MySQL Not Found in PATH**

**Error**: `'mysql' is not recognized as an internal or external command`

**Solution**:
1. Search **"Environment Variables"** in Windows
2. Click **"Environment Variables"**
3. Under **"System variables"**, select **"Path"**
4. Click **"Edit"**
5. Click **"New"**
6. Add: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
7. Click **"OK"** on all windows
8. **Restart Command Prompt**

---

### **Access Denied Error**

**Error**: `Access denied for user 'root'@'localhost'`

**Solution**:
1. Check password is correct
2. Reset root password if needed:
   ```bash
   # Stop MySQL service
   net stop MySQL80
   
   # Start in safe mode
   mysqld --skip-grant-tables
   
   # In new terminal:
   mysql -u root
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   EXIT;
   
   # Restart MySQL normally
   net start MySQL80
   ```

---

### **Port 3306 Already in Use**

**Error**: Port 3306 is already in use

**Solution**:
1. Check what's using port 3306:
   ```bash
   netstat -ano | findstr :3306
   ```
2. Stop the conflicting service
3. Or change MySQL port in installation

---

### **Database Connection Failed**

**Error**: `Can't connect to MySQL server`

**Solutions**:
1. **Check MySQL is running**:
   ```bash
   net start MySQL80
   ```

2. **Check connection string** in `.env.local`:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/digitalmeng"
   ```

3. **Test connection manually**:
   ```bash
   mysql -u digitalmeng -p digitalmeng
   ```

---

## 🔐 **Security Best Practices**

### **Development**:
- ✅ Use dedicated user (not root)
- ✅ Strong password for database
- ✅ Localhost only access

### **Production**:
- ✅ Change all default passwords
- ✅ Use environment variables
- ✅ Enable SSL connections
- ✅ Regular backups
- ✅ Firewall rules

---

## 📊 **MySQL Management Tools**

### **1. MySQL Workbench** (Recommended)
- Download: https://dev.mysql.com/downloads/workbench/
- Visual database management
- Query builder
- Schema designer

### **2. Prisma Studio** (Built-in)
```bash
npm run db:studio
```
- Web-based interface
- Easy data viewing/editing
- No installation needed

### **3. Command Line**
```bash
mysql -u digitalmeng -p digitalmeng
```
- Direct SQL access
- Fast for queries
- Scriptable

---

## 🎯 **Quick Reference**

### **Common MySQL Commands**:

```sql
-- Show databases
SHOW DATABASES;

-- Use database
USE digitalmeng;

-- Show tables
SHOW TABLES;

-- Describe table
DESCRIBE users;

-- Show all users
SELECT * FROM users;

-- Count records
SELECT COUNT(*) FROM users;

-- Exit
EXIT;
```

### **Common npm Commands**:

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Open Prisma Studio
npm run db:studio

# Create admin user
npm run admin:quick

# Reset database (WARNING: Deletes all data!)
npm run db:reset
```

---

## 📞 **Need Help?**

### **Check Installation**:
```bash
# MySQL version
mysql --version

# Service status
net start | findstr MySQL

# Test connection
mysql -u root -p
```

### **Check Configuration**:
```bash
# View .env.local
type .env.local

# Test Prisma connection
npx prisma db execute --stdin < nul
```

---

## 🎉 **Success Checklist**

After installation, you should have:

- [x] MySQL 8.0 installed
- [x] MySQL service running
- [x] Database `digitalmeng` created
- [x] User `digitalmeng` created (or using root)
- [x] `.env.local` configured
- [x] Prisma client generated
- [x] All tables created
- [x] Admin user created
- [x] Can login to application

---

## 📚 **Next Steps**

1. ✅ **Login** to application
2. ✅ **Change admin password**
3. ✅ **Explore Prisma Studio**: `npm run db:studio`
4. ✅ **Start developing**!

---

**Installation Time**: 15-20 minutes  
**Difficulty**: ⭐⭐ Medium  
**Automated Script**: `.\install-mysql.bat`

---

**Last Updated**: January 8, 2026  
**MySQL Version**: 8.0.x  
**Platform**: Windows
