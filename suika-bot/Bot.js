const { Telegraf } = require('telegraf');
const config = require('./loadConfig.js');
const log = require('./logger/log.js');
const errorNotifier = require('./logger/errorNotifier');
const mongoose = require('mongoose');

process.on('unhandledRejection', error => {
    console.error('Unhandled Rejection:', error);
    errorNotifier.notifyError(error, { location: 'Unhandled Rejection', command: 'Global' }).catch(() => {});
});

process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
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

global.client = {
    cache: {},
    database: {
        creatingUserData: []
    }
};

global.temp = {
    createUserData: []
};

// Connect to MongoDB
async function connectDatabase() {
    try {
        await mongoose.connect(config.database.mongodbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        log.info('Connected to MongoDB');
        return true;
    } catch (error) {
        log.error(`MongoDB Connection Error: ${error.message}`);
        return false;
    }
}

// Load handlers and commands
const loadCommands = require('./handlers/loadCommands.js');
const loadEvents = require('./handlers/loadEvents.js');

async function initialize() {
    try {
        log.info('Initializing Suika Bot...');
        
        // Connect to database
        const dbConnected = await connectDatabase();
        if (!dbConnected) {
            log.warn('Continuing without database connection');
        }

        // Load commands
        await loadCommands();
        log.info(`Loaded ${global.SuikaBot.commands.size} commands`);

        // Load events
        await loadEvents();

        // Setup error handler
        bot.catch((err, ctx) => {
            log.error(`Telegraf error: ${err}`);
            errorNotifier.notifyError(err, { 
                location: 'Telegraf Handler',
                userId: ctx?.from?.id,
                chatId: ctx?.chat?.id
            }).catch(() => {});
        });

        // Launch bot
        bot.launch({
            polling: {
                timeout: 30,
                limit: 100,
                allowed_updates: ['message', 'callback_query', 'inline_query']
            }
        });

        log.info('✅ Suika Bot started successfully!');
        log.info(`Bot username: @${(await bot.telegram.getMe()).username}`);

    } catch (error) {
        log.error(`Initialization error: ${error.message}`);
        process.exit(1);
    }
}

// Graceful shutdown
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
