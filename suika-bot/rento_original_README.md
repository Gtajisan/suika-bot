# 🤖 RentoBot - Advanced Discord Bot

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![Discord.js](https://img.shields.io/badge/discord.js-v14.24.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

![Views](https://count.getloli.com/get/@Rento-Bot?theme=gelbooru)

**A powerful, modular Discord bot inspired by Goat-Bot-V2 with advanced features, economy system, and interactive commands.**

[Features](#-features) • [Installation](#-STEP_INSTALL.md) • [Documentation](DOCS.md) • [Support](#-support)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Support](#-support)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

RentoBot is a production-ready Discord bot built with **Node.js** and **Discord.js v14**, featuring a modular architecture similar to Goat-Bot-V2. It provides a comprehensive suite of features including economy system, leveling, AI integration, anime/manga lookup, music streaming, moderation tools, and an administrative web dashboard.

### Why RentoBot?

- ✅ **Modular Architecture**: Easy to extend and customize
- ✅ **Production-Ready**: Built-in error handling, logging, and monitoring
- ✅ **Database Caching**: Optimized MongoDB operations with in-memory caching
- ✅ **Dual Command Support**: Both prefix and slash commands
- ✅ **Web Dashboard**: Real-time bot management and statistics
- ✅ **Security First**: Environment variables and secure credential management
- ✅ **Auto-Maintenance**: Scheduled restarts and cache clearing

---

## ✨ Features

### 🎮 Core Features

- **Dual Command System**: Support for both prefix (`!command`) and slash commands (`/command`)
- **90+ Commands**: Comprehensive command library covering all major categories
- **6 Event Handlers**: Custom event system for guild and member events
- **Interactive UI**: Buttons, select menus, modals, and pagination
- **OnReply System**: Conversation-based command flows
- **Auto-Detection**: Automatically syncs guild data and member counts

### 💰 Economy & Leveling

- **Complete Economy System**: Bank, daily rewards, work, rob, transfer, shop
- **XP & Leveling**: Message-based XP gain with customizable level-up messages
- **Custom Rank Cards**: Canvas-based rank cards with user personalization
- **Leaderboards**: Global and server-specific leaderboards
- **Inventory System**: Item collection and management

### 🤖 AI & Automation

- **AI Features**:
  - 🎙️ Voice responses with 6 different voice models
  - 🎨 Advanced image generation with 4 variations
  - 🔄 Regeneration and voice selection options
  - 🌐 Multi-language translation support

### 📺 Entertainment & Media

- **AniList Integration**: Search anime/manga with premium dropdown menus
- **Anime Streaming**: Multi-server streaming with Hindi dubbed content
- **YouTube Command**: Rich metadata display and video search
- **Spotify Integration**: Track information and playback
- **Image Generation**: AI-powered image creation
- **Games**: Quiz, Tic-Tac-Toe, Slot machine

### 🛠️ Administration

- **Web Dashboard**: 
  - Real-time bot statistics
  - User and guild management
  - Command analytics
  - System monitoring
  - Authentication system
- **Advanced Permissions**: Three-tier role system (Users, Mods, Admins)
- **Access Control**: 
  - Admin-only mode (restrict bot to admins)
  - Admin-guild mode (restrict to specific servers)
- **Error Notifications**: Automatic error reporting to admin channels
- **Moderation Tools**: Ban, kick, mute, warn, clear messages

### 📊 Analytics & Monitoring

- **Command Statistics**: Track usage of all commands
- **Message Tracking**: Server-wide message counts
- **User Statistics**: Per-user command and message analytics
- **System Metrics**: CPU, memory, uptime monitoring
- **Error Logging**: Production-ready error notification system

---

## 📦 Prerequisites

Before installing RentoBot, ensure you have:

- **Node.js**: Version 20.x or higher
- **MongoDB**: Running instance or MongoDB Atlas account
- **Discord Bot Token**: From [Discord Developer Portal](https://discord.com/developers/applications)
- **Discord Application**: With Message Content Intent enabled
- **Git**: For cloning the repository (optional)

### Required Discord Intents

Enable these intents in Discord Developer Portal > Bot section:
- ✅ Presence Intent
- ✅ Server Members Intent
- ✅ Message Content Intent

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/notsopreety/Rento-Bot.git
cd Rento-Bot
```

### 2. Configure Environment

**Option A: Using config.json (Recommended)**

Edit `config.json` with your credentials:

```json
{
  "discord": {
    "token": "your_discord_bot_token_here",
    "clientId": "your_application_client_id",
    "clientSecret": "your_application_client_secret"
  },
  "database": {
    "mongodbUri": "your_mongodb_connection_string"
  },
  "bot": {
    "prefix": "!",
    "adminBot": ["your_discord_user_id"]
  },
  "dashboard": {
    "enabled": true,
    "port": 5000,
    "sessionSecret": "your_secure_random_secret",
    "username": "admin",
    "password": "your_secure_password"
  }
}
```

**Option B: Using .env file (Optional)**

For additional security, create a `.env` file (environment variables override config.json):

```env
# Discord Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_application_client_id
DISCORD_CLIENT_SECRET=your_application_client_secret

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Bot Configuration
BOT_PREFIX=!
BOT_ADMIN_ID=your_discord_user_id

# Dashboard Configuration (optional)
DASHBOARD_PORT=5000
DASHBOARD_SESSION_SECRET=your_secure_random_secret
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your_secure_password
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Bot

```bash
npm start
```

**🎉 Your bot is now online!** Visit `http://localhost:5000` to access the dashboard.

---

## 📚 Documentation

For detailed documentation, please refer to:

- **[DOCS.md](DOCS.md)**: Complete feature documentation and API reference
- **[STEP_INSTALL.md](STEP_INSTALL.md)**: Detailed step-by-step installation guide
- **[SETUP.md](SETUP.md)**: Environment configuration and security guide

### Quick Links

- [Command List](DOCS.md#-commands-reference)
- [Configuration Guide](DOCS.md#-configuration)
- [Dashboard Guide](DOCS.md#-dashboard)
- [API Documentation](DOCS.md#-api-endpoints)
- [Troubleshooting](STEP_INSTALL.md#-troubleshooting)

---

## 🎯 Command Categories

| Category | Commands | Description |
|----------|----------|-------------|
| 🎮 **Fun** | quiz, tictactoe, slot, emojimix | Interactive games and entertainment |
| 💰 **Economy** | balance, daily, work, rob, shop | Complete economy system |
| 📊 **Leveling** | rank, leaderboard, setexp | XP and ranking system |
| 🛡️ **Moderation** | ban, kick, mute, warn, clear | Server moderation tools |
| ⚙️ **Config** | setprefix, config, greeting | Server configuration |
| 🤖 **AI** | talk, imagine, translate, gptoss | AI-powered features |
| 📺 **Media** | anime, anilist, youtube, spotify | Entertainment search |
| ℹ️ **Info** | help, botinfo, serverinfo, ping | Bot and server information |
| 👑 **Admin** | eval, shell, restart, onlyadmin | Bot administration |

---

## 🔧 Configuration

### Admin-Only Mode

Restrict bot usage to administrators:

```
!onlyadmin on
```

### Admin-Guild Mode

Restrict bot to specific servers (any channel within those servers):

```
!onlyadminbox on
```

Configure admin guilds in `config.json`:

```json
{
  "bot": {
    "onlyadminchannel": true,
    "adminChannels": [
      {
        "guildId": "YOUR_GUILD_ID",
        "channelId": "YOUR_CHANNEL_ID"
      }
    ]
  }
}
```

### Error Notifications

Enable automatic error logging to admin channels:

```json
{
  "bot": {
    "logErrorAdminChannels": true
  }
}
```

---

## 🌐 Dashboard

Access the web dashboard at `http://localhost:5000`:

- **Public Dashboard**: Bot statistics, command list, features
- **Admin Panel**: `/admin` - User management, guild settings, analytics
- **Authentication**: Configured via environment variables

### Dashboard Features

- 📊 Real-time bot statistics
- 👥 User and guild management
- 📈 Command usage analytics
- 💻 System resource monitoring
- 🎨 Modern responsive design
- 📱 Mobile-friendly interface

---

## 🤝 Support

Need help? Here's how to get support:

- **Discord Server**: [Join our support server](https://discord.gg/zYdj9qQX)
- **GitHub Issues**: [Report bugs or request features](https://github.com/notsopreety/Rento-Bot/issues)
- **Documentation**: Check [DOCS.md](DOCS.md) for detailed information

---

## 🛡️ Security

**⚠️ IMPORTANT**: Never commit your `.env` file or expose credentials!

- ✅ Use environment variables for all sensitive data
- ✅ Rotate tokens if accidentally exposed
- ✅ Keep dependencies updated
- ✅ Enable 2FA on Discord account
- ✅ Use secure MongoDB connection strings

See [SETUP.md](SETUP.md) for security best practices.

---

## 🎨 Customization

RentoBot is highly customizable:

- **Commands**: Add new commands in `scripts/commands/`
- **Events**: Create event handlers in `scripts/events/`
- **Dashboard**: Customize views in `dashboard/views/`
- **Presence**: Modify activities in `utils/presenceManager.js`
- **Rank Cards**: Customize design in `scripts/commands/rankcard.js`

---

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [Goat-Bot-V2](https://github.com/ntkhang03/Goat-Bot-V2)
- Built with [Discord.js](https://discord.js.org/)
- Powered by [MongoDB](https://www.mongodb.com/)

---

## 📊 Project Stats

- **90+ Commands**: Comprehensive command library
- **6 Event Handlers**: Custom event system
- **31+ Activities**: Dynamic presence rotation
- **3-Tier Permissions**: Flexible access control
- **Web Dashboard**: Real-time management
- **Production-Ready**: Error handling and monitoring

---

<div align="center">

**Made with ❤️ by Samir Badaila**

[⭐ Star this repo](https://github.com/notsopreety/Rento-Bot) • [🐛 Report Bug](https://github.com/notsopreety/Rento-Bot/issues) • [✨ Request Feature](https://github.com/notsopreety/Rento-Bot/issues)

</div>
