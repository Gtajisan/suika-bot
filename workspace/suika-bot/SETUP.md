# Suika Bot - Setup & Configuration Guide

**Developer:** Gtajisan  
**Last Updated:** November 25, 2025

## 🚀 Quick Start

### 1. **Get Telegram Bot Token**
- Open Telegram and search for [@BotFather](https://t.me/BotFather)
- Use `/newbot` command
- Follow the prompts and copy your bot token

### 2. **Configure Bot**
```bash
# In Replit Secrets (click Secrets icon)
TELEGRAM_BOT_TOKEN = your_token_here
```

### 3. **Start Bot**
```bash
npm start
```

Bot will be live on Telegram immediately! 🎉

## 🗄️ Database Options

### Option A: SQLite (Recommended for Quick Start)
- **Automatic**: No setup needed
- **Storage**: Local file (`data/suika.db`)
- **Perfect for**: Development & testing
- **Limitation**: Single instance only

### Option B: MongoDB (For Production)
```bash
# Add to Replit Secrets
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/suika
```
- **Cloud-based**: Works anywhere
- **Scalable**: Multiple instances
- **Reliable**: Professional database

## 📡 Dashboard Access

The dashboard runs automatically when the bot starts:
- **Local**: http://localhost:3000
- **Replit Preview**: Available on your project page
- **Features**: 
  - Bot statistics
  - User leaderboard
  - Command list
  - System status

## ⚙️ Environment Variables

All optional - bot works without them:

| Variable | Default | Purpose |
|----------|---------|---------|
| `TELEGRAM_BOT_TOKEN` | - | Bot token (REQUIRED) |
| `MONGODB_URI` | Empty | MongoDB connection |
| `BOT_PREFIX` | `/` | Command prefix |
| `BOT_TIMEZONE` | `Asia/Kathmandu` | Bot timezone |
| `BOT_ADMIN_ID` | Empty | Admin user ID |

## 🔧 Configuration File (`config.json`)

```json
{
  "telegram": {
    "token": ""
  },
  "database": {
    "mongodbUri": ""
  },
  "bot": {
    "prefix": "/",
    "timezone": "Asia/Kathmandu",
    "defaultLang": "en",
    "adminBot": []
  }
}
```

## 📝 Adding New Commands

**Step 1:** Create file in `commands/` folder
```bash
commands/mycommand.js
```

**Step 2:** Use this template:
```javascript
module.exports = {
    config: {
        name: "mycommand",
        aliases: ["mc"],
        version: "1.0",
        author: "Your Name",
        countDown: 5,
        role: 0,
        description: { en: "Command description" },
        category: "category_name"
    },
    
    langs: {
        en: {
            message: "Response message with %1 placeholders"
        }
    },
    
    onStart: async ({ ctx, usersData, getLang, args }) => {
        // Your command logic here
        await ctx.replyWithMarkdown(getLang("message", value));
    }
};
```

**Step 3:** Restart bot - command loads automatically!

## 🧪 Testing Commands

### Test Balance Command
```
/balance
```
Should show wallet and bank balance

### Test Help Command
```
/help
```
Should show all available commands

### Test Bot Info
```
/botinfo
```
Should display bot statistics

## 🐛 Troubleshooting

### Bot not responding?
1. Check Replit Secrets has `TELEGRAM_BOT_TOKEN`
2. Verify token is correct from BotFather
3. Check workflow is running (should say "RUNNING")
4. Look at logs for errors

### Database connection error?
- SQLite: Ignore - fallback is active
- MongoDB: Check `MONGODB_URI` format
- Bot works without MongoDB using SQLite

### Commands not loading?
1. Check file is in `commands/` folder
2. Verify `config.name` exists in module
3. Restart bot with `npm start`
4. Check logs for errors

### Dashboard not accessible?
1. Dashboard runs on port 3000 (automatic)
2. Should appear in Replit preview
3. Check if port 3000 is blocked

## 📊 Useful MongoDB Connection Strings

**MongoDB Atlas** (Cloud):
```
mongodb+srv://username:password@cluster.mongodb.net/suika?retryWrites=true&w=majority
```

Get from: https://www.mongodb.com/cloud/atlas

## 📚 File Structure

```
suika-bot/
├── Bot.js                 # Main bot entry point
├── loadConfig.js          # Config loader
├── package.json           # Dependencies
├── config.json            # Bot configuration
│
├── commands/              # All bot commands
│   ├── balance.js
│   ├── daily.js
│   └── ... (more commands)
│
├── handlers/              # Bot logic
│   ├── loadCommands.js
│   └── loadEvents.js
│
├── database/              # Database layer
│   ├── index.js
│   ├── sqlite.js
│   ├── usersData.js
│   └── models/User.js
│
├── dashboard/             # Web dashboard
│   ├── app.js
│   ├── routes/
│   ├── views/
│   └── public/css/
│
└── logger/                # Logging system
    ├── log.js
    └── errorNotifier.js
```

## 🚨 Important Notes

- **Never commit secrets**: Don't put bot token in git
- **Use Replit Secrets**: All sensitive data goes there
- **SQLite file**: Don't modify `data/suika.db` directly
- **Backups**: Export data regularly if important
- **Rate limiting**: Telegram has rate limits, be careful with mass operations

## 🆘 Getting Help

- Check `/help` command in bot
- Review command examples in `commands/` folder
- Check logs: `logs/bot.log`
- See GitHub: https://github.com/Gtajisan/suika-bot

## 📞 Contact

**Developer:** Gtajisan
- GitHub: https://github.com/Gtajisan
- Bot: @suika-bot on Telegram

---

**Happy Coding! 🍈**
