require('dotenv').config();
const fs = require('fs');

function loadConfig() {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

    config.discord.token = process.env.DISCORD_BOT_TOKEN || config.discord.token;
    config.discord.clientId = process.env.DISCORD_CLIENT_ID || config.discord.clientId;
    config.discord.clientSecret = process.env.DISCORD_CLIENT_SECRET || config.discord.clientSecret;
    config.database.mongodbUri = process.env.MONGODB_URI || config.database.mongodbUri;
    config.bot.prefix = process.env.BOT_PREFIX || config.bot.prefix;
    config.dashboard.port = parseInt(process.env.DASHBOARD_PORT) || config.dashboard.port;
    config.dashboard.sessionSecret = process.env.DASHBOARD_SESSION_SECRET || config.dashboard.sessionSecret;
    config.dashboard.username = process.env.DASHBOARD_USERNAME || config.dashboard.username || "admin";
    config.dashboard.password = process.env.DASHBOARD_PASSWORD || config.dashboard.password || "admin123";
    config.bot.timezone = process.env.BOT_TIMEZONE || config.bot.timezone || "Asia/Kathmandu";

    if (process.env.BOT_ADMIN_ID) {
        config.bot.adminBot = [process.env.BOT_ADMIN_ID];
    }

    if (!config.discord.token || !config.discord.clientId || !config.database.mongodbUri) {
        console.error('\x1b[31m[ERROR]\x1b[0m Missing required environment variables or config values!');
        console.error('Please set DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, and MONGODB_URI in .env file or Replit Secrets');
        process.exit(1);
    }

    return config;
}

module.exports = loadConfig();
