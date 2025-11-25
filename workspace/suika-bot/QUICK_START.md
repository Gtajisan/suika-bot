# 🚀 Suika Bot - Quick Start Guide

Get your Telegram bot running in 5 minutes!

---

## 1️⃣ Get Bot Token

1. Open Telegram
2. Search for **@BotFather**
3. Send `/newbot`
4. Follow instructions to name your bot
5. **Copy your token** (looks like: `123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk`)

---

## 2️⃣ Set Up on Replit

### Option A: Fork from GitHub
```bash
git clone https://github.com/Gtajisan/suika-bot.git
cd suika-bot
npm install
```

### Option B: New Replit Project
1. Create new Node.js project
2. Copy files into project
3. Run: `npm install`

---

## 3️⃣ Add Bot Token

1. Click 🔒 **Secrets** in left sidebar
2. Click **Add Secret**
3. Key: `TELEGRAM_BOT_TOKEN`
4. Value: Your token from @BotFather
5. Click **Add Secret**

---

## 4️⃣ Start Bot

```bash
npm start
```

You should see:
```
✅ Suika Bot started successfully!
👤 Bot Username: @your_bot_name
💾 Developer: Gtajisan
📦 Commands: 98
```

---

## 5️⃣ Test Bot

Open Telegram and send to your bot:
```
/start     - Welcome message
/ping      - Bot latency
/help      - All commands
/balance   - Your balance
```

✅ **Done!** Your bot is running! 🎉

---

## 📝 Quick Commands

### Economy
- `/balance` - Check wallet & bank
- `/daily` - Claim daily reward  
- `/work` - Earn money
- `/transfer @user 100` - Send money

### AI Features (New!)
- `/ai tell me a joke` - Chat with AI
- `/aigen flux-v3 cyberpunk` - Generate image
- `/github torvalds` - GitHub user info
- `/upscale [reply]` - Enhance image

### Games
- `/tictactoe` - Play tic-tac-toe
- `/quiz` - Answer questions
- `/slot` - Slot machine

### Info
- `/ping` - Bot latency
- `/stats` - Your statistics
- `/leaderboard` - Top users
- `/help` - All commands

---

## 🔧 Configuration (Optional)

Edit `config.json`:

```json
{
  "telegram": {
    "token": "your-token"
  },
  "bot": {
    "prefix": "/",
    "defaultLang": "en",
    "timezone": "UTC"
  }
}
```

---

## 🆘 Troubleshooting

### Bot won't start
```bash
npm install
npm start
```

### Missing token error
- Go to Replit Secrets (🔒)
- Add `TELEGRAM_BOT_TOKEN`
- Restart bot

### Commands not working
- Send `/help` to see all commands
- Check bot logs for errors
- Send `/ping` to verify bot is running

---

## 📚 Learn More

- **Create Commands:** Read `COMMAND_BUILDER.md`
- **Full Setup:** Read `INSTALLATION.md`
- **System Status:** Read `BOT_STATUS.md`

---

**Bot is ready! Enjoy! 🍈**
