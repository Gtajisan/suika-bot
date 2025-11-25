
# 🛠️ RentoBot - Step-by-Step Installation Guide

Complete installation guide for RentoBot on various platforms

---

## 📑 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Discord Bot Setup](#-discord-bot-setup)
3. [MongoDB Setup](#-mongodb-setup)
4. [Installation Methods](#-installation-methods)
5. [Configuration](#-configuration)
6. [First Run](#-first-run)
7. [Deployment](#-deployment)
8. [Troubleshooting](#-troubleshooting)
9. [Updates & Maintenance](#-updates--maintenance)

---

## 📋 Prerequisites

Before starting, ensure you have:

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Node.js**: Version 20.0.0 or higher
- **RAM**: Minimum 512MB (1GB+ recommended)
- **Storage**: 500MB free space
- **Internet**: Stable connection for Discord and MongoDB

### Required Accounts

1. **Discord Account** - [Create here](https://discord.com/register)
2. **Discord Developer Portal Access** - [Access here](https://discord.com/developers/applications)
3. **MongoDB Account** - [Create here](https://www.mongodb.com/cloud/atlas/register) (Free tier available)
4. **GitHub Account** (optional) - For cloning repository

### Software Requirements

Check if Node.js is installed:

```bash
node --version
# Should output: v20.x.x or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/)

---

## 🤖 Discord Bot Setup

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Enter a name for your bot (e.g., "RentoBot")
4. Click **"Create"**

### Step 2: Configure Bot

1. Go to **"Bot"** tab in left sidebar
2. Click **"Add Bot"** → Confirm
3. **Important Settings**:
   - ✅ **PUBLIC BOT**: Toggle OFF (recommended for private bot)
   - ✅ **REQUIRES OAUTH2 CODE GRANT**: Toggle OFF
   - ✅ **SERVER MEMBERS INTENT**: Toggle ON
   - ✅ **MESSAGE CONTENT INTENT**: Toggle ON
   - ✅ **PRESENCE INTENT**: Toggle ON

### Step 3: Get Bot Token

1. Under **"TOKEN"** section, click **"Reset Token"**
2. Click **"Copy"** to copy your bot token
3. **⚠️ CRITICAL**: Save this token securely - you'll need it later
4. **Never share this token publicly!**

### Step 4: Get Application IDs

1. Go to **"OAuth2"** tab → **"General"**
2. Copy **CLIENT ID** - save it
3. Click **"Reset Secret"** under CLIENT SECRET
4. Copy **CLIENT SECRET** - save it

### Step 5: Generate Invite Link

1. Go to **"OAuth2"** tab → **"URL Generator"**
2. **SCOPES**: Select:
   - ✅ `bot`
   - ✅ `applications.commands`
3. **BOT PERMISSIONS**: Select:
   - ✅ Administrator (or specific permissions):
     - Read Messages/View Channels
     - Send Messages
     - Embed Links
     - Attach Files
     - Read Message History
     - Add Reactions
     - Use Slash Commands
     - Manage Messages
     - Manage Roles
     - Kick Members
     - Ban Members
4. Copy the **GENERATED URL** at bottom
5. Open URL in browser to invite bot to your server

---

## 🗄️ MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

#### Step 1: Create Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Verify your email

#### Step 2: Create Cluster

1. Click **"Build a Database"**
2. Choose **"FREE"** tier (M0 Sandbox)
3. Select cloud provider and region (closest to you)
4. Cluster name: `RentoBot` (or any name)
5. Click **"Create Cluster"** (takes 3-5 minutes)

#### Step 3: Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `rentobot` (or your choice)
5. **Password**: Generate a secure password (save it!)
6. **Database User Privileges**: Read and write to any database
7. Click **"Add User"**

#### Step 4: Whitelist IP Address

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production: Add your server's specific IP
4. Click **"Confirm"**

#### Step 5: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user credentials
7. Save this connection string

### Option B: Local MongoDB (Advanced)

1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install MongoDB
3. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
4. Connection string: `mongodb://localhost:27017/rentobot`

---

## 💾 Installation Methods

### Method 1: Replit (Easiest - Recommended for Beginners)

#### Step 1: Fork/Import Repository

1. Go to [Replit](https://replit.com)
2. Click **"Create Repl"**
3. Choose **"Import from GitHub"**
4. Enter: `https://github.com/notsopreety/Rento-Bot`
5. Click **"Import from GitHub"**

#### Step 2: Configure Bot

Edit the `config.json` file with your credentials:

```json
{
  "discord": {
    "token": "YOUR_BOT_TOKEN_HERE",
    "clientId": "YOUR_CLIENT_ID_HERE",
    "clientSecret": "YOUR_CLIENT_SECRET_HERE"
  },
  "database": {
    "mongodbUri": "YOUR_MONGODB_URI_HERE"
  },
  "bot": {
    "prefix": "!",
    "adminBot": ["YOUR_DISCORD_USER_ID"]
  },
  "dashboard": {
    "enabled": true,
    "port": 5000,
    "sessionSecret": "random_secure_string",
    "username": "admin",
    "password": "your_secure_password"
  }
}
```

**To get your Discord User ID**:
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click your name → Copy User ID

**Optional: Use Replit Secrets**
If you prefer environment variables over config.json, you can use Replit Secrets instead (they will override config.json values)

#### Step 3: Run Bot

1. Click **"Run"** button at top
2. Wait for packages to install (first run takes 2-3 minutes)
3. Bot will start automatically!

### Method 2: Local Installation (Windows/Mac/Linux)

#### Step 1: Download Repository

**Option A - Using Git**:
```bash
git clone https://github.com/notsopreety/Rento-Bot.git
cd Rento-Bot
```

**Option B - Download ZIP**:
1. Go to [GitHub Repository](https://github.com/notsopreety/Rento-Bot)
2. Click **"Code"** → **"Download ZIP"**
3. Extract ZIP file
4. Open terminal/command prompt in extracted folder

#### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (~5 minutes first time)

#### Step 3: Configure Bot

1. Copy the example config file:
   ```bash
   # Windows
   copy config.example.json config.json
   
   # macOS/Linux
   cp config.example.json config.json
   ```

2. Edit `config.json` with your values:
   ```json
   {
     "discord": {
       "token": "YOUR_BOT_TOKEN",
       "clientId": "YOUR_CLIENT_ID",
       "clientSecret": "YOUR_CLIENT_SECRET"
     },
     "database": {
       "mongodbUri": "YOUR_MONGODB_URI"
     },
     "bot": {
       "prefix": "!",
       "adminBot": ["YOUR_DISCORD_USER_ID"],
       "timezone": "Asia/Kathmandu"
     },
     "dashboard": {
       "enabled": true,
       "port": 5000,
       "sessionSecret": "random_secure_string",
       "username": "admin",
       "password": "your_secure_password"
     }
   }
   ```

**Optional: Use .env file**
You can optionally create a `.env` file for environment variables (they will override config.json)

#### Step 4: Run Bot

```bash
npm start
```

Bot should start and show login sequence!

---

## ⚙️ Configuration

### Basic Configuration (config.json)

Edit `config.json` in root directory:

```json
{
  "bot": {
    "prefix": "!",
    "adminBot": ["YOUR_DISCORD_USER_ID"],
    "language": "en",
    "timezone": "Asia/Kathmandu"
  },
  "dashboard": {
    "enabled": true,
    "port": 5000
  },
  "autoRestart": {
    "enabled": true,
    "time": 86400000
  }
}
```

### Advanced Configuration

#### Enable Admin-Only Mode

```json
{
  "bot": {
    "onlyadmin": true
  }
}
```

#### Enable Admin-Guild Mode

```json
{
  "bot": {
    "onlyadminchannel": true,
    "adminChannels": [
      {
        "guildId": "YOUR_GUILD_ID",
        "channelId": "YOUR_CHANNEL_ID"
      }
    ]
  }
}
```

**To get Guild/Channel IDs**:
1. Enable Developer Mode in Discord
2. Right-click server name → Copy Server ID
3. Right-click channel name → Copy Channel ID

#### Configure Presence

```json
{
  "presence": {
    "enabled": true,
    "rotation": true,
    "rotationInterval": 5,
    "custom": {
      "name": "with users | !help",
      "type": "playing",
      "status": "online"
    }
  }
}
```

**Activity Types**: `playing`, `watching`, `listening`, `competing`, `streaming`
**Status**: `online`, `idle`, `dnd`, `invisible`

#### Enable Error Notifications

```json
{
  "bot": {
    "logErrorAdminChannels": true,
    "adminChannels": [
      {
        "guildId": "YOUR_GUILD_ID",
        "channelId": "LOG_CHANNEL_ID"
      }
    ]
  }
}
```

---

## 🚀 First Run

### Expected Startup Sequence

When you run the bot, you should see:

```
──────────────────────────────────────────────────────────
        ██████╗ ██╗███████╗ ██████╗ ██████╗ ██████╗ ██████╗
        ██╔══██╗██║██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗
        ...
──────────────────────────────────────────────────────────

────────────────── PACKAGE VERIFICATION ──────────────────
✔ Found 19 unique packages used in bot
✓ Verified 19 packages
────────────────────────────────────────────────────────────

────────────────── DATABASE CONNECTION ───────────────────
✔ Connected to MongoDB successfully
✔ Database controllers initialized
────────────────────────────────────────────────────────────

──────────────────── LOADING COMMANDS ────────────────────
[COMMAND] ✓ Loaded: admin, afk, anilist, anime, ...
Successfully loaded 90/90 commands
────────────────────────────────────────────────────────────

───────────────────── LOADING EVENTS ─────────────────────
[EVENT] ✓ Loaded: guildCreate, guildMemberAdd, ...
Successfully loaded 6/6 events
────────────────────────────────────────────────────────────

────────────────────── BOT LOGIN ─────────────────────────
✔ Logged in as YourBot#1234
────────────────────────────────────────────────────────────

──────────────────── PRESENCE MANAGER ────────────────────
✔ Presence manager initialized
────────────────────────────────────────────────────────────

──────────────────────── DASHBOARD ───────────────────────
✔ Dashboard started on port 5000
────────────────────────────────────────────────────────────

🚀 BOT IS NOW ONLINE AND READY TO SERVE! 🚀
```

### First Commands to Test

1. **Check if bot is online**:
   ```
   !ping
   ```
   Expected response: Latency information

2. **View help**:
   ```
   !help
   ```
   Expected response: Command list with pagination

3. **Check bot info**:
   ```
   !botinfo
   ```
   Expected response: Bot statistics and information

4. **Test slash command**:
   ```
   /ping
   ```
   Expected response: Same as `!ping`

### Access Dashboard

1. Open browser
2. Go to: `http://localhost:5000`
3. You should see the RentoBot homepage
4. Access admin panel: `http://localhost:5000/admin`
5. Login with credentials from `.env`:
   - Username: from `DASHBOARD_USERNAME`
   - Password: from `DASHBOARD_PASSWORD`

---

## 🌐 Deployment

### Deploying on Replit

1. Bot auto-runs when you start the Repl
2. For 24/7 uptime:
   - Use [UptimeRobot](https://uptimerobot.com/) to ping your Repl every 5 minutes
   - Monitor URL: `https://your-repl-name.your-username.repl.co`

### Deploying on VPS (Ubuntu/Debian)

#### Step 1: Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

#### Step 2: Clone and Setup

```bash
# Clone repository
git clone https://github.com/notsopreety/Rento-Bot.git
cd Rento-Bot

# Install dependencies
npm install

# Create .env file
nano .env
# Paste your environment variables
# Press Ctrl+X, Y, Enter to save
```

#### Step 3: Start with PM2

```bash
# Start bot
pm2 start index.js --name rentobot

# Setup auto-restart on server reboot
pm2 startup
pm2 save

# Monitor bot
pm2 monit

# View logs
pm2 logs rentobot
```

#### Step 4: Setup Firewall (if using dashboard)

```bash
# Allow port 5000
sudo ufw allow 5000/tcp

# Enable firewall
sudo ufw enable
```

Access dashboard at: `http://YOUR_SERVER_IP:5000`

### Using a Domain Name

1. Purchase domain (e.g., from Namecheap, GoDaddy)
2. Point A record to your server IP
3. Setup Nginx reverse proxy:

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/rentobot
```

Paste this config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/rentobot /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

Access at: `http://yourdomain.com`

---

## 🔧 Troubleshooting

### Bot Won't Start

**Problem**: `Error: Cannot find module 'discord.js'`

**Solution**:
```bash
npm install
```

---

**Problem**: `Invalid token`

**Solution**:
1. Go to Discord Developer Portal
2. Bot tab → Reset Token
3. Copy new token
4. Update in `.env` or Replit Secrets
5. Restart bot

---

**Problem**: `DiscordAPIError: Missing Access`

**Solution**:
1. Check bot permissions in Discord Developer Portal
2. Reinvite bot with correct permissions
3. Enable all required intents

---

### Database Connection Issues

**Problem**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
1. Check MongoDB is running (if local)
2. Verify connection string in `.env`
3. Check IP whitelist in MongoDB Atlas
4. Ensure firewall allows MongoDB connections

---

**Problem**: `Authentication failed`

**Solution**:
1. Verify username/password in connection string
2. Check database user has correct permissions
3. Ensure password is URL-encoded (replace special chars)

---

### Command Issues

**Problem**: Commands not working

**Solution**:
1. Check bot has "Send Messages" permission
2. Verify prefix is correct: `!help`
3. Check bot can read messages (Message Content Intent enabled)
4. Try slash command: `/help`

---

**Problem**: Slash commands not appearing

**Solution**:
```bash
# Delete all slash commands
!eval await client.application.commands.set([])

# Restart bot (re-registers commands)
!restart
```

Wait 1 hour or kick/re-invite bot to server

---

### Dashboard Issues

**Problem**: Can't access dashboard

**Solution**:
1. Check port 5000 is not in use:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux/Mac
   lsof -i :5000
   ```
2. Try different port in `.env`:
   ```env
   DASHBOARD_PORT=3000
   ```
3. Restart bot

---

**Problem**: Can't login to admin panel

**Solution**:
1. Verify credentials in `.env`
2. Clear browser cookies
3. Try incognito mode
4. Check console for errors (F12)

---

### Performance Issues

**Problem**: Bot is slow/laggy

**Solution**:
1. Check server resources:
   ```bash
   !botinfo  # Check memory usage
   ```
2. Clear cache:
   ```bash
   !clearcache
   ```
3. Restart bot:
   ```bash
   !restart
   ```
4. If on Replit, upgrade to Hacker plan for better resources

---

**Problem**: High memory usage

**Solution**:
1. Disable presence rotation in `config.json`:
   ```json
   {
     "presence": {
       "rotation": false
     }
   }
   ```
2. Reduce cache size (edit `database/controller/*.js`)
3. Restart bot regularly (enable auto-restart)

---

### Error Notifications Not Working

**Problem**: Not receiving error logs in Discord

**Solution**:
1. Enable in `config.json`:
   ```json
   {
     "bot": {
       "logErrorAdminChannels": true
     }
   }
   ```
2. Configure admin channels:
   ```json
   {
     "bot": {
       "adminChannels": [
         {
           "guildId": "YOUR_GUILD_ID",
           "channelId": "YOUR_CHANNEL_ID"
         }
       ]
     }
   }
   ```
3. Check bot has "Send Messages" permission in channel
4. Restart bot

---

## 🔄 Updates & Maintenance

### Updating Bot

#### Method 1: Git Pull (Recommended)

```bash
# Backup your .env and config.json first!
cp .env .env.backup
cp config.json config.json.backup

# Pull latest changes
git pull origin main

# Reinstall dependencies (if package.json changed)
npm install

# Restart bot
pm2 restart rentobot  # If using PM2
# OR
npm start  # If running manually
```

#### Method 2: Manual Update

1. Download latest release from GitHub
2. Backup your `.env` and `config.json`
3. Replace all files except `.env` and `config.json`
4. Run `npm install`
5. Start bot

### Regular Maintenance Tasks

**Daily**:
- Check bot is online: `!ping`
- Monitor error logs in admin channel
- Check dashboard: `http://localhost:5000/admin`

**Weekly**:
- Clear cache: `!clearcache`
- Check command statistics: `!popularcmd`
- Review user reports/appeals

**Monthly**:
- Update dependencies: `npm update`
- Backup database (MongoDB Atlas auto-backups)
- Review and update configurations

### Backup Strategy

**Database Backup**:
```bash
# Using MongoDB Atlas (automatic)
# Go to Atlas → Clusters → Backup tab
# Enable automatic backups (free tier includes)

# Manual backup (local MongoDB)
mongodump --uri="mongodb://localhost:27017/rentobot" --out=./backup
```

**Bot Files Backup**:
```bash
# Backup .env and config.json
cp .env ~/backups/rentobot-env-$(date +%Y%m%d)
cp config.json ~/backups/rentobot-config-$(date +%Y%m%d)
```

---

## 📞 Getting Help

If you're still having issues:

1. **Check Documentation**:
   - [README.md](README.md) - Overview and features
   - [DOCS.md](DOCS.md) - Detailed documentation
   - This file - Installation guide

2. **Search Issues**: 
   - [GitHub Issues](https://github.com/notsopreety/Rento-Bot/issues)
   - Check if someone had the same problem

3. **Ask for Help**:
   - Discord: [Join support server](https://discord.gg/zYdj9qQX)
   - GitHub: [Create new issue](https://github.com/notsopreety/Rento-Bot/issues/new)

4. **When Asking for Help, Include**:
   - Bot version (`!botinfo`)
   - Error message (full log)
   - What you tried
   - Your setup (Replit/VPS/Local)
   - Node.js version (`node --version`)

---

## ✅ Post-Installation Checklist

- [ ] Bot is online and responding to `!ping`
- [ ] Slash commands work (`/help`)
- [ ] Dashboard accessible at `http://localhost:5000`
- [ ] Admin panel login works
- [ ] Database connected (check `!botinfo`)
- [ ] Commands working (`!help`, `!rank`, `!daily`)
- [ ] Admin commands restricted (`!eval` only for admins)
- [ ] Error notifications configured
- [ ] Auto-restart enabled
- [ ] Backup strategy in place
- [ ] Bot invited to your server with correct permissions
- [ ] Intents enabled in Discord Developer Portal

---

**Installation complete! 🎉**

Your RentoBot is now ready to serve your Discord community!

For advanced features and customization, see [DOCS.md](DOCS.md).

---

**Last Updated**: 2025
**Guide Version**: 1.0.0
**Author**: Samir Badaila
