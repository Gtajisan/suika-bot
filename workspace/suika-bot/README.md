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

## 📸 Preview

> **Hero Section Placeholder**
> ```
> Add screenshot of bot dashboard here
> Dashboard URL: http://your-domain.com
> ```

> **Features Showcase Placeholder**
> ```
> Add bot commands in action screenshots
> Anime-style UI mockups
> Command examples
> ```

---

## ✨ Features Overview

<table align="center">
<tr>
<td align="center" width="33%">

### 💰 Economy System
- Wallet & Bank
- Daily Rewards
- Work Shifts
- Steal & Rob
- Transfer Money
- Shop System

</td>
<td align="center" width="33%">

### 🎮 Games & Fun
- Tic-Tac-Toe
- Quiz Challenges
- Slot Machine
- Pair Matching
- Number Guessing
- And More!

</td>
<td align="center" width="33%">

### 🤖 AI Features
- AI Chat
- Image Generation
- Code Compilation
- Text Translation
- GitHub Info
- And More!

</td>
</tr>
</table>

<table align="center">
<tr>
<td align="center" width="33%">

### 👨‍💼 Admin Tools
- User Management
- Group Moderation
- Ban/Kick/Mute
- Warning System
- Slowmode
- And More!

</td>
<td align="center" width="33%">

### 📊 User Stats
- Leaderboard
- User Profile
- Experience Level
- Rich History
- Statistics
- And More!

</td>
<td align="center" width="33%">

### 🌐 Multi-Language
- English (EN)
- Nepali (NE)
- Easy Extension
- Dynamic Language
- Multi-Region
- And More!

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Step 1: Prerequisites

```bash
# Check Node.js version (v20+)
node --version

# Or install Node.js from https://nodejs.org
```

### Step 2: Installation

```bash
# Clone or download the project
git clone https://github.com/yourusername/suika-bot.git
cd suika-bot

# Install dependencies
npm install
```

### Step 3: Configure Bot

Edit `config.json`:
```json
{
  "telegram": {
    "token": "YOUR_BOT_TOKEN_HERE"
  },
  "dashboard": {
    "title": "Suika Bot",
    "groups": {
      "main": "https://t.me/your_group",
      "support": "https://t.me/your_support"
    }
  }
}
```

### Step 4: Run Bot

```bash
npm start
```

**Output:**
```
╔════════════════════════════════════╗
║    SUIKA BOT - TELEGRAM           ║
║  Powerful Moderation & Games      ║
╚════════════════════════════════════╝

[INITIALIZATION STARTED]
════════════════════════
[INFO] Initializing database...
[DONE] Database initialized
[INFO] Loading commands...
[DONE] Loaded 99 commands
...
[DONE] Suika Bot is ready and operational!
```

---

## 📋 Command Categories (99 Total)

### 💰 Economy Commands (11)

| Command | Usage | Description |
|---------|-------|-------------|
| `/balance` | `/balance` | Check wallet & bank |
| `/daily` | `/daily` | Claim daily reward |
| `/work` | `/work` | Work and earn money |
| `/rob` | `/rob @user` | Rob another user |
| `/bank` | `/bank deposit 100` | Bank operations |
| `/transfer` | `/transfer @user 500` | Send money |
| `/shop` | `/shop` | Buy items |
| `/inventory` | `/inventory` | Your items |
| `/leaderboard` | `/leaderboard` | Top users |
| `/stats` | `/stats` | Your stats |
| `/user` | `/user @user` | User profile |

### 🎮 Games & Fun (15)

| Command | Usage | Description |
|---------|-------|-------------|
| `/tictactoe` | `/tictactoe @user` | Play tic-tac-toe |
| `/quiz` | `/quiz` | Answer questions |
| `/slot` | `/slot 100` | Slot machine |
| `/pair` | `/pair` | Matching game |
| `/guess` | `/guess` | Guess number |
| `/hug` | `/hug @user` | Hug someone |
| `/kiss` | `/kiss @user` | Kiss someone |
| `/slap` | `/slap @user` | Slap someone |
| `/neko` | `/neko` | Cat image |
| `/meme` | `/meme` | Random meme |
| `/anime` | `/anime naruto` | Anime info |
| `/movie` | `/movie` | Movie search |
| `/pet` | `/pet` | Pet interaction |
| `/pair` | `/pair` | Memory game |
| `/insult` | `/insult @user` | Fun insults |

### 🤖 AI & Tech (12)

| Command | Usage | Description |
|---------|-------|-------------|
| `/ai` | `/ai hello` | Chat with AI |
| `/aigen` | `/aigen flux-v3 cat` | Generate images |
| `/github` | `/github torvalds` | GitHub user info |
| `/upscale` | `/upscale 4x` | Image upscaling |
| `/compile` | `/compile` | Compile code |
| `/talk` | `/talk` | Talk to bot |
| `/translate` | `/translate en hi text` | Translate text |
| `/weather` | `/weather london` | Weather info |
| `/wiki` | `/wiki` | Wikipedia search |
| `/news` | `/news` | Latest news |
| `/spotify` | `/spotify` | Spotify track |
| `/tiktok` | `/tiktok` | TikTok video |

### 👨‍💼 Admin Commands (13)

| Command | Usage | Description |
|---------|-------|-------------|
| `/kick` | `/kick @user` | Remove user |
| `/ban` | `/ban @user` | Ban user |
| `/mute` | `/mute @user 5m` | Mute user |
| `/warn` | `/warn @user` | Warn user |
| `/clear` | `/clear 10` | Delete messages |
| `/slowmode` | `/slowmode 5` | Slowmode |
| `/admin` | `/admin add @user` | Manage admins |
| `/onlyadmin` | `/onlyadmin` | Admin only |
| `/unlock` | `/unlock` | Unlock chat |
| `/lock` | `/lock` | Lock chat |
| `/pin` | `/pin` | Pin message |
| `/unpin` | `/unpin` | Unpin message |
| `/announce` | `/announce text` | Make announcement |

### ⚙️ Configuration (8)

| Command | Usage | Description |
|---------|-------|-------------|
| `/config` | `/config` | View config |
| `/setprefix` | `/setprefix !` | Change prefix |
| `/setlang` | `/setlang en` | Set language |
| `/notification` | `/notification on` | Toggle notifications |
| `/setcoin` | `/setcoin @user 1000` | Set user money |
| `/setexp` | `/setexp @user 500` | Set user XP |
| `/reset` | `/reset @user` | Reset user data |
| `/help` | `/help` | Bot help |

### 🔧 Owner/Dev Commands (20+)

| Command | Usage | Description |
|---------|-------|-------------|
| `/eval` | `/eval code` | Execute code |
| `/shell` | `/shell ls -la` | Shell commands |
| `/restart` | `/restart` | Restart bot |
| `/update` | `/update` | Update bot |
| `/clearcache` | `/clearcache` | Clear cache |
| `/botinfo` | `/botinfo` | Bot info |
| `/ping` | `/ping` | Check latency |
| `/uptime` | `/uptime` | Bot uptime |
| `/myinfo` | `/myinfo` | Your profile |
| `/status` | `/status` | Full status |
| And 10+ more... | | |

---

## 📊 Dashboard

### Features
- **Real-Time Statistics** - Live user count, commands, uptime
- **Leaderboard** - Top users by wealth
- **Command Browser** - View all 99 commands
- **Community Links** - Telegram group links
- **Responsive Design** - Works on mobile & desktop
- **Fast & Lightweight** - Optimized performance

### Access Dashboard
```
http://0.0.0.0:5000
```

### Dashboard Routes
| Route | Purpose |
|-------|---------|
| `/` | Home page |
| `/dashboard` | Main dashboard |
| `/commands` | Commands list |
| `/features` | Features |
| `/api/stats` | JSON stats |
| `/api/leaderboard` | Top users |

---

## 🗂️ Project Structure

```
suika-bot/
├── commands/                 # 99 command files
│   ├── balance.js
│   ├── daily.js
│   ├── ai.js
│   └── ... (96 more)
├── dashboard/               # Web dashboard
│   ├── app.js
│   ├── routes/              # 14 route files
│   ├── views/               # 14 EJS templates
│   └── public/css/          # Styling
├── database/
│   ├── index.js             # Database router
│   ├── sqlite.js            # SQLite driver
│   └── models/              # Database models
├── handlers/
│   ├── loadCommands.js      # Command loader
│   └── loadEvents.js        # Event handlers
├── logger/
│   ├── console.js           # Advanced console
│   ├── startup.js           # Startup display
│   └── log.js               # Logger utility
├── Bot.js                   # Main bot file
├── index.js                 # Entry point
├── config.json              # Configuration
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 💾 Database

### SQLite (Default)
- **File-based** - No setup required
- **Fast** - Optimized for speed
- **Local** - Data stored in `/data/suika.db`
- **Reliable** - ACID transactions

### User Data
```javascript
{
  telegramId,      // User ID
  firstName,       // First name
  lastName,        // Last name
  username,        // Telegram username
  money,           // Wallet balance
  bank,            // Bank balance
  level,           // User level
  experience,      // User XP
  lastDaily,       // Last daily claim
  createdAt,       // Account creation
  updatedAt        // Last update
}
```

### MongoDB (Optional)
```bash
# Set in config.json or env:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
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
    "description": "Powerful Telegram Bot",
    "groups": {
      "main": "https://t.me/group",
      "support": "https://t.me/support",
      "updates": "https://t.me/updates"
    },
    "socials": {
      "github": "https://github.com/...",
      "telegram": "https://t.me/...",
      "instagram": "https://instagram.com/...",
      "discord": "https://discord.gg/..."
    }
  }
}
```

### Environment Variables
```bash
TELEGRAM_BOT_TOKEN    # Bot token (required)
MONGODB_URI          # MongoDB connection (optional)
BOT_PREFIX           # Command prefix (default: /)
BOT_TIMEZONE         # Timezone (default: UTC)
DASHBOARD_PORT       # Dashboard port (default: 5000)
```

---

## 🎯 Creating Commands

### Template
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
        // Your code here
        return msg.reply("Hello!");
    }
};
```

### Save & Restart
1. Save as `commands/mycommand.js`
2. Restart bot: `npm start`
3. Command automatically loads!

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Commands Load Time | <100ms |
| Response Time | <500ms |
| Memory Usage | ~27MB |
| Database Speed | Instant |
| Concurrent Users | Unlimited |

---

## 🔒 Security

✅ **Token Security** - Secrets stored safely  
✅ **Input Validation** - All inputs checked  
✅ **Rate Limiting** - Cooldown system  
✅ **Error Handling** - Crashes prevented  
✅ **Permission Check** - Role-based access  
✅ **Logging** - Full audit trail  

---

## 📖 Documentation

- **README.md** - This file
- **SETUP_GUIDE.md** - Detailed setup guide
- **DASHBOARD.md** - Dashboard documentation
- **TEST_COMMANDS.md** - Command test report
- **COMMAND_BUILDER.md** - Build custom commands

---

## 🐛 Troubleshooting

### Bot won't start
```
Error: Cannot find module 'telegraf'
Fix: npm install
```

### Missing bot token
```
Error: Telegram token not found
Fix: Add token to config.json
```

### Commands not loading
```
Error: Commands failed to load
Fix: Check commands/ folder structure
Check for syntax errors in command files
```

### Database errors
```
SQLite: Check /data folder permissions
MongoDB: Verify connection string
```

---

## 🎓 Learning Resources

### Telegraf Documentation
https://telegraf.js.org/

### Command Examples
- See `/commands` folder (99 working examples)
- Check COMMAND_BUILDER.md for detailed guide

### Database Guide
- SQLite: `/database/sqlite.js`
- MongoDB: `/database/usersData.js`

---

## 🤝 Contributing

To contribute:
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

---

## 📜 License

Based on original **Rento-Bot** project.  
Modified and maintained by **Gtajisan**.

---

## 👥 Credits

| Contributor | Role |
|------------|------|
| **Rento-Bot Team** | Original Creator |
| **Gtajisan** | Telegram Conversion |
| **Telegraf.js** | Framework |
| **SQLite Team** | Database |
| **Community** | Support & Ideas |

---

## 🚀 Deployment

### Deploy on Replit (Free)
1. Fork on GitHub
2. Import to Replit
3. Set bot token in secrets
4. Click Run
5. Done! 🎉

### Deploy on VPS
1. Setup Node.js
2. Clone repository
3. Install dependencies
4. Setup systemd service
5. Run and monitor

---

## 📞 Support

For help:
1. Check documentation
2. Review command examples
3. Check logs: `npm start`
4. Report issues with error messages

---

## 🎉 What's New

**v1.0.0 - Official Release**
- 99 commands loaded
- Advanced console output
- Beautiful dashboard
- Complete documentation
- Multi-language support
- SQLite + MongoDB support

---

<div align="center">

### 🍈 Made with ❤️ by Gtajisan

**Suika Bot - Transform Your Telegram Experience**

[GitHub](https://github.com/Gtajisan/suika-bot) • [Telegram](https://t.me/suika_bot) • [Dashboard](#)

![Visitors](https://img.shields.io/badge/Made%20By-Gtajisan-red?style=for-the-badge)

</div>
