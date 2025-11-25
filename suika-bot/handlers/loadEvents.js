const fs = require('fs-extra');
const path = require('path');
const log = require('../logger/log.js');
const { Markup } = require('telegraf');

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
                return ctx.reply('⏱️ You are using this command too fast. Please wait.');
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
        ctx.reply('❌ An error occurred while processing your command.').catch(err => 
            log.error(`Failed to send error message: ${err.message}`)
        );
    }
}

async function loadEvents() {
    try {
        const bot = global.SuikaBot.bot;

        // Text message handler
        bot.on('text', setupMessageHandler);

        // Start command
        bot.start((ctx) => {
            ctx.reply(
                '👋 Welcome to Suika Bot!\n\n' +
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
📚 **Available Commands:**

💰 Economy
/balance - Check your balance
/daily - Claim daily reward
/bank - View bank info

📊 Info
/ping - Check bot status
/stats - View bot statistics
/botinfo - Bot information

⚙️ Admin
/reload - Reload commands (admin only)
/status - Bot status (admin only)

Type /command to use any command
            `.trim();

            ctx.reply(helpText, { parse_mode: 'Markdown' });
        });

        // Ping command
        bot.command('ping', (ctx) => {
            const startTime = Date.now();
            ctx.reply('🏓 Pong!').then(() => {
                const endTime = Date.now();
                const latency = endTime - startTime;
                ctx.editMessageText(`🏓 Pong! (${latency}ms)`);
            });
        });

        log.info('Event handlers loaded successfully');
        return true;
    } catch (error) {
        log.error(`Error loading events: ${error.message}`);
        return false;
    }
}

module.exports = loadEvents;
