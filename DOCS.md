
# 📖 RentoBot Documentation

Complete documentation for RentoBot - Advanced Discord Bot

---

## 📑 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Commands Reference](#-commands-reference)
3. [Configuration](#-configuration)
4. [Database Schema](#-database-schema)
5. [Dashboard](#-dashboard)
6. [API Endpoints](#-api-endpoints)
7. [Event System](#-event-system)
8. [Permission System](#-permission-system)
9. [Features Deep Dive](#-features-deep-dive)
10. [Development Guide](#-development-guide)

---

## 🏗️ Architecture Overview

### Project Structure

```
RentoBot/
├── Bot.js                    # Main bot entry point
├── index.js                  # Process manager with auto-restart
├── loadConfig.js             # Configuration loader with environment variables
├── utils.js                  # Global utility functions
│
├── handlers/                 # Command and event handlers
│   ├── loadCommands.js       # Dynamic command loader
│   ├── loadEvents.js         # Event handler loader
│   ├── messageHandler.js     # Message-based command handler
│   ├── interactionHandler.js # Slash command & interaction handler
│   ├── cronJobManager.js     # Scheduled task manager
│   └── helpers/
│       └── interactionContext.js  # Interaction context resolver
│
├── scripts/
│   ├── commands/             # 90+ command files
│   │   ├── assets/           # Command assets (fonts, images, data)
│   │   └── tmp/              # Temporary command data
│   └── events/               # Event handlers (6 files)
│
├── database/
│   ├── models/               # Mongoose schemas
│   │   ├── User.js           # User data model
│   │   ├── Guild.js          # Guild data model
│   │   └── CommandStats.js   # Command statistics model
│   └── controller/           # Database controllers with caching
│       ├── usersData.js
│       ├── guildsData.js
│       └── commandStatsData.js
│
├── dashboard/                # Web dashboard
│   ├── app.js                # Express application
│   ├── routes/               # Dashboard routes
│   ├── views/                # EJS templates
│   ├── middleware/           # Authentication middleware
│   └── public/               # Static assets
│
├── utils/
│   ├── permissions.js        # Permission checking system
│   └── presenceManager.js    # Bot presence/activity manager
│
├── logger/
│   ├── log.js                # Logging utility
│   └── errorNotifier.js      # Error notification to admin channels
│
└── login/
    └── login.js              # Goat-Bot-V2 style startup sequence
```

### Key Design Patterns

1. **Modular Command System**: Each command is a self-contained module with config, handlers, and language support
2. **Database Caching**: In-memory cache for all database operations to reduce MongoDB queries
3. **Event-Driven Architecture**: Centralized event handling with support for message events, interactions, and reactions
4. **Three-Tier Permissions**: User (0), Moderator (1), Bot Admin (2)
5. **Dual Command Support**: Both prefix and slash commands supported simultaneously
6. **Interactive Handlers**: OnReply, OnButton, OnSelectMenu, OnModal for complex interactions

---

## 📚 Commands Reference

### 🎮 Fun & Games (10 commands)

| Command | Description | Usage | Cooldown |
|---------|-------------|-------|----------|
| `quiz` | Multi-category quiz game with 6 categories | `!quiz <category>` | 5s |
| `tictactoe` | Play tic-tac-toe with another user | `!tictactoe @user` | - |
| `slot` | Slot machine gambling game | `!slot <amount>` | 10s |
| `emojimix` | Mix two emojis together | `!emojimix 😀 😎` | - |
| `insult` | Generate random insults | `!insult [@user]` | 5s |
| `hug` | Hug another user with anime GIF | `!hug @user` | - |
| `kiss` | Kiss another user with anime GIF | `!kiss @user` | - |
| `slap` | Slap another user with anime GIF | `!slap @user` | - |
| `pet` | Pet another user with anime GIF | `!pet @user` | - |
| `neko` | Random neko/anime images | `!neko [category]` | - |

**Quiz Categories**: `anime`, `math`, `physics`, `chemistry`, `computer`, `english`

### 💰 Economy System (15 commands)

| Command | Description | Usage | Economy Impact |
|---------|-------------|-------|----------------|
| `balance` | Check your balance | `!balance [@user]` | - |
| `daily` | Claim daily reward | `!daily` | +1000 coins |
| `work` | Work for money | `!work` | +100-500 coins |
| `rob` | Rob another user | `!rob @user <amount>` | ±amount |
| `transfer` | Transfer money | `!transfer @user <amount>` | -amount |
| `bank` | Manage bank account | `!bank deposit/withdraw <amount>` | Move between wallet/bank |
| `shop` | View/buy items | `!shop [buy <item>]` | Varies |
| `inventory` | View your items | `!inventory` | - |
| `setcoin` | Set user coins (Admin) | `!setcoin @user <amount>` | Set coins |
| `leaderboard` | Money leaderboard | `!leaderboard [global]` | - |

**Economy Features**:
- Wallet and bank system with interest
- Item shop with purchasable items
- Rob protection mechanics
- Daily streak bonuses
- Transaction logging

### 📊 Leveling System (5 commands)

| Command | Description | Usage | Features |
|---------|-------------|-------|----------|
| `rankcard` | View rank card | `!rankcard [@user]` | Canvas-based cards |
| `customrankcard` | Customize rank card | `!customrankcard` | Colors, gradients, backgrounds |
| `leaderboard` | XP leaderboard | `!leaderboard xp` | Server/global rankings |
| `setexp` | Set user XP (Admin) | `!setexp @user <amount>` | XP management |
| `level` | Alias for rankcard | `!level [@user]` | - |

**Leveling Features**:
- Message-based XP gain (10-25 XP per message)
- Customizable rank cards with:
  - Custom colors and gradients
  - Custom background images (via ImgBB)
  - Progress bars and level display
- Configurable level-up messages
- Level-up channel option
- Server and global leaderboards

### 🛡️ Moderation (12 commands)

| Command | Description | Usage | Permission Required |
|---------|-------------|-------|-------------------|
| `ban` | Ban a user | `!ban @user [reason]` | Administrator |
| `kick` | Kick a user | `!kick @user [reason]` | Administrator |
| `mute` | Mute a user | `!mute @user <duration> [reason]` | Administrator |
| `warn` | Warn a user | `!warn @user <reason>` | Moderator |
| `clear` | Clear messages | `!clear <amount> [@user]` | Moderator |
| `slowmode` | Set slowmode | `!slowmode <seconds>` | Moderator |
| `badwords` | Manage filter | `!badwords add/remove/list <word>` | Administrator |
| `notification` | Manage notifications | `!notification on/off` | - |

**Moderation Features**:
- Automatic badword filtering with custom word lists
- Mute with duration (e.g., `1h`, `30m`, `1d`)
- Warning system with count tracking
- Bulk message deletion with user filter
- Slowmode management
- Mod action logging

### ⚙️ Configuration (15 commands)

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `setprefix` | Change prefix | `!setprefix <new_prefix>` | Admin |
| `setlang` | Change language | `!setlang <en/np>` | Admin |
| `config` | View/edit settings | `!config [setting] [value]` | Admin |
| `greeting` | Setup welcome/leave | `!greeting [type] [channel]` | Admin |
| `setrankup` | Configure level-ups | `!setrankup <channel/message>` | Admin |
| `onlyadmin` | Admin-only mode | `!onlyadmin on/off` | Bot Admin |
| `onlyadminbox` | Admin-guild mode | `!onlyadminbox on/off` | Bot Admin |
| `guild` | Guild management | `!guild <subcommand>` | Admin |

**Configurable Settings**:
- Bot prefix (default: `!`)
- Language (en, np)
- Welcome/leave messages and channels
- Level-up messages and channels
- Admin-only mode
- Admin-guild restrictions
- Badword filter
- Auto-moderation settings

### 🤖 AI & Automation (3 commands)

| Command | Description | Usage | API |
|---------|-------------|-------|-----|
| `talk` | AI voice chat | `!talk <message>` | Pollinations AI |
| `imagine` | Generate images | `!imagine <prompt>` | AI Image Generation |
| `translate` | Translate text | `!translate <lang> <text>` | Google Translate |
| `gptoss` | Alternative AI chat | `!gptoss <message>` | Custom API |

**Talk Command Features**:
- 🎙️ 6 Voice Models: alloy, echo, fable, onyx, nova, shimmer
- 🔊 High-quality text-to-speech responses
- 🔄 Voice selection dropdown for regeneration
- 💾 Automatic audio cleanup

**Imagine Command Features**:
- 🎨 Generate 4 image variations at once
- 🖼️ 2x2 grid display with numbered selection
- 🔄 Regenerate with same prompt
- 👆 Individual image viewing via buttons
- ⚡ Retry logic with 3 attempts
- 🎯 Powered by advanced AI models

### 📺 Entertainment & Media (12 commands)

| Command | Description | Usage | Features |
|---------|-------------|-------|----------|
| `anilist` | AniList anime/manga search | `!anilist <query>` | Premium dropdowns |
| `anime` | Anime streaming | `!anime <query>` | Multi-server streaming |
| `ytb` / `youtube` | YouTube search | `!ytb <query>` | Rich metadata |
| `spotify` | Spotify track info | `!spotify <query>` | Track details |
| `weather` | Weather information | `!weather <city>` | Current weather |
| `movie` | Movie information | `!movie <title>` | IMDb data |
| `wiki` | Wikipedia search | `!wiki <query>` | Article summaries |
| `hubble` | NASA Hubble images | `!hubble` | Space images |
| `malnews` | MyAnimeList news | `!malnews` | Latest anime news |

**AniList Premium Features**:
- 15+ sub-features (search, top, trending, seasonal, etc.)
- Premium dropdown menu system with 6 sections:
  - 📖 Overview (titles, synopsis, genres, tags)
  - 👥 Characters (up to 25 with links)
  - 🔗 Relations (sequels, prequels)
  - 💡 Recommendations (up to 15 similar titles)
  - 🎨 Staff & Production
  - 📊 Statistics
- Cover images and banner art
- Clickable AniList links
- 10-minute dropdown timeout

### ℹ️ Information (8 commands)

| Command | Description | Usage |
|---------|-------------|-------|
| `help` | Command list | `!help [command/category]` |
| `botinfo` | Bot statistics | `!botinfo` |
| `serverinfo` | Server information | `!serverinfo` |
| `myinfo` | Your user info | `!myinfo` |
| `user` | User information | `!user [@user]` |
| `avatar` | User avatar | `!avatar [@user]` |
| `ping` | Bot latency | `!ping` |
| `uptime` | Bot uptime | `!uptime` |

### 👑 Admin Commands (10 commands)

| Command | Description | Usage | Risk Level |
|---------|-------------|-------|------------|
| `eval` | Execute JavaScript | `!eval <code>` | 🔴 Critical |
| `shell` | Execute shell commands | `!shell <command>` | 🔴 Critical |
| `restart` | Restart bot | `!restart` | 🟡 High |
| `admin` | Bot admin management | `!admin add/remove @user` | 🟡 High |
| `cmd` | Command management | `!cmd load/unload <name>` | 🟡 High |
| `clearcache` | Clear cache | `!clearcache` | 🟢 Low |
| `setpresence` | Set bot presence | `!setpresence <activity>` | 🟢 Low |
| `popularcmd` | Popular commands | `!popularcmd` | 🟢 Low |

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Required Discord Configuration
DISCORD_BOT_TOKEN=your_token_here
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Required Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Bot Settings
BOT_PREFIX=!
BOT_ADMIN_ID=your_user_id
BOT_TIMEZONE=Asia/Kathmandu

# Dashboard Settings
DASHBOARD_PORT=5000
DASHBOARD_SESSION_SECRET=random_secret_here
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=secure_password

# Optional API Keys
GEMINI_API_KEY=your_gemini_key
```

### Config.json Structure

```json
{
  "bot": {
    "prefix": "!",
    "adminBot": ["USER_ID_1", "USER_ID_2"],
    "language": "en",
    "timezone": "Asia/Kathmandu",
    "onlyadmin": false,
    "onlyadminchannel": false,
    "adminChannels": [
      {
        "guildId": "GUILD_ID",
        "channelId": "CHANNEL_ID"
      }
    ],
    "logErrorAdminChannels": true
  },
  "dashboard": {
    "enabled": true,
    "port": 5000,
    "sessionSecret": "your_secret"
  },
  "autoRestart": {
    "enabled": true,
    "time": 86400000
  },
  "presence": {
    "enabled": true,
    "rotation": true,
    "rotationInterval": 5,
    "custom": {
      "name": "with users",
      "type": "playing",
      "status": "online"
    }
  }
}
```

---

## 🗄️ Database Schema

### User Model

```javascript
{
  userID: String,           // Discord user ID
  username: String,         // Discord username
  discriminator: String,    // Discord discriminator
  avatar: String,           // Avatar URL
  
  // Economy
  money: Number,            // Wallet balance
  bank: Number,             // Bank balance
  inventory: [Object],      // Items owned
  
  // Leveling
  exp: Number,              // Experience points
  level: Number,            // Current level
  
  // Custom Rank Card
  customRankCard: {
    bgColor: String,
    progressBarColor: String,
    overlayOpacity: Number,
    backgroundImage: String
  },
  
  // Statistics
  stats: {
    totalMessages: Number,
    totalCommandsUsed: Number,
    commandUsage: Object
  },
  
  // Settings
  settings: {
    language: String,
    sortHelp: String,
    notifications: Boolean
  },
  
  // Moderation
  banned: {
    status: Boolean,
    reason: String,
    by: String,
    time: Date
  },
  warnings: [Object],
  
  // Timestamps
  createdAt: Date,
  lastActive: Date
}
```

### Guild Model

```javascript
{
  guildID: String,          // Discord guild ID
  guildName: String,        // Server name
  prefix: String,           // Custom prefix
  adminIDs: [String],       // Server admin IDs
  
  // Settings
  settings: {
    language: String,
    levelUpEnabled: Boolean,
    levelUpChannel: String,
    welcomeEnabled: Boolean,
    welcomeChannel: String,
    leaveEnabled: Boolean,
    leaveChannel: String
  },
  
  // Data
  data: {
    welcomeMessage: String,
    leaveMessage: String,
    levelUpMessage: String,
    badwords: [String]
  },
  
  // Statistics
  stats: {
    totalMessages: Number,
    totalCommandsUsed: Number,
    memberCount: Number
  },
  
  // Moderation
  banned: {
    status: Boolean,
    reason: String,
    by: String,
    time: Date
  },
  
  // Timestamps
  createdAt: Date,
  joinedAt: Date
}
```

### Command Stats Model

```javascript
{
  commandName: String,      // Command name
  executionCount: Number,   // Total executions
  lastUsed: Date,          // Last execution time
  users: [String]          // User IDs who used it
}
```

---

## 🌐 Dashboard

### Routes

| Route | Description | Authentication |
|-------|-------------|----------------|
| `/` | Home page | Public |
| `/dashboard` | Public dashboard | Public |
| `/commands` | Command list | Public |
| `/features` | Feature overview | Public |
| `/about` | About page | Public |
| `/terms` | Terms of Service | Public |
| `/privacy` | Privacy Policy | Public |
| `/admin` | Admin panel | Required |
| `/admin/users` | User management | Required |
| `/admin/guilds` | Guild management | Required |
| `/admin/commands` | Command stats | Required |
| `/api/*` | API endpoints | Public/Auth varies |

### Authentication

Dashboard uses session-based authentication:
- Username/password from environment variables
- Session stored in memory (express-session)
- 24-hour session duration
- Password hashed with bcryptjs

---

## 🔌 API Endpoints

### Public Endpoints

```
GET  /api/botinfo        - Bot statistics
GET  /api/system         - System information
GET  /api/messages/total - Total messages tracked
GET  /api/commands       - Command list
GET  /api/guilds         - Guild list (basic info)
```

### Admin Endpoints (Requires Authentication)

```
GET  /api/admin/users           - All users
GET  /api/admin/guilds          - All guilds (detailed)
GET  /api/admin/commands/stats  - Command statistics
POST /api/admin/user/ban        - Ban/unban user
POST /api/admin/guild/ban       - Ban/unban guild
```

### Example Response

```json
// GET /api/botinfo
{
  "username": "RentoBot",
  "discriminator": "7106",
  "id": "1234567890",
  "avatar": "https://cdn.discordapp.com/...",
  "guilds": 50,
  "users": 10000,
  "channels": 500,
  "commands": 90,
  "uptime": 86400000,
  "memory": {
    "used": "150 MB",
    "total": "512 MB"
  },
  "topCommands": [
    { "name": "help", "count": 1500 },
    { "name": "rank", "count": 1200 }
  ]
}
```

---

## 🎭 Event System

### Available Events

| Event | File | Trigger | Purpose |
|-------|------|---------|---------|
| `ready` | ready.js | Bot login | Initialize systems |
| `guildCreate` | guildCreate.js | Bot joins server | Setup guild data |
| `guildMemberAdd` | guildMemberAdd.js | User joins | Welcome message |
| `guildMemberRemove` | guildMemberRemove.js | User leaves | Leave message |
| `mention` | mention.js | Bot mentioned | Respond with prefix |
| `messageLogger` | messageLogger.js | Message sent | Advanced logging |

### Creating Custom Events

```javascript
// scripts/events/customEvent.js
module.exports = {
  config: {
    name: "customEvent",
    version: "1.0.0",
    author: "YourName"
  },
  
  // Runs once on bot startup
  onStart({ client }) {
    console.log("Event loaded!");
  },
  
  // Runs on every message (optional)
  onChat({ message, client, guildData, userData }) {
    // Your code here
  }
};
```

---

## 🔒 Permission System

### Permission Levels

| Level | Name | Access | Commands |
|-------|------|--------|----------|
| 0 | User | Everyone | Most commands |
| 1 | Moderator | Server Admins | Moderation commands |
| 2 | Bot Admin | Bot owners | Admin commands |

### Access Control Modes

**Admin-Only Mode** (`onlyadmin`):
- Only bot administrators can use ANY commands
- Useful for maintenance
- DMs always bypass this restriction

**Admin-Guild Mode** (`onlyadminchannel`):
- Commands work in ANY channel of designated admin guilds
- DMs always bypass this restriction
- Configure via `config.json`:

```json
{
  "bot": {
    "onlyadminchannel": true,
    "adminChannels": [
      {
        "guildId": "1075466000857579520",
        "channelId": "1418209431715582064"
      }
    ]
  }
}
```

### Permission Checking

```javascript
// utils/permissions.js
const { canExecuteCommand } = require('./utils/permissions');

const accessCheck = canExecuteCommand({
  userID: message.author.id,
  guildID: message.guildId,
  channelID: message.channelId,
  config: RentoBot.config,
  isDM: !message.guildId
});

if (!accessCheck.allowed) {
  return message.reply(accessCheck.reason);
}
```

---

## 🚀 Features Deep Dive

### Presence Manager

**31+ Dynamic Activities** with real-time stats:

```javascript
// Examples of activities
'{servers} servers | {prefix}help'
'with {users} users'
'{totalCommands} commands executed'
'your messages'
'moderating servers'
```

**Features**:
- Auto-rotation every 5 minutes (configurable)
- Real-time database statistics
- Custom presence support
- Activity type variations (Playing, Watching, Listening, Competing)

### Error Notification System

**Production-Ready Error Logging**:

```javascript
// Automatic error reporting
errorNotifier.notifyError(error, {
  location: 'Command: help',
  command: 'help',
  user: 'User#1234'
});
```

**Features**:
- Rate-limited (max 3 identical errors per 60s)
- Formatted error embeds with stack traces
- Sent to all configured admin channels
- Includes error type, message, location, timestamp
- Non-blocking and gracefully degrades

### Database Caching

**In-Memory Cache** for optimal performance:

```javascript
// Cached operations
await db.usersData.get(userID);        // Returns cached data
await db.usersData.set(userID, data);  // Updates cache + DB
await db.guildsData.get(guildID);      // Returns cached data
```

**Benefits**:
- Reduced MongoDB queries (90%+ reduction)
- Instant data access
- Automatic cache invalidation
- Background synchronization

---

## 💻 Development Guide

### Adding a New Command

1. Create file in `scripts/commands/`:

```javascript
// scripts/commands/mycommand.js
module.exports = {
  config: {
    name: "mycommand",
    aliases: ["mc", "mycmd"],
    version: "1.0.0",
    author: "YourName",
    countDown: 5,
    role: 0, // 0=user, 1=mod, 2=admin
    category: "fun",
    slash: true, // Enable slash command
    description: {
      en: "My custom command"
    },
    guide: {
      en: "Use: {prefix}mycommand [args]"
    }
  },
  
  langs: {
    en: {
      success: "Command executed!"
    }
  },
  
  onStart({ message, args, getLang }) {
    return message.reply(getLang("success"));
  },
  
  // Optional: Slash command handler
  onSlash({ interaction, getLang }) {
    return interaction.reply(getLang("success"));
  }
};
```

2. Restart bot - command auto-loads!

### Interactive Commands

**OnReply Example**:

```javascript
const reply = await message.reply("Reply with 'yes' or 'no'");

global.RentoBot.onReply.set(reply.id, {
  commandName: "mycommand",
  author: message.author.id,
  handler: async ({ message }) => {
    const response = message.content.toLowerCase();
    if (response === 'yes') {
      return message.reply("You said yes!");
    }
  }
});
```

**OnButton Example**:

```javascript
const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('mybutton_confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Success)
  );

const sent = await message.reply({ 
  content: "Click to confirm",
  components: [row]
});

global.RentoBot.onButton.set('mybutton_confirm', async (interaction) => {
  await interaction.reply("Confirmed!");
});
```

### Testing

```bash
# Test specific command
!testevents <command_name>

# Check command status
!cmd status <command_name>

# Reload command
!cmd load <command_name>
```

---

## 📊 Performance Optimization

### Best Practices

1. **Use Database Caching**: Always use `db.usersData.get()` instead of direct queries
2. **Minimize API Calls**: Cache external API responses when possible
3. **Lazy Loading**: Load heavy resources only when needed
4. **Error Handling**: Always wrap async operations in try-catch
5. **Rate Limiting**: Implement cooldowns on heavy commands

### Monitoring

- Dashboard system metrics at `/admin`
- Error logs in admin channels
- Command usage statistics
- Memory and CPU monitoring

---

## 🔧 Troubleshooting

See [STEP_INSTALL.md](STEP_INSTALL.md#-troubleshooting) for detailed troubleshooting guide.

---

## 📞 Support

- **Discord**: [Join support server](https://discord.gg/zYdj9qQX)
- **GitHub**: [Open an issue](https://github.com/notsopreety/DC-Bot/issues)
- **Documentation**: This file and README.md

---

**Last Updated**: 2025
**Version**: 1.0.0
**Author**: Samir Badaila
