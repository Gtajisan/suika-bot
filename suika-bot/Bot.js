const { Telegraf } = require('telegraf');
const config = require('./loadConfig.js');
const log = require('./logger/log.js');
const console2 = require('./logger/console.js');
const startup = require('./logger/startup.js');
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
    db: { allUserData: [], userModel: null, usersData: null },
    stats: {
        messagesProcessed: 0,
        commandsExecuted: 0,
        activeUsers: 0,
        errorsOccurred: 0,
    }
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
        console2.logo();
        console2.section('INITIALIZATION STARTED');
        
        console2.info('Initializing database...');
        const usersData = await initializeDatabase();
        global.db.usersData = usersData;
        console2.success('Database initialized');
        console2.blank();

        console2.info('Loading commands...');
        await loadCommands();
        console2.success(`Loaded ${global.SuikaBot.commands.size} commands`);

        const categories = {};
        for (const cmd of global.SuikaBot.commands.values()) {
            const cat = cmd.config.category || 'General';
            categories[cat] = (categories[cat] || 0) + 1;
        }
        console2.blank();

        console2.info('Loading event handlers...');
        await loadEvents();
        console2.success('Event handlers loaded');
        console2.blank();

        bot.catch((err, ctx) => {
            console2.error(`Telegraf error: ${err.message}`);
            global.SuikaBot.stats.errorsOccurred++;
        });

        console2.info('Launching bot...');
        bot.launch({
            polling: { timeout: 30, limit: 100, allowed_updates: ['message', 'callback_query', 'edited_message'] }
        });

        const botInfo = await bot.telegram.getMe();
        
        await startup.showStartupMenu(
            {
                botName: 'Suika Bot',
                username: botInfo.username,
                userId: botInfo.id,
            },
            {
                total: global.SuikaBot.commands.size,
                categories: categories,
            },
            {
                type: 'SQLite',
                status: 'Active',
                path: './data/suika.db',
                collections: Object.keys(global.db).length,
            }
        );

    } catch (error) {
        console2.error(`Initialization error: ${error.message}`);
        process.exit(1);
    }
}

process.once('SIGINT', () => {
    console2.warn('Bot is shutting down...');
    bot.stop('SIGINT');
    process.exit(0);
});

process.once('SIGTERM', () => {
    console2.warn('Bot is shutting down...');
    bot.stop('SIGTERM');
    process.exit(0);
});

initialize();
module.exports = bot;
