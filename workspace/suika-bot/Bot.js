const { Telegraf } = require('telegraf');
const config = require('./loadConfig.js');
const log = require('./logger/log.js');
const errorNotifier = require('./logger/errorNotifier');

const initializeDatabase = require('./database/index.js').initializeDatabase;

process.on('unhandledRejection', error => log.error('Unhandled Rejection: ' + error.message));
process.on('uncaughtException', error => log.error('Uncaught Exception: ' + error.message));

const bot = new Telegraf(config.telegram.token);

global.SuikaBot = {
    startTime: Date.now(),
    commands: new Map(),
    aliases: new Map(),
    config,
    bot,
    db: { allUserData: [], userModel: null, usersData: null }
};

global.utils = require("./utils.js");
global.db = global.SuikaBot.db;
global.client = { cache: {}, database: { creatingUserData: [] } };
global.temp = { createUserData: [] };

errorNotifier.initialize(bot, config);

const loadCommands = require('./handlers/loadCommands.js');
const loadEvents = require('./handlers/loadEvents.js');

async function initialize() {
    try {
        console.log('\x1b[36m%s\x1b[0m', '🍈 Initializing Suika Bot...');
        
        const usersData = await initializeDatabase();
        global.db.usersData = usersData;

        await loadCommands();
        log.info(`✅ Loaded ${global.SuikaBot.commands.size} commands`);

        await loadEvents();

        bot.catch((err, ctx) => log.error(`Telegraf error: ${err.message}`));

        bot.launch({
            polling: { timeout: 30, limit: 100, allowed_updates: ['message', 'callback_query', 'edited_message'] }
        });

        const botInfo = await bot.telegram.getMe();
        console.log('\x1b[32m%s\x1b[0m', `✅ Suika Bot started successfully!`);
        console.log('\x1b[33m%s\x1b[0m', `👤 Bot Username: @${botInfo.username}`);
        console.log('\x1b[33m%s\x1b[0m', `💾 Developer: Gtajisan`);
        console.log('\x1b[33m%s\x1b[0m', `📦 Commands: ${global.SuikaBot.commands.size}`);
        console.log('\x1b[36m%s\x1b[0m', `━━━━━━━━━━━━━━━━━━━━━━━━`);
    } catch (error) {
        log.error(`Initialization error: ${error.message}`);
        process.exit(1);
    }
}

process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });

initialize();
module.exports = bot;
