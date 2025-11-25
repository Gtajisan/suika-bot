# Suika Bot - Complete Setup Guide

## Installation

```bash
npm install
```

## Configuration

Edit `config.json`:

```json
{
  "telegram": {
    "token": "YOUR_BOT_TOKEN_HERE"
  },
  "dashboard": {
    "title": "Suika Bot",
    "description": "A powerful Telegram bot",
    "groups": {
      "main": "https://t.me/your_main_group",
      "support": "https://t.me/your_support_group",
      "updates": "https://t.me/your_updates_channel"
    },
    "socials": {
      "github": "https://github.com/your-repo",
      "telegram": "https://t.me/your_bot",
      "instagram": "https://instagram.com/...",
      "discord": ""
    }
  }
}
```

## Starting the Bot

```bash
npm start
```

The console will display:
- ASCII logo
- Initialization progress
- 99 commands loading with progress bar
- System information
- Database status
- Ready confirmation

## Dashboard

The dashboard is automatically available at:
```
http://0.0.0.0:5000
```

### Dashboard Features
- Real-time bot statistics
- User leaderboard
- Command catalog
- Community links
- Server information

### API Endpoints
- `GET /api/stats` - Bot statistics
- `GET /api/leaderboard` - Top users
- `GET /api/user/:id` - User data
- `GET /commands` - All commands

## Command Categories

### Admin Commands (13)
- `/admin` - Admin help
- `/eval` - Execute code
- `/shell` - Run shell commands
- `/restart` - Restart bot
- `/update` - Update bot

### Economy Commands (11)
- `/balance` - Check balance
- `/bank` - Bank operations
- `/daily` - Daily reward
- `/work` - Work for coins
- `/transfer` - Send money

### Fun Commands (8)
- `/slap` - Slap someone
- `/hug` - Hug someone
- `/kiss` - Kiss someone
- `/insult` - Insult someone

### Game Commands
- `/tictactoe` - Tic-tac-toe game
- `/quiz` - Quiz game
- `/slot` - Slot machine

### AI Commands (6)
- `/ai` - Chat with AI
- `/aigen` - Generate images
- `/talk` - Talk to bot
- `/gptoss` - GPT responses

### Utility Commands (7)
- `/translate` - Translate text
- `/compile` - Compile code
- `/weather` - Check weather

## Database

SQLite database stored at: `./data/suika.db`

Collections:
- `usersData` - User information
- `economy` - Economy data
- `config` - Configuration

## Development

### Adding a Command

Create file: `commands/mycommand.js`

```javascript
module.exports = {
    config: {
        name: "mycommand",
        aliases: ["alias1", "alias2"],
        description: {
            en: "My command description"
        },
        category: "Category Name",
        countDown: 3
    },
    run: async (msg, args, bot) => {
        // Command logic here
    }
};
```

### Adding an Event

Create file: `events/myevent.js`

```javascript
module.exports = {
    eventName: 'message',
    run: async (ctx) => {
        // Event logic
    }
};
```

## Monitoring

### Check Logs
```bash
cat logs/bot.log
```

### View Status
Command `/status` in Telegram shows:
- Bot information
- Uptime
- User statistics
- Memory usage
- Database status

## Troubleshooting

### Bot won't start
- Check bot token in config.json
- Ensure database file exists
- Check Node.js version (v20+)

### Commands not loading
- Check command file syntax
- Verify category name
- Check console for errors

### Dashboard not working
- Verify port 5000 is available
- Check config.json for dashboard settings
- Clear browser cache

## Performance Tips

- Commands are cached
- Database uses indexes
- Event handlers are optimized
- Memory usage: ~27MB

## Security

- No hardcoded secrets
- Use environment variables for tokens
- Input validation on all commands
- Error handling throughout

## Support

- GitHub: Your repository
- Telegram: Your support group
- Developer: Gtajisan

---

**Version:** 1.0.0
**Last Updated:** November 25, 2025
