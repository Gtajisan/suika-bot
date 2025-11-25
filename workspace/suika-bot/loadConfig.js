require('dotenv').config();
const fs = require('fs');

function loadConfig() {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

    config.telegram.token = process.env.TELEGRAM_BOT_TOKEN || config.telegram.token;
    config.database.mongodbUri = process.env.MONGODB_URI || config.database.mongodbUri || '';
    config.bot.prefix = process.env.BOT_PREFIX || config.bot.prefix;
    config.bot.timezone = process.env.BOT_TIMEZONE || config.bot.timezone || "Asia/Kathmandu";

    if (process.env.BOT_ADMIN_ID) {
        config.bot.adminBot = [process.env.BOT_ADMIN_ID];
    }

    if (!config.telegram.token) {
        console.error('\x1b[31m[ERROR]\x1b[0m Missing Telegram Bot Token!');
        console.error('Set TELEGRAM_BOT_TOKEN in Replit Secrets');
        process.exit(1);
    }

    return config;
}

module.exports = loadConfig();
