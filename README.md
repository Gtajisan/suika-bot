# SUIKA BOT - TELEGRAM

```
================================================================================
                          SUIKA BOT - TELEGRAM
                    Advanced Bot with 99+ Commands
        Economy | Games | Admin Tools | AI Features | Multi-Language
================================================================================
```

**Suika Bot** is a powerful Telegram bot built on Node.js with 99 commands, SQLite database, multi-language support, and an admin dashboard.

- **Original Creator:** Rento-Bot
- **Converted to Telegram by:** Gtajisan
- **Framework:** Telegraf (Official Telegram API for Node.js)
- **Database:** SQLite with optional MongoDB support

---

## KEY FEATURES

ECONOMY SYSTEM
- Wallet and bank management
- Daily rewards and work shifts
- Steal and rob functionality
- Money transfer between users
- Shop and inventory system
- Leaderboard rankings

GAMES AND ENTERTAINMENT
- Tic-tac-toe competitive mode
- Quiz challenges with scoring
- Slot machine gambling
- Pair memory matching game
- Number guessing game
- Anime information lookup

AI AND ADVANCED FEATURES
- AI chat integration
- Image generation (5+ models)
- Code compilation and testing
- Text translation (30+ languages)
- GitHub profile lookup
- Weather forecasting

ADMIN AND MODERATION
- User management (ban, kick, mute)
- Group moderation tools
- Warning system with tracking
- Slowmode and flood control
- Message deletion utilities
- Permission level system

ANALYTICS AND STATISTICS
- User leaderboard with rankings
- Profile statistics per user
- Experience and level tracking
- Game result history
- User activity monitoring
- Real-time dashboard

---

## INSTALLATION

Prerequisites:
  Node.js v20.x or higher
  npm (included with Node.js)
  Telegram Bot Token (from @BotFather)

Step 1: Download and Setup
```bash
git clone https://github.com/yourusername/suika-bot.git
cd suika-bot
npm install
```

Step 2: Configure Bot
Edit config.json and add your Telegram bot token:
```json
{
  "telegram": {
    "token": "YOUR_BOT_TOKEN_FROM_BOTFATHER"
  },
  "dashboard": {
    "groups": {
      "main": "https://t.me/your_main_group",
      "support": "https://t.me/your_support_group"
    }
  }
}
```

Step 3: Start Bot
```bash
npm start
```

Expected Console Output:
```
================================================================================
                    SUIKA BOT - TELEGRAM
              Powerful Moderation and Games Platform
================================================================================

[INITIALIZATION STARTED]
====================================

[INFO] Initializing database...
[DONE] Database initialized successfully

[INFO] Loading 99 commands...
[████████████████████████████] 100%
[DONE] All commands loaded successfully

[BOT INFORMATION]
Name: Suika Bot
Framework: Telegraf.js
Commands: 99 loaded in 0.23s
Categories: 20 different types

[DATABASE STATUS]
Type: SQLite
Location: ./data/suika.db
Status: Active and operational
Collections: 3 tables

[SYSTEM INFORMATION]
Platform: Linux
Memory: 27MB / 63MB
Node Version: v20.19.3

[DONE] Suika Bot is ready and operational!
Access dashboard at: http://0.0.0.0:5000
```

---

## COMMANDS

ECONOMY (11 Commands)
-------------------------------------------
Command          | Usage              | Description
-------------------------------------------
/balance         | /balance           | Check wallet and bank balance
/daily           | /daily             | Claim daily reward
/work            | /work              | Work to earn coins
/rob             | /rob @user         | Rob coins from user
/bank            | /bank deposit 100  | Manage bank account
/transfer        | /transfer @u 500   | Send money to user
/shop            | /shop              | Browse shop items
/inventory       | /inventory         | View your items
/leaderboard     | /leaderboard       | See top users
/stats           | /stats             | Your statistics
/user            | /user @user        | View user profile
-------------------------------------------

GAMES (15 Commands)
-------------------------------------------
Command          | Usage              | Description
-------------------------------------------
/tictactoe       | /tictactoe @user   | Play tic-tac-toe
/quiz            | /quiz              | Answer quiz questions
/slot            | /slot 100          | Play slot machine
/pair            | /pair              | Play pair matching
/guess           | /guess             | Guess the number
/hug             | /hug @user         | Hug someone
/kiss            | /kiss @user        | Kiss someone
/slap            | /slap @user        | Slap someone
/neko            | /neko              | Random cat image
/meme            | /meme              | Random meme
/anime           | /anime naruto      | Search anime
/movie           | /movie             | Search movie
/pet             | /pet               | Pet interaction
-------------------------------------------

AI AND TECH (12 Commands)
-------------------------------------------
Command          | Usage              | Description
-------------------------------------------
/ai              | /ai hello          | Chat with AI
/aigen           | /aigen prompt      | Generate images
/github          | /github username   | Get GitHub info
/upscale         | /upscale 4x        | Upscale images
/compile         | /compile           | Compile code
/talk            | /talk              | Talk to bot
/translate       | /translate text    | Translate text
/weather         | /weather city      | Get weather
/wiki            | /wiki topic        | Wikipedia search
/news            | /news              | Latest news
/spotify         | /spotify song      | Spotify info
/tiktok          | /tiktok            | TikTok video info
-------------------------------------------

ADMIN AND MODERATION (13 Commands)
-------------------------------------------
Command          | Usage              | Description
-------------------------------------------
/kick            | /kick @user        | Remove user from group
/ban             | /ban @user         | Ban user permanently
/mute            | /mute @user 5m     | Mute user for time
/warn            | /warn @user        | Issue warning to user
/clear           | /clear 10          | Delete last messages
/slowmode        | /slowmode 5        | Set slowmode seconds
/admin           | /admin add @user   | Manage admins
/lock            | /lock              | Lock group chat
/unlock          | /unlock            | Unlock group chat
/pin             | /pin               | Pin message
/unpin           | /unpin             | Unpin message
/announce        | /announce text     | Make announcement
-------------------------------------------

CONFIGURATION (8 Commands)
-------------------------------------------
Command          | Usage              | Description
-------------------------------------------
/config          | /config            | View configuration
/setprefix       | /setprefix !       | Change command prefix
/setlang         | /setlang en        | Set language (en/ne)
/notification    | /notification on   | Toggle notifications
/setcoin         | /setcoin @u 1000   | Set user coins (admin)
/setexp          | /setexp @u 500     | Set user XP (admin)
/reset           | /reset @user       | Reset user data (admin)
/help            | /help              | Show help menu
-------------------------------------------

OWNER AND DEVELOPER (20+ Commands)
-------------------------------------------
Command          | Usage              | Description
-------------------------------------------
/eval            | /eval code         | Execute JavaScript code
/shell           | /shell ls -la      | Run shell commands
/restart         | /restart           | Restart the bot
/update          | /update            | Update bot code
/botinfo         | /botinfo           | Display bot information
/ping            | /ping              | Check bot latency
/status          | /status            | Complete bot status
/myinfo          | /myinfo            | Your user profile
/uptime          | /uptime            | Bot uptime display
/clearcache      | /clearcache        | Clear all caches
Plus 10+ more...
-------------------------------------------

---

## WEB DASHBOARD

Access Point: http://0.0.0.0:5000

DASHBOARD FEATURES
- Real-time bot statistics
- Active user leaderboard
- Complete command browser
- Community group links
- Responsive mobile design
- Fast page load times

AVAILABLE ROUTES
Route             | Purpose
------------------------------------------
/                 | Home page with overview
/dashboard        | Main statistics dashboard
/commands         | Browse all 99 commands
/features         | Feature showcase
/api/stats        | JSON statistics (API)
/api/leaderboard  | Top users (API)
/api/user/:id     | User data (API)
------------------------------------------

---

## PROJECT STRUCTURE

```
suika-bot/
  commands/                  (99 command files)
    balance.js
    daily.js
    ai.js
    ... (96 more commands)
  
  dashboard/                 (Web interface)
    app.js                   (Express server)
    routes/                  (14 route files)
    views/                   (14 EJS templates)
    public/                  (CSS and JavaScript)
  
  database/
    index.js                 (Database router)
    sqlite.js                (SQLite driver)
    models/
      User.js                (User data model)
  
  handlers/
    loadCommands.js          (Command loader)
    loadEvents.js            (Event handlers)
  
  logger/
    console.js               (Advanced console)
    startup.js               (Startup display)
    log.js                   (Logger utility)
  
  Bot.js                     (Main bot file)
  index.js                   (Entry point)
  config.json                (Configuration)
  package.json               (Dependencies)
  README.md                  (This file)
```

---

## DATABASE

DATABASE TYPE: SQLITE (Default)

File Location: ./data/suika.db
Storage Type: File-based database
Setup Required: None (automatic)
Performance: Fast local queries
Backup: Single file backup

USER DATA SCHEMA
Field           | Type      | Description
------------------------------------------
telegramId      | Integer   | User ID (primary key)
firstName       | String    | User first name
lastName        | String    | User last name
username        | String    | Telegram username
money           | Integer   | Wallet balance
bank            | Integer   | Bank balance
level           | Integer   | User level
experience      | Integer   | User experience
lastDaily       | Date      | Last daily claim
createdAt       | Date      | Account creation
updatedAt       | Date      | Last update
------------------------------------------

MONGODB ALTERNATIVE (Optional)

To use MongoDB instead of SQLite:

1. Add to config.json:
```json
{
  "database": {
    "mongodbUri": "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
  }
}
```

2. Or set environment variable:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

---

## CONFIGURATION

CONFIG.JSON STRUCTURE

```json
{
  "telegram": {
    "token": "YOUR_BOT_TOKEN_HERE"
  },
  
  "bot": {
    "prefix": "/",
    "timezone": "Asia/Kathmandu",
    "defaultLang": "en",
    "adminBot": [123456789]
  },
  
  "dashboard": {
    "title": "Suika Bot",
    "description": "Telegram bot with games and economy",
    
    "groups": {
      "main": "https://t.me/your_main_group",
      "support": "https://t.me/your_support_group",
      "updates": "https://t.me/your_updates_channel"
    },
    
    "socials": {
      "github": "https://github.com/your-repo",
      "telegram": "https://t.me/your_bot",
      "instagram": "",
      "discord": ""
    }
  }
}
```

ENVIRONMENT VARIABLES

Variable Name       | Required | Description
------------------------------------------
TELEGRAM_BOT_TOKEN  | YES      | Bot token from BotFather
MONGODB_URI         | NO       | MongoDB connection string
BOT_PREFIX          | NO       | Command prefix (default: /)
DASHBOARD_PORT      | NO       | Dashboard port (default: 5000)
BOT_TIMEZONE        | NO       | Timezone setting
------------------------------------------

---

## CREATING NEW COMMANDS

COMMAND TEMPLATE

```javascript
module.exports = {
    config: {
        name: "mycommand",
        aliases: ["alias1", "alias2"],
        description: { 
            en: "My command description"
        },
        category: "general",
        countDown: 3
    },
    
    run: async (msg, args, bot) => {
        // Your command logic here
        return msg.reply("Hello!");
    }
};
```

ADD CUSTOM COMMAND

1. Create file: commands/mycommand.js
2. Add code from template above
3. Restart bot: npm start
4. Command automatically loads
5. Use: /mycommand

---

## PERFORMANCE METRICS

Metric                   | Value
------------------------------------------
Total Commands           | 99
Command Load Time        | Less than 100ms
Average Response Time    | Less than 500ms
Memory Usage             | Approximately 27MB
Database Query Speed     | Instant (SQLite)
Maximum Concurrent Users | Unlimited
Bot Framework            | Telegraf.js (polling)
------------------------------------------

---

## SECURITY FEATURES

Implemented Security:
- Bot tokens secured in config/secrets
- Input validation on all commands
- Rate limiting through cooldown system
- Comprehensive error handling
- Role-based permission checking
- Full activity logging
- No hardcoded credentials

---

## TROUBLESHOOTING

ISSUE: Bot will not start

Error: Cannot find module 'telegraf'
Solution:
  1. Run: npm install
  2. Check package.json exists
  3. Try: npm install telegraf

ISSUE: Telegram bot token not recognized

Error: Missing Telegram Bot Token
Solution:
  1. Edit config.json
  2. Add token from @BotFather
  3. Restart bot: npm start

ISSUE: Commands not loading

Error: Commands failed to load
Solution:
  1. Check /commands folder exists
  2. Verify command file syntax
  3. Check console for error messages
  4. Restart bot: npm start

ISSUE: Database errors

Error: SQLite errors
Solution:
  1. Check /data folder permissions
  2. Verify suika.db exists
  3. Check database file is writable

Error: MongoDB connection failed
Solution:
  1. Verify MONGODB_URI format
  2. Check connection string
  3. Test MongoDB server online

ISSUE: Dashboard not loading

Error: Cannot access http://0.0.0.0:5000
Solution:
  1. Check port 5000 is available
  2. Verify config.json settings
  3. Clear browser cache
  4. Restart bot

---

## DOCUMENTATION FILES

README.md
  - This file
  - Complete feature overview
  - Installation and configuration
  - Command reference
  - Troubleshooting guide

SETUP_GUIDE.md
  - Detailed setup instructions
  - Step-by-step installation
  - Configuration examples
  - Development guide

TEST_COMMANDS.md
  - Command test report
  - Verification checklist
  - Performance metrics

COMMAND_BUILDER.md
  - Guide to create new commands
  - Code examples and patterns
  - Best practices

---

## DEPLOYMENT OPTIONS

REPLIT (Free Hosting)

Steps:
1. Fork on GitHub
2. Import to Replit
3. Add bot token to secrets
4. Click Run button
5. Bot starts automatically

Benefits:
- Free hosting
- Always on
- Easy to update
- Built-in terminal

SELF-HOSTED VPS

Steps:
1. Install Node.js on server
2. Clone repository
3. Run npm install
4. Setup systemd service
5. Start and monitor

Requirements:
- Linux server (Ubuntu/Debian)
- Node.js v20+
- Basic terminal knowledge

---

## SUPPORT AND HELP

FOR HELP AND SUPPORT

1. Check this README.md
2. Read SETUP_GUIDE.md
3. Review existing commands in /commands folder
4. Check bot console logs
5. Report bugs with full error messages

COMMUNITY AND LINKS

Main Group: https://t.me/your_main_group
Support Group: https://t.me/your_support_group
Updates Channel: https://t.me/your_updates_channel
GitHub Repository: https://github.com/your-repo

---

## DEVELOPMENT ROADMAP

Future Features:
  - Advanced web dashboard with user management
  - More mini-games and challenges
  - Music streaming integration
  - Enhanced group moderation
  - Advanced user analytics
  - Custom command creation UI
  - Payment integration
  - Automated backup system

---

## CREDITS

Original Creator
  Rento-Bot developers and team

Telegram Conversion
  Gtajisan

Framework
  Telegraf.js team

Database
  SQLite and MongoDB communities

Support
  All contributors and users

---

## LICENSE

Based on original Rento-Bot project.
Modified and maintained by Gtajisan.

Suika Bot is provided as-is for community use.

---

```
================================================================================
                        MADE WITH CARE BY GTAJISAN
================================================================================
                   SUIKA BOT - TRANSFORM YOUR TELEGRAM
                              November 2025
================================================================================
```
