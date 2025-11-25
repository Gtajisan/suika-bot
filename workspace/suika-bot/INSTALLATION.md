# 🚀 Suika Bot - Installation & Setup Guide

Complete installation guide for setting up Suika Bot on Replit, local machine, or any Node.js environment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup (Replit)](#quick-setup-replit)
3. [Manual Installation](#manual-installation)
4. [Configuration](#configuration)
5. [First Run](#first-run)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** v14.0.0 or higher
- **npm** v6.0.0 or higher
- **Telegram Bot Token** (from @BotFather)
- **Terminal/Command Line** access

### Get Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/start` command
3. Send `/newbot` command
4. Follow prompts to name your bot
5. Copy the token (looks like: `123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk`)

---

## Quick Setup (Replit)

### Method 1: Fork from GitHub

1. Go to: https://github.com/Gtajisan/suika-bot
2. Click "Fork" button
3. Open fork in Replit
4. Click "Use Template" or "Import from GitHub"

### Method 2: Create New Replit Project

1. Go to https://replit.com
2. Click "Create Replit"
3. Choose "Node.js"
4. Click "Create Replit"

```bash
# Clone the repository
git clone https://github.com/Gtajisan/suika-bot.git
cd suika-bot

# Install dependencies
npm install
```

### Add Telegram Token to Replit Secrets

1. Click **🔒 Secrets (Lock icon)** in left sidebar
2. Click **Add Secret**
3. Key: `TELEGRAM_BOT_TOKEN`
4. Value: Your token from @BotFather
5. Click "Add Secret"

### Start the Bot

```bash
npm start
```

You should see:
```
✅ Suika Bot started successfully!
👤 Bot Username: @your_bot_username
💾 Developer: Gtajisan
```

**Bot is now running!** 🎉

---

## Manual Installation

### Step 1: Get the Code

```bash
# Clone from GitHub
git clone https://github.com/Gtajisan/suika-bot.git
cd suika-bot

# OR download ZIP and extract
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `telegraf` - Telegram API
- `better-sqlite3` - SQLite database
- `dotenv` - Environment variables
- `fs-extra` - File utilities
- Canvas & other tools

### Step 3: Set Up Environment

Create `.env` file:

```bash
# On Mac/Linux
touch .env

# On Windows
copy nul .env
```

Add to `.env`:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk
BOT_PREFIX=/
BOT_TIMEZONE=UTC
```

### Step 4: Configure Bot

Edit `config.json`:

```json
{
  "telegram": {
    "token": "your-token-here"
  },
  "bot": {
    "prefix": "/",
    "defaultLang": "en",
    "timezone": "UTC",
    "adminBot": [YOUR_TELEGRAM_ID]
  },
  "database": {
    "mongodbUri": ""
  }
}
```

**Find Your Telegram ID:**
- Send `/start` to @userinfobot
- It will show your user ID

### Step 5: Start Bot

```bash
# Development mode
npm start

# With logging
npm start 2>&1 | tee bot.log

# Background (Mac/Linux)
nohup npm start &

# Background (Windows)
npm start &
```

---

## Configuration

### Basic Config

**File:** `config.json`

```json
{
  "telegram": {
    "token": "YOUR_TOKEN_HERE"
  },
  "bot": {
    "prefix": "/",
    "defaultLang": "en",
    "timezone": "UTC",
    "adminBot": [123456789]
  },
  "database": {
    "mongodbUri": ""
  }
}
```

### Environment Variables

Create `.env` file:

```env
# Required
TELEGRAM_BOT_TOKEN=your_token_here

# Optional
BOT_PREFIX=/
BOT_TIMEZONE=UTC
BOT_ADMIN_ID=your_id_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### Settings Explained

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| TELEGRAM_BOT_TOKEN | string | - | **Required** Bot token from @BotFather |
| BOT_PREFIX | string | / | Command prefix (/ or ! etc) |
| BOT_TIMEZONE | string | UTC | Server timezone |
| BOT_ADMIN_ID | number | - | Your Telegram user ID (for admin) |
| MONGODB_URI | string | - | Optional MongoDB connection |

---

## First Run

### 1. Verify Installation

```bash
npm start
```

You should see:
```
🍈 Initializing Suika Bot...
✅ Using SQLite
✅ Loaded 94 commands
Event handlers loaded successfully
✅ Suika Bot started successfully!
👤 Bot Username: @suika_bot
💾 Developer: Gtajisan
📦 Commands: 94
```

### 2. Test Bot

Open Telegram and send:

```
/start          # Welcome message
/ping           # Bot latency
/help           # Available commands
/balance        # Your balance
```

### 3. Check Logs

Look for any error messages. Common issues:

```
Error: TELEGRAM_BOT_TOKEN not found
→ Add token to .env or config.json

Error loading command xxx.js
→ Check command syntax
→ Restart bot

Database error
→ Check /data folder permissions
```

---

## Database Setup

### SQLite (Default)

**Automatic setup** - No configuration needed!

Database file: `/data/suika.db`

```bash
# View database (optional)
sqlite3 data/suika.db
sqlite> .tables
sqlite> SELECT * FROM users;
sqlite> .quit
```

### MongoDB (Optional)

1. Create free account: https://www.mongodb.com/cloud/atlas

2. Create cluster and get connection string

3. Add to `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

4. Restart bot - will use MongoDB instead of SQLite

---

## Troubleshooting

### Bot Not Starting

**Error:** `Cannot find module 'telegraf'`
```bash
# Solution
npm install
npm start
```

**Error:** `Missing Telegram Bot Token`
```bash
# Solution - Add to .env or config.json
TELEGRAM_BOT_TOKEN=your_token_here
npm start
```

### Commands Not Loading

**Error:** `Error loading command xxx.js`

1. Check command syntax:
```bash
node -c commands/xxx.js
```

2. Check required exports:
```javascript
module.exports = {
    config: { /* required */ },
    langs: { /* required */ },
    onStart: async ({ /* required */ }) => {}
};
```

3. Restart bot:
```bash
npm start
```

### Database Issues

**Error:** `Database initialization failed`

```bash
# SQLite: Check permissions
ls -la data/
chmod 755 data/

# MongoDB: Check connection string
# Verify MONGODB_URI format
# Check IP whitelist on MongoDB Atlas
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

```bash
# Kill existing process
pkill -f "node"
npm start
```

### Out of Memory

**Error:** `JavaScript heap out of memory`

```bash
# Increase memory
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

---

## Performance Tips

### 1. Database Optimization

```javascript
// Good - Single query per operation
const user = await usersData.get(userId);

// Bad - Multiple queries in loop
for (let i = 0; i < users.length; i++) {
    const user = await usersData.get(users[i]); // Slow!
}

// Better - Batch operations
const allUsers = await usersData.getAll();
```

### 2. Reduce Command Load Time

```javascript
// Bad - All commands in memory
const commands = await fs.readdir('./commands');

// Good - Only load needed commands
const command = require(`./commands/${name}.js`);
```

### 3. Enable Polling Optimization

```javascript
// Already configured in loadEvents.js
polling: {
    timeout: 30,
    limit: 100,
    allowed_updates: ['message', 'callback_query']
}
```

---

## Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
ENV NODE_ENV=production

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t suika-bot .
docker run -e TELEGRAM_BOT_TOKEN=your_token suika-bot
```

---

## Monitoring

### Check Bot Status

```bash
# View process
ps aux | grep "node"

# View logs
tail -f bot.log

# Monitor resource usage
top
```

### Automated Restarts

Create `restart.sh`:

```bash
#!/bin/bash
while true; do
    npm start
    echo "Bot crashed, restarting..."
    sleep 5
done
```

Run:
```bash
chmod +x restart.sh
./restart.sh
```

---

## Next Steps

1. **Create Custom Commands** - See COMMAND_BUILDER.md
2. **Configure Settings** - Edit config.json
3. **Add to Telegram Group** - Ask admin to add bot
4. **Enable Admin Features** - Add your ID to config
5. **Monitor Logs** - Check for errors regularly

---

## Support

- 📖 Read COMMAND_BUILDER.md for creating commands
- 🐛 Check logs for error messages
- 📚 Review existing commands for examples
- 🔗 Visit GitHub: https://github.com/Gtajisan/suika-bot

---

**Happy coding! 🍈**
