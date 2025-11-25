# Suika Bot 🍈

**A powerful Telegram bot with modular command structure and database integration**

## Project Information

- **Bot Name:** Suika Bot
- **Platform:** Telegram
- **Developer:** [Gtajisan](https://github.com/Gtajisan)
- **Version:** 1.0.0
- **License:** MIT

## Features

✨ **Modular Architecture** - Easy to add and manage commands
💰 **Economy System** - User balance, wallet, and bank management
📊 **User Statistics** - Track user data with MongoDB
⚡ **Fast & Reliable** - Built with Telegraf official Telegram API
🛡️ **Error Handling** - Comprehensive error logging and notification
🔧 **Customizable** - Easy configuration via .env and config.json

## Installation

### Prerequisites
- Node.js 16.x or higher
- MongoDB URI
- Telegram Bot Token

### Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/Gtajisan/suika-bot.git
cd suika-bot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Configure your environment:**
Edit `.env` and add:
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from BotFather
- `MONGODB_URI` - Your MongoDB connection string
- `BOT_ADMIN_ID` - Your Telegram user ID (for admin notifications)

5. **Start the bot:**
```bash
npm start
```

## Configuration

Edit `config.json` to customize:
- Bot prefix
- Timezone
- Admin users
- Database settings

## Commands

### Economy Commands
- `/balance` - Check your balance
- `/daily` - Claim daily reward
- `/bank` - View bank information

### Info Commands
- `/ping` - Check bot latency
- `/stats` - View bot statistics
- `/botinfo` - Bot information
- `/help` - Show all commands

### Admin Commands
- `/reload` - Reload all commands
- `/status` - Check bot status

## Project Structure

```
suika-bot/
├── Bot.js                 # Main bot instance
├── index.js              # Entry point
├── config.json           # Configuration file
├── package.json          # Dependencies
├── loadConfig.js         # Config loader
├── utils.js              # Utility functions
├── commands/             # Command files
│   └── balance.js        # Economy commands
├── handlers/             # Event and command handlers
│   ├── loadCommands.js
│   └── loadEvents.js
├── database/             # Database related
│   ├── models/
│   │   └── User.js
│   └── usersData.js
└── logger/               # Logging
    ├── log.js
    └── errorNotifier.js
```

## Credits

This project is built with modern technologies and is maintained by **Gtajisan**. See [CREDITS.md](./CREDITS.md) for full attribution.

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please contact the developer or create an issue on GitHub.

---

**Made with ❤️ by Gtajisan**
