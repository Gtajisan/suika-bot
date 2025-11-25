# Suika Bot - Project Documentation

**Last Updated:** November 25, 2025  
**Developer:** Gtajisan  
**Project Status:** ✅ Active and Running

## 🍈 Project Overview

**Suika Bot** is a powerful Telegram bot with a modular command structure, built from Rento-Bot architecture but adapted entirely for Telegram API using Telegraf.

### Key Information
- **Platform:** Telegram
- **Language:** JavaScript (Node.js)
- **Framework:** Telegraf (Official Telegram Bot API)
- **Database:** MongoDB (optional) + SQLite (built-in fallback)
- **Architecture:** Modular command-based system

## 📊 Current Status

- ✅ Bot is running and connected to Telegram
- ✅ SQLite database is active
- ✅ Commands loader working
- ✅ Event handlers initialized
- ✅ Error logging and notifications active

## 🛠️ Tech Stack

- **Telegraf**: Official Telegram Bot framework
- **Mongoose**: MongoDB ODM (optional)
- **better-sqlite3**: SQLite database
- **Axios**: HTTP requests
- **dotenv**: Environment variables
- **bcryptjs**: Password hashing
- **moment-timezone**: Timezone support

## 📁 Project Structure

```
suika-bot/
├── Bot.js                    # Main bot instance
├── index.js                  # Entry point
├── loadConfig.js             # Configuration loader
├── config.json               # Config file
├── package.json              # Dependencies
├── utils.js                  # Utility functions
├── logger/
│   ├── log.js               # Logging system
│   └── errorNotifier.js     # Error notifications
├── handlers/
│   ├── loadCommands.js      # Command loader
│   └── loadEvents.js        # Event handler setup
├── commands/
│   ├── balance.js           # Check balance
│   ├── daily.js             # Daily reward
│   ├── bank.js              # Bank info
│   ├── stats.js             # User statistics
│   ├── botinfo.js           # Bot information
│   ├── admin.js             # Admin commands
│   ├── myinfo.js            # User profile
│   └── leaderboard.js       # Top users
└── database/
    ├── index.js             # Database initialization
    ├── models/User.js       # User schema
    ├── usersData.js         # MongoDB data layer
    └── sqlite.js            # SQLite data layer
```

## 🚀 Features Implemented

### Economy System
- `/balance` - Check wallet and bank balance
- `/daily` - Claim daily reward
- `/bank` - View bank information
- `/stats` - Personal statistics

### Information Commands
- `/ping` - Check bot latency
- `/botinfo` - Bot statistics and info
- `/myinfo` - User profile information
- `/leaderboard` - Top 10 users by balance
- `/help` - Show all commands

### Admin Commands
- `/admin add` - Add bot administrator
- `/admin remove` - Remove administrator
- `/admin list` - List all administrators

## 🔧 Configuration

### Environment Variables
- `TELEGRAM_BOT_TOKEN` - Telegram bot token (required)
- `MONGODB_URI` - MongoDB connection (optional)
- `BOT_PREFIX` - Command prefix (default: /)
- `BOT_TIMEZONE` - Bot timezone (default: Asia/Kathmandu)
- `BOT_ADMIN_ID` - Admin user ID

### Database Configuration

**MongoDB** (if provided):
- Automatic connection if MONGODB_URI is set
- Mongoose-based ORM

**SQLite** (fallback):
- Automatically used if MongoDB unavailable
- Stored in `/data/suika.db`
- No setup required

## 📝 Command Structure

Each command follows this structure:

```javascript
module.exports = {
    config: {
        name: "command_name",
        aliases: ["alias1", "alias2"],
        version: "1.0",
        author: "Developer Name",
        countDown: 5,        // Cooldown in seconds
        description: { en: "Description" },
        category: "category" // economy, info, admin, etc
    },
    langs: {
        en: {
            messageKey: "Message with %1 placeholders"
        }
    },
    onStart: async ({ ctx, usersData, getLang, args }) => {
        // Command logic
    }
};
```

## 🎯 Development Workflow

### Adding New Commands

1. Create file in `commands/` folder
2. Follow the command structure above
3. Use existing commands as reference
4. Commands auto-load on bot restart

### Database Access

```javascript
// Get user data
const userData = await usersData.get(userId);

// Update user data
await usersData.set(userId, { money: 1000, bank: 500 });

// Get all users
const allUsers = await usersData.getAll();
```

## 🔐 Error Handling

- Automatic error logging to `logs/bot.log`
- Admin notifications for critical errors
- Graceful error messages to users
- Process restart on fatal errors

## 📦 Dependencies

All dependencies are listed in `package.json` and installed via `npm install`.

### Core Dependencies
- `telegraf@^4.12.2` - Telegram Bot API
- `mongoose@^8.19.2` - MongoDB (optional)
- `better-sqlite3@^9.2.2` - SQLite
- `dotenv@^16.6.1` - Env variables
- `axios@^1.12.2` - HTTP client

## 🚦 Running the Bot

```bash
# Install dependencies
npm install

# Set environment variables (create .env file)
TELEGRAM_BOT_TOKEN=your_token_here
MONGODB_URI=your_mongodb_uri_here  # Optional

# Start the bot
npm start
```

## 📜 Credits & Attribution

- **Developer:** Gtajisan
- **Platform:** Telegram API via Telegraf
- **Original Architecture:** Based on Rento-Bot
- **Technologies:** Node.js, Telegraf, SQLite, MongoDB

## 📄 License

MIT License - See LICENSE file

## 🔗 Useful Links

- [Telegram Bot API Docs](https://core.telegram.org/bots)
- [Telegraf Documentation](https://telegraf.js.org/)
- [Mongoose Docs](https://mongoosejs.com/)
- [SQLite Docs](https://www.sqlite.org/docs.html)

---

**Maintained by:** Gtajisan  
**Last Modified:** November 25, 2025
