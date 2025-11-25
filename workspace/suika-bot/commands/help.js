const { Markup } = require('telegraf');

module.exports = {
    config: {
        name: "help",
        aliases: ["h", "commands"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 3,
        role: 0,
        description: { en: "Show all available commands" },
        category: "info"
    },

    langs: {
        en: {
            helpText: `🍈 *Suika Bot Commands*\n\n💰 *Economy:*\n/balance - Check your balance\n/daily - Claim daily reward\n/bank - Bank information\n/stats - Your statistics\n\n📊 *Info:*\n/ping - Bot latency\n/botinfo - Bot information\n/myinfo - Your profile\n/leaderboard - Top users\n\n⚙️ *Admin:*\n/admin - Manage admins\n/reload - Reload commands\n\n📖 Visit /commands for more info`
        }
    },

    onStart: async ({ ctx, getLang }) => {
        try {
            await ctx.replyWithMarkdown(
                getLang("helpText"),
                Markup.keyboard([
                    ['/balance', '/daily'],
                    ['/stats', '/ping'],
                    ['/leaderboard', '/botinfo'],
                    ['/help']
                ]).resize()
            );
        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
