# SUIKA BOT - DEPLOYMENT GUIDE

## What is Suika Bot?

Suika Bot is a complete conversion of the Rento-Bot Discord bot to Telegram using Telegraf.js framework.

## Features

- **100 Commands** - Economy, games, admin tools, AI features
- **15 Event Handlers** - Member tracking, message logging, bot status
- **SQLite Database** - User profiles, economy data, configuration
- **Web Dashboard** - Real-time statistics, command browser
- **Multi-Language** - English and Nepali support

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Bot
Edit `config.json`:
```json
{
  "telegram": {
    "token": "YOUR_BOT_TOKEN_FROM_BOTFATHER"
  },
  "dashboard": {
    "groups": {
      "main": "https://t.me/your_group"
    },
    "socials": {
      "github": "https://github.com/your-repo"
    }
  }
}
```

### 3. Start Bot
```bash
npm start
```

## Directory Structure

```
suika-bot/
├── Bot.js                 - Main bot file
├── index.js              - Entry point
├── config.json           - Configuration
├── package.json          - Dependencies
├── README.md             - Full documentation
│
├── commands/             - 100 commands
├── events/               - 4 Telegram events
├── scripts/events/       - 7 event scripts
├── handlers/             - Command/event handlers
├── database/             - SQLite implementation
├── logger/               - Logging system
├── dashboard/            - Web dashboard
└── adapters/             - Compatibility layer
```

## Commands

### Economy
- `/balance` - Check balance
- `/daily` - Daily reward
- `/work` - Work for coins

### Admin
- `/kick @user` - Remove user
- `/ban @user` - Ban user
- `/mute @user` - Mute user

### Games
- `/tictactoe @user` - Play game
- `/quiz` - Quiz challenge
- `/slot 100` - Slot machine

### System
- `/help` - Show commands
- `/ping` - Check latency
- `/status` - Bot status
- `/checkevents` - Event system check

## Events (11 Total)

### Core Events (4)
- **callbackQuery** - Inline button clicks
- **groupMemberJoin** - Member tracking
- **messageDelete** - Message logging
- **newMember** - Bot join/leave

### Script Events (7)
- **ready** - Bot startup
- **guildMemberAdd** - Member joins
- **guildMemberRemove** - Member leaves
- **messageLogger** - Log messages
- **guildCreate** - Bot added
- **mention** - Bot mentions
- **edit** - Message edits

## Dashboard

Access at: `http://0.0.0.0:5000`

Features:
- Real-time statistics
- User leaderboard
- Command browser
- Community links

## Database

**SQLite** (Default)
- Location: `./data/suika.db`
- Auto-initialized on startup

**MongoDB** (Optional)
- Set `MONGODB_URI` environment variable

## Adding Commands

1. Create `commands/mycmd.js`:
```javascript
module.exports = {
    config: {
        name: "mycmd",
        category: "fun",
        description: { en: "My command" }
    },
    langs: {
        en: { msg: "Hello!" }
    },
    onStart: async ({ ctx, getLang }) => {
        ctx.reply(getLang("msg"));
    }
};
```

2. Restart bot: `npm start`
3. Command auto-loads!

## Adding Events

1. Create `events/myevent.js`:
```javascript
module.exports = {
    eventName: 'my_event',
    run: async (ctx) => {
        console.log('Event fired!');
    }
};
```

2. Restart bot: `npm start`
3. Event auto-loads!

## Deployment Options

### Replit (Free)
- Already running
- No setup needed
- Always on

### Heroku
```bash
git push heroku main
```

### VPS
```bash
node index.js
# Or use PM2:
pm2 start index.js --name suika-bot
```

## Support

- See README.md for detailed documentation
- Commands: `/help`
- Events: Check `events/` folder
- Dashboard: http://0.0.0.0:5000

## Credits

- **Original:** Rento-Bot
- **Telegram Conversion:** Gtajisan
- **Framework:** Telegraf.js
- **Database:** SQLite

---

**Status:** Production Ready
**Version:** 1.0.0
**Date:** November 2025
