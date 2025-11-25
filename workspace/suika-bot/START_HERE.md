# 🍈 Welcome to Suika Bot!

**Your Telegram bot is ready to use!** Built by **Gtajisan**

---

## ✅ What's Been Set Up

### ✨ Core Features
- ✅ **Telegram Bot API** - Using official Telegraf library
- ✅ **Modular Commands** - Easy to add/remove commands
- ✅ **Database** - SQLite (automatic) or MongoDB (optional)
- ✅ **Dashboard** - Web interface showing stats
- ✅ **Error Handling** - Automatic logging & notifications
- ✅ **11 Commands** - Economy, info, admin commands

### 🎮 Commands Available

**Economy:**
- `/balance` - Check wallet & bank balance
- `/daily` - Claim daily $500 reward
- `/bank` - Bank information

**Info:**
- `/help` - Show all commands
- `/ping` - Bot latency
- `/botinfo` - Bot statistics
- `/stats` - Your personal stats
- `/myinfo` - Your profile
- `/level` - Your level & experience
- `/uptime` - Bot uptime
- `/leaderboard` - Top users by balance

**Admin:**
- `/admin add <id>` - Add administrator
- `/admin remove <id>` - Remove administrator
- `/admin list` - List all admins

---

## 🚀 Next Steps

### Step 1: Verify Bot is Running ✅
```
✓ Bot is currently RUNNING
✓ Bot username: @roseb_bot
✓ Dashboard ready at http://localhost:3000
```

### Step 2: Test Commands on Telegram
1. Search for **@roseb_bot** on Telegram
2. Send `/help` to see all commands
3. Send `/balance` to check your balance
4. Try other commands!

### Step 3: View Dashboard
- Click the preview button in your Replit project
- Visit `/dashboard` route
- See bot statistics, top users, command list

### Step 4: Customize Bot
- Edit commands in `commands/` folder
- Add new commands following the template
- Bot auto-loads on restart

---

## 📋 Project Structure

```
suika-bot/
├── Bot.js                 # Main bot engine
├── config.json            # Bot settings
├── package.json           # Dependencies
│
├── commands/              # All 11 commands
│   ├── balance.js
│   ├── daily.js
│   ├── help.js
│   ├── ping.js
│   ├── botinfo.js
│   ├── stats.js
│   ├── myinfo.js
│   ├── leaderboard.js
│   ├── level.js
│   ├── uptime.js
│   └── admin.js
│
├── database/              # Data storage
│   ├── sqlite.js         # SQLite (active)
│   ├── usersData.js      # MongoDB (optional)
│   └── models/User.js
│
├── dashboard/             # Web interface
│   ├── app.js
│   ├── routes/
│   ├── views/
│   └── public/css/
│
├── handlers/              # Bot logic
│   ├── loadCommands.js
│   └── loadEvents.js
│
└── logger/                # Logging
    ├── log.js
    └── errorNotifier.js
```

---

## 🔧 Configuration

### Currently Configured
- ✅ **Telegram Bot Token**: Set in Replit Secrets ✓
- ✅ **Database**: SQLite (automatic, no setup needed)
- ✅ **Commands**: All 11 commands loaded
- ✅ **Dashboard**: Running on port 3000

### Optional: Add MongoDB
To use MongoDB instead of SQLite:
1. Get MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add to Replit Secrets: `MONGODB_URI = your_uri_here`
3. Restart bot

### Optional: Set Admin User
To get admin commands:
1. Get your Telegram user ID: https://t.me/username_to_id_bot
2. Add to Replit Secrets: `BOT_ADMIN_ID = your_id_here`
3. Restart bot

---

## 📊 Dashboard Features

Access dashboard at `http://localhost:3000`:

- 📈 **Bot Statistics**
  - Total users
  - Total commands
  - Wallet & bank totals
  
- 🏆 **Leaderboard**
  - Top 10 users by balance
  - User IDs and balances
  
- 🎮 **Command List**
  - All 11 commands
  - Descriptions
  - Categories & aliases
  
- ⚙️ **System Status**
  - Bot uptime
  - Memory usage
  - Platform info
  - Node.js version

---

## 💾 Database Info

### SQLite (Current)
- **File**: `data/suika.db`
- **Setup**: None needed!
- **Perfect for**: Quick start, development
- **User Data**: Wallet, bank, level, experience

### MongoDB (Optional)
- **Setup**: Get URI from MongoDB Atlas
- **Perfect for**: Production, scaling
- **Added to Secrets**: `MONGODB_URI`

---

## 🎮 Try These Commands Now

### 1. Check Balance
```
/balance
```
**Response**: Your wallet, bank, and total

### 2. Claim Daily Reward
```
/daily
```
**Response**: +$500 to your wallet

### 3. View Top Users
```
/leaderboard
```
**Response**: Top 10 users by total balance

### 4. Bot Information
```
/botinfo
```
**Response**: Commands, uptime, memory, version

### 5. View Dashboard
Visit the preview URL and go to `/dashboard`

---

## 🛠️ Adding Your Own Commands

### Template
Create `commands/yourcommand.js`:

```javascript
module.exports = {
    config: {
        name: "yourcommand",
        aliases: ["yc"],
        version: "1.0",
        author: "Your Name",
        countDown: 5,
        description: { en: "What your command does" },
        category: "category"
    },
    langs: {
        en: {
            response: "Your response here with %1 placeholders"
        }
    },
    onStart: async ({ ctx, usersData, getLang, args }) => {
        // Your logic here
        await ctx.replyWithMarkdown(getLang("response", value));
    }
};
```

### Example: Add a `/greet` command
```javascript
module.exports = {
    config: {
        name: "greet",
        aliases: ["hello"],
        description: { en: "Greet the user" },
        category: "fun"
    },
    langs: {
        en: { greeting: "Hello %1! Welcome to Suika Bot 🍈" }
    },
    onStart: async ({ ctx, getLang }) => {
        await ctx.replyWithMarkdown(getLang("greeting", ctx.from.first_name));
    }
};
```

### Then Restart
```bash
npm start
```

Command loads automatically!

---

## 📝 Logs & Debugging

### View Logs
```
logs/bot.log
```

### Common Logs
- `[INFO]` - Normal operations
- `[ERROR]` - Something went wrong
- `[WARN]` - Warning messages
- `[DEBUG]` - Debug info

---

## 🌟 Features Recap

| Feature | Status | Notes |
|---------|--------|-------|
| Telegram API | ✅ Active | Telegraf framework |
| Commands | ✅ 11 Loaded | Modular system |
| Database | ✅ SQLite | Auto fallback |
| Dashboard | ✅ Running | Port 3000 |
| Error Handling | ✅ Active | Automatic logging |
| Admin System | ✅ Ready | Use /admin command |
| User Profiles | ✅ Active | Track stats |
| Leaderboard | ✅ Working | Top users list |

---

## 🆘 Troubleshooting

### Bot not responding?
1. Check Replit workflow is **RUNNING**
2. Verify `TELEGRAM_BOT_TOKEN` in Secrets
3. Check logs in `logs/bot.log`

### Commands not appearing?
1. File must be in `commands/` folder
2. Must have `config.name` property
3. Restart bot: `npm start`

### Dashboard not loading?
1. Check port 3000 is available
2. Bot must be running
3. Use `/dashboard` route

### Database errors?
1. SQLite: Works automatically
2. MongoDB: Check `MONGODB_URI` format
3. Bot continues with SQLite fallback

---

## 📞 Support

- **Developer**: Gtajisan
- **GitHub**: https://github.com/Gtajisan/suika-bot
- **Telegram**: @roseb_bot
- **Documentation**: See `SETUP.md` & `CREDITS.md`

---

## 🎉 You're All Set!

Your Suika Bot is **LIVE** and ready!

**Next: Test it on Telegram or explore the dashboard!**

**Made with ❤️ by Gtajisan**
