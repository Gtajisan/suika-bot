const { Telegraf, Markup, session } = require('telegraf');
const config = require('./loadConfig.js');
const log = require('./logger/log.js');
const errorNotifier = require('./logger/errorNotifier');
const mongoose = require('mongoose');

process.on('unhandledRejection', error => {
    log.error('Unhandled Rejection: ' + error.message);
    errorNotifier.notifyError(error, { location: 'Unhandled Rejection', command: 'Global' }).catch(() => {});
});

process.on('uncaughtException', error => {
    log.error('Uncaught Exception: ' + error.message);
    errorNotifier.notifyError(error, { location: 'Uncaught Exception', command: 'Global' }).catch(() => {});
});

const bot = new Telegraf(config.telegram.token);

global.SuikaBot = {
    startTime: Date.now(),
    commands: new Map(),
    aliases: new Map(),
    config,
    bot,
    db: {
        allUserData: [],
        userModel: null,
        usersData: null
    }
};

global.utils = require("./utils.js");
global.db = global.SuikaBot.db;
global.client = { cache: {}, database: { creatingUserData: [] } };
global.temp = { createUserData: [] };

async function connectDatabase() {
    try {
        await mongoose.connect(config.database.mongodbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        log.info('✅ Connected to MongoDB');
        return true;
    } catch (error) {
        log.error(`MongoDB Connection Error: ${error.message}`);
        return false;
    }
}

const loadCommands = require('./handlers/loadCommands.js');
const loadEvents = require('./handlers/loadEvents.js');

async function initialize() {
    try {
        console.log('\x1b[36m%s\x1b[0m', '🍈 Initializing Suika Bot...');
        
        const dbConnected = await connectDatabase();
        if (!dbConnected) {
            log.warn('⚠️  Continuing without database connection');
        }

        const usersData = require('./database/usersData.js');
        global.db.usersData = usersData;

        await loadCommands();
        log.info(`✅ Loaded ${global.SuikaBot.commands.size} commands`);

        await loadEvents();

        bot.catch((err, ctx) => {
            log.error(`Telegraf error: ${err.message}`);
            errorNotifier.notifyError(err, { 
                location: 'Telegraf Handler',
                userId: ctx?.from?.id,
                chatId: ctx?.chat?.id
            }).catch(() => {});
        });

        bot.launch({
            polling: {
                timeout: 30,
                limit: 100,
                allowed_updates: ['message', 'callback_query', 'edited_message']
            }
        });

        const botInfo = await bot.telegram.getMe();
        console.log('\x1b[32m%s\x1b[0m', `✅ Suika Bot started successfully!`);
        console.log('\x1b[33m%s\x1b[0m', `👤 Bot Username: @${botInfo.username}`);
        console.log('\x1b[33m%s\x1b[0m', `💾 Developer: Gtajisan`);
        console.log('\x1b[36m%s\x1b[0m', `━━━━━━━━━━━━━━━━━━━━━━━━`);

    } catch (error) {
        log.error(`Initialization error: ${error.message}`);
        process.exit(1);
    }
}

process.once('SIGINT', () => {
    log.info('Shutting down gracefully...');
    bot.stop('SIGINT');
    mongoose.disconnect();
    process.exit(0);
});

process.once('SIGTERM', () => {
    log.info('Shutting down gracefully...');
    bot.stop('SIGTERM');
    mongoose.disconnect();
    process.exit(0);
});

initialize();

module.exports = bot;
