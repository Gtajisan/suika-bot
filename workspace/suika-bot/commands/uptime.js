module.exports = {
    config: {
        name: "uptime",
        aliases: ["up"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 3,
        role: 0,
        description: { en: "Check bot uptime" },
        category: "info"
    },

    langs: {
        en: {
            uptime: `⏱️ *Bot Uptime*\n\n%1\n\n🍈 Suika Bot is running smoothly!\n💾 Developer: Gtajisan`
        }
    },

    onStart: async ({ ctx, getLang }) => {
        try {
            const uptime = Date.now() - global.SuikaBot.startTime;
            const days = Math.floor(uptime / 86400000);
            const hours = Math.floor(uptime / 3600000) % 24;
            const minutes = Math.floor(uptime / 60000) % 60;
            const seconds = Math.floor(uptime / 1000) % 60;
            const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            const response = getLang("uptime", uptimeStr);
            await ctx.replyWithMarkdown(response);
        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
