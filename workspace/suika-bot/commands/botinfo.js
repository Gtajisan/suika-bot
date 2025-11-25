const os = require('os');

module.exports = {
    config: {
        name: "botinfo",
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        description: {
            en: "Show bot statistics and information"
        },
        category: "info"
    },

    langs: {
        en: {
            botinfo: `🤖 *Suika Bot Information*

📊 *Statistics:*
Commands: %1
Uptime: %2
Memory: %3 MB

💾 *System:*
Platform: %4
Node.js: %5

👨‍💻 *Developer:* Gtajisan
📱 *Platform:* Telegram`
        }
    },

    onStart: async ({ ctx, getLang }) => {
        try {
            const totalCommands = global.SuikaBot.commands.size;
            const uptime = Date.now() - global.SuikaBot.startTime;
            const days = Math.floor(uptime / 86400000);
            const hours = Math.floor(uptime / 3600000) % 24;
            const minutes = Math.floor(uptime / 60000) % 60;
            const uptimeStr = `${days}d ${hours}h ${minutes}m`;
            const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const platform = os.platform();
            const nodeVersion = process.version;

            const response = getLang("botinfo",
                totalCommands,
                uptimeStr,
                memoryUsage,
                platform,
                nodeVersion
            );

            await ctx.replyWithMarkdown(response);
        } catch (error) {
            await ctx.reply('❌ Error getting bot info: ' + error.message);
        }
    }
};
