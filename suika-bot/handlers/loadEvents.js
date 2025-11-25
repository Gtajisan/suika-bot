const fs = require('fs-extra');
const path = require('path');
const log = require('../logger/log.js');
const { Markup } = require('telegraf');

// Store loaded event handlers
global.SuikaBot = global.SuikaBot || {};
global.SuikaBot.eventCommands = new Map();

async function setupMessageHandler(ctx) {
    try {
        const message = ctx.message;
        if (!message || !message.text) return;

        const text = message.text.trim();
        const args = text.split(/\s+/);
        const commandName = args[0].toLowerCase();

        // Remove prefix if exists
        let command = null;
        if (commandName.startsWith('/')) {
            const cmdKey = commandName.slice(1);
            command = global.SuikaBot.commands.get(cmdKey) || 
                      global.SuikaBot.commands.get(global.SuikaBot.aliases.get(cmdKey));
        }

        if (!command) return;

        // Check cooldown
        const userId = ctx.from.id;
        const cooldownKey = `${userId}-${command.config.name}`;
        
        if (command.config.countDown) {
            const cooldown = global.client.cache[cooldownKey];
            if (cooldown && Date.now() < cooldown) {
                return ctx.reply('Wait: This command is on cooldown. Please try again later.');
            }
            global.client.cache[cooldownKey] = Date.now() + (command.config.countDown * 1000);
        }

        // Execute command
        await command.onStart({
            ctx,
            message,
            args: args.slice(1),
            usersData: global.db.usersData,
            getLang: (key, ...params) => {
                const lang = global.SuikaBot.config.bot.defaultLang || 'en';
                const langData = command.langs[lang] || command.langs['en'];
                let text = langData[key] || key;
                
                params.forEach((param, index) => {
                    text = text.replace(`%${index + 1}`, param);
                });
                
                return text;
            }
        });

    } catch (error) {
        log.error(`Error in message handler: ${error.message}`);
        ctx.reply('Error: An error occurred while processing your command.').catch(err => 
            log.error(`Failed to send error message: ${err.message}`)
        );
    }
}

async function loadCustomEvents() {
    try {
        const eventsPath = path.join(__dirname, '../events');
        
        // Check if events folder exists
        if (!fs.existsSync(eventsPath)) {
            log.warn('Events folder not found, skipping custom event loading');
            return 0;
        }

        const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
        let loadedCount = 0;
        
        const bot = global.SuikaBot.bot;

        for (const file of eventFiles) {
            try {
                const eventModule = require(path.join(eventsPath, file));
                const eventName = eventModule.eventName;

                if (!eventName) {
                    log.warn(`Event file ${file} missing eventName property`);
                    continue;
                }

                // Register event with Telegraf
                if (eventName === 'message' || eventName === 'text') {
                    bot.on(eventName, eventModule.run);
                } else {
                    bot.on(eventName, eventModule.run);
                }

                // Track in event commands map
                global.SuikaBot.eventCommands.set(eventName, eventModule);
                log.info(`Loaded event: ${eventName} from ${file}`);
                loadedCount++;

            } catch (error) {
                log.error(`Failed to load event ${file}: ${error.message}`);
            }
        }

        return loadedCount;
    } catch (error) {
        log.error(`Error loading custom events: ${error.message}`);
        return 0;
    }
}

async function loadEvents() {
    try {
        const bot = global.SuikaBot.bot;

        // Text message handler (command routing)
        bot.on('text', setupMessageHandler);

        // Start command
        bot.start((ctx) => {
            ctx.reply(
                'Welcome to Suika Bot!\n\n' +
                'I am a powerful Telegram bot with many features.\n\n' +
                'Use /help to see all available commands.',
                Markup.keyboard([
                    ['/help', '/balance'],
                    ['/stats', '/ping']
                ]).resize()
            );
        });

        // Help command
        bot.command('help', (ctx) => {
            const helpText = `
Available Commands:

ECONOMY
/balance - Check your balance
/daily - Claim daily reward
/work - Work for coins
/bank - Manage bank account

GAMES
/tictactoe - Play tic-tac-toe
/quiz - Play quiz
/slot - Slot machine

STATS
/stats - Your statistics
/ping - Check bot status
/leaderboard - Top users

INFO
/botinfo - Bot information
/help - Show this help

Type /command_name to use any command
            `.trim();

            ctx.reply(helpText);
        });

        // Ping command
        bot.command('ping', (ctx) => {
            const startTime = Date.now();
            ctx.reply('Pong!').then(() => {
                const endTime = Date.now();
                const latency = endTime - startTime;
                ctx.editMessageText(`Pong! (${latency}ms)`);
            });
        });

        // Load custom events from events folder
        const customEventsCount = await loadCustomEvents();

        log.info(`Event system initialized`);
        log.info(`Builtin events: 3 (text, start, help, ping)`);
        log.info(`Custom events loaded: ${customEventsCount}`);
        
        return true;
    } catch (error) {
        log.error(`Error loading events: ${error.message}`);
        return false;
    }
}

module.exports = loadEvents;
