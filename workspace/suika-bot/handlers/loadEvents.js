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
        let commandName = args[0].toLowerCase();

        let command = null;
        if (commandName.startsWith('/')) {
            const cmdKey = commandName.slice(1);
            command = global.SuikaBot.commands.get(cmdKey) || 
                      global.SuikaBot.commands.get(global.SuikaBot.aliases.get(cmdKey));
        }

        if (!command) return;

        const userId = ctx.from.id;
        const cooldownKey = `${userId}-${command.config.name}`;
        
        if (command.config.countDown) {
            const cooldown = global.client.cache[cooldownKey];
            if (cooldown && Date.now() < cooldown) {
                return ctx.reply('⏱️ You are using this command too fast. Please wait.');
            }
            global.client.cache[cooldownKey] = Date.now() + (command.config.countDown * 1000);
        }

        // Ensure command has required methods
        if (!command.onStart) {
            log.error(`Command ${command.config.name} missing onStart method`);
            return ctx.reply('❌ Command not properly configured.');
        }

        const user = await global.db.usersData.get(userId);

        await command.onStart({
            ctx,
            message,
            args: args.slice(1),
            usersData: global.db.usersData,
            bot: global.SuikaBot.bot,
            user,
            getLang: (key, ...params) => {
                const lang = global.SuikaBot.config.bot.defaultLang || 'en';
                const langData = command.langs && command.langs[lang] ? command.langs[lang] : (command.langs && command.langs['en'] ? command.langs['en'] : {});
                let text = langData[key] || key;
                
                params.forEach((param, index) => {
                    text = text.replace(`%${index + 1}`, param);
                });
                
                return text;
            }
        });

    } catch (error) {
        log.error(`Error in message handler: ${error.message}`);
        log.error(`Stack: ${error.stack}`);
        try {
            ctx.reply('❌ An error occurred while processing your command.').catch(err => 
                log.error(`Failed to send error message: ${err.message}`)
            );
        } catch (e) {
            log.error(`Failed to handle error: ${e.message}`);
        }
    }
}

async function loadEvents() {
    try {
        const bot = global.SuikaBot.bot;

        bot.on('text', setupMessageHandler);

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

        bot.command('help', (ctx) => {
            const helpText = `📚 Suika Bot - All Commands (${global.SuikaBot.commands.size} total)

💰 Economy
/balance - Check your balance
/daily - Claim daily reward
/bank - Bank management
/work - Earn money
/rob - Steal from others
/transfer - Send money
/shop - Buy items
/inventory - Check items

📊 Stats & Info
/ping - Bot latency
/botinfo - Bot information
/myinfo - Your profile
/leaderboard - Top users
/uptime - Bot uptime
/level - Your level
/stats - Your statistics

🎮 Games
/tictactoe - Play tic-tac-toe
/quiz - Answer questions
/slot - Slot machine
/guess - Guess the number

🎨 Fun
/anime - Anime info
/meme - Random meme
/hug - Hug someone
/slap - Slap someone

⚙️ Admin (Owner only)
/admin - Manage admins

Use /help <command> for more info`;

            ctx.reply(helpText);
        });

        bot.command('ping', async (ctx) => {
            const start = Date.now();
            const sent = await ctx.reply('🏓 Pinging...');
            const latency = Date.now() - start;
            await ctx.telegram.editMessageText(sent.chat.id, sent.message_id, undefined, `🏓 Pong! Latency: ${latency}ms`);
        });

        log.info('Event handlers loaded successfully');
        return true;
    } catch (error) {
        log.error(`Error loading events: ${error.message}`);
        return false;
    }
}

module.exports = loadEvents;
