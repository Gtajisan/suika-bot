# 🍈 SUIKA BOT - TELEGRAM

<div align="center">

### Advanced Telegram Bot with 99+ Commands
**Economy • Games • Admin Tools • AI Features • Multi-Language**

![Suika Bot](https://img.shields.io/badge/Suika%20Bot-1.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge)
![Telegraf](https://img.shields.io/badge/Telegraf-Latest-blue?style=for-the-badge)
![SQLite](https://img.shields.io/badge/Database-SQLite-yellow?style=for-the-badge)

</div>

---

## ✨ Key Features

### 💰 Economy System
- Wallet & Bank Management
- Daily Rewards & Work
- Steal & Rob System
- Money Transfer
- Shop & Inventory
- Leaderboard Rankings

### 🎮 Games & Entertainment  
- Tic-Tac-Toe Games
- Quiz Challenges
- Slot Machines
- Pair Matching
- Number Guessing
- Anime Showcase

### 🤖 AI & Advanced Features
- AI Chat Integration
- Image Generation (5+ models)
- Code Compilation
- Text Translation
- GitHub Info Lookup
- Weather Forecasts

### 👨‍💼 Admin & Moderation
- User Management (Ban/Kick/Mute)
- Group Moderation Tools
- Warning System
- Slowmode Control
- Message Clearing
- Permission Levels

### 📊 Analytics & Stats
- User Leaderboard
- Profile Statistics
- Experience Tracking
- Game Results
- User History
- Real-Time Dashboard

---

## 🚀 Quick Start

### 1️⃣ Prerequisites
```bash
Node.js v20+ required
npm (included with Node.js)
```

### 2️⃣ Installation
```bash
# Clone project
git clone https://github.com/yourusername/suika-bot.git
cd suika-bot

# Install dependencies
npm install
```

### 3️⃣ Configure
Edit `config.json`:
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

### 4️⃣ Run Bot
```bash
npm start
```

Console Output:
```
╔════════════════════════════════════╗
║    SUIKA BOT - TELEGRAM           ║
║  Powerful Moderation & Games      ║
╚════════════════════════════════════╝

[BOT INFORMATION]
- Bot Name: Suika Bot
- Framework: Telegraf.js
- Commands: 99 Loaded

[COMMANDS LOADED]
[████████████████████████████] 100%

[DATABASE STATUS]
- Type: SQLite
- Status: Active
- Collections: 3

[DONE] Suika Bot is ready!
Dashboard: http://0.0.0.0:5000
```

---

## 📋 Command List (99 Commands)

### 💰 Economy (11 Commands)
```
/balance       Check wallet & bank
/daily         Claim daily reward  
/work          Work and earn coins
/rob @user     Rob another user
/bank          Bank operations
/transfer      Send money
/shop          Buy items
/inventory     View items
/leaderboard   Top users
/stats         Your statistics
/user @user    User profile
```

### 🎮 Games (15 Commands)
```
/tictactoe     Play tic-tac-toe
/quiz          Answer questions
/slot          Slot machine
/pair          Memory game
/guess         Number guessing
/hug @user     Hug someone
/kiss @user    Kiss someone
/slap @user    Slap someone
/neko          Cat pictures
/meme          Meme images
/anime         Anime search
/movie         Movie search
/pet           Pet interaction
```

### 🤖 AI & Tech (12 Commands)
```
/ai            Chat with AI
/aigen         Generate images
/github        GitHub profile
/upscale       Image upscaling
/compile       Code compilation
/talk          Talk to bot
/translate     Text translation
/weather       Weather info
/wiki          Wikipedia search
/news          Latest news
/spotify       Spotify track
/tiktok        TikTok video
```

### 👨‍💼 Admin (13 Commands)
```
/kick @user    Remove user
/ban @user     Ban user
/mute @user    Mute user
/warn @user    Warn user
/clear         Delete messages
/slowmode      Set slowmode
/admin         Manage admins
/lock          Lock chat
/unlock        Unlock chat
/pin           Pin message
/unpin         Unpin message
/announce      Make announcement
```

### ⚙️ Settings (8 Commands)
```
/config        View settings
/setprefix     Change prefix
/setlang       Set language
/notification  Toggle notifications
/setcoin       Set user money
/setexp        Set user XP
/reset         Reset user data
/help          Show help
```

### 🔧 Owner Commands (20+)
```
/eval          Execute code
/shell         Shell commands
/restart       Restart bot
/update        Update bot
/botinfo       Bot information
/ping          Check latency
/status        Full status
/myinfo        Your profile
/uptime        Bot uptime
And 10+ more...
```

---

## 📊 Web Dashboard

Access at: `http://0.0.0.0:5000`

### Dashboard Features
✅ Real-time statistics  
✅ User leaderboard  
✅ Command browser  
✅ Community links  
✅ Responsive design  
✅ Fast & lightweight  

### Routes
| URL | Purpose |
|-----|---------|
| `/` | Home page |
| `/dashboard` | Main stats |
| `/commands` | All commands |
| `/features` | Features list |
| `/api/stats` | JSON stats |
| `/api/leaderboard` | Top users |

---

## 🗂️ Project Structure

```
suika-bot/
├── commands/               (99 command files)
├── dashboard/              (Web interface)
│   ├── routes/            (14 route files)
│   ├── views/             (14 EJS templates)
│   └── public/            (CSS/JS assets)
├── database/
│   ├── sqlite.js          (SQLite driver)
│   └── models/            (Data models)
├── handlers/
│   ├── loadCommands.js
│   └── loadEvents.js
├── logger/
│   ├── console.js         (Advanced console)
│   ├── startup.js
│   └── log.js
├── Bot.js                 (Main bot)
├── index.js               (Entry point)
├── config.json            (Configuration)
└── README.md              (This file)
```

---

## 💾 Database

### SQLite (Default)
- File-based at `/data/suika.db`
- No setup required
- Fast & reliable
- ACID compliant

### User Schema
```javascript
{
  telegramId,    // User ID (Primary key)
  firstName,     // First name
  lastName,      // Last name
  username,      // Telegram username
  money,         // Wallet balance
  bank,          // Bank balance
  level,         // User level
  experience,    // User XP
  lastDaily,     // Last daily claim
  createdAt,     // Creation timestamp
  updatedAt      // Update timestamp
}
```

### MongoDB (Optional)
```bash
# Set in config.json:
{
  "database": {
    "mongodbUri": "mongodb+srv://user:pass@cluster..."
  }
}
```

---

## ⚙️ Configuration

### config.json
```json
{
  "telegram": {
    "token": "YOUR_BOT_TOKEN"
  },
  "bot": {
    "prefix": "/",
    "timezone": "Asia/Kathmandu",
    "defaultLang": "en",
    "adminBot": [123456789]
  },
  "dashboard": {
    "title": "Suika Bot",
    "groups": {
      "main": "https://t.me/your_group",
      "support": "https://t.me/your_support",
      "updates": "https://t.me/your_updates"
    },
    "socials": {
      "github": "https://github.com/...",
      "telegram": "https://t.me/...",
      "instagram": "",
      "discord": ""
    }
  }
}
```

### Environment Variables
```bash
TELEGRAM_BOT_TOKEN    # Bot token (required)
MONGODB_URI          # MongoDB URI (optional)
BOT_PREFIX           # Command prefix (default: /)
DASHBOARD_PORT       # Port (default: 5000)
```

---

## 🎯 Creating Commands

### Command Template
```javascript
module.exports = {
    config: {
        name: "mycommand",
        aliases: ["alias1", "alias2"],
        description: { en: "My command" },
        category: "fun",
        countDown: 3
    },
    run: async (msg, args, bot) => {
        return msg.reply("Hello!");
    }
};
```

### Add Command
1. Save as `commands/mycommand.js`
2. Restart bot: `npm start`
3. Done! Automatically loaded.

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Commands Loaded | 99 |
| Load Time | <100ms |
| Response Time | <500ms |
| Memory Usage | ~27MB |
| Database Speed | Instant |
| Max Concurrent Users | Unlimited |

---

## 🔒 Security

✅ Secure token management  
✅ Input validation  
✅ Rate limiting (cooldown)  
✅ Error handling  
✅ Permission verification  
✅ Full logging  

---

## 📖 Documentation

- **README.md** - This file
- **SETUP_GUIDE.md** - Detailed setup
- **DASHBOARD.md** - Dashboard guide
- **TEST_COMMANDS.md** - Test report
- **COMMAND_BUILDER.md** - Build commands

---

## 🐛 Troubleshooting

### Bot won't start
```bash
# Check dependencies
npm install

# Check config
cat config.json

# Run bot
npm start
```

### Commands not loading
```
- Check commands/ folder
- Verify syntax
- Check console errors
- Restart bot
```

### Dashboard errors
```
- Port 5000 in use?
- Check config.json
- Clear browser cache
```

---

## 🚀 Deployment

### Free Hosting (Replit)
1. Fork on GitHub
2. Import to Replit
3. Add bot token to secrets
4. Click Run
5. Done!

### VPS Deployment
1. Install Node.js
2. Clone repo
3. Run `npm install`
4. Setup systemd service
5. Run bot

---

## 👥 Credits

| Role | Name |
|------|------|
| Original Creator | Rento-Bot Team |
| Telegram Conversion | Gtajisan |
| Framework | Telegraf.js |
| Database | SQLite & MongoDB |

---

## 📞 Support

For issues:
1. Check logs: `npm start`
2. Review documentation
3. Check command examples
4. Report with error details

---

<div align="center">

### 🍈 Made with ❤️ by Gtajisan

**Suika Bot - Transform Your Telegram Experience**

[![GitHub](https://img.shields.io/badge/GitHub-View-black?style=flat-square)](https://github.com)
[![Telegram](https://img.shields.io/badge/Telegram-Join-blue?style=flat-square)](https://t.me)

</div>
