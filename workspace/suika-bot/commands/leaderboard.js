module.exports = {
    config: {
        name: "leaderboard",
        aliases: ["lb", "top"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        description: { en: "View top users by balance" },
        category: "info"
    },
    langs: {
        en: {
            leaderboard: `🏆 *Top Users by Balance*\n\n%1`,
            noData: "Not enough users yet"
        }
    },
    onStart: async ({ ctx, usersData, getLang }) => {
        try {
            const allUsers = await usersData.getAll();
            const sorted = allUsers.sort((a, b) => (b.money + b.bank) - (a.money + a.bank)).slice(0, 10);
            
            const list = sorted.map((u, i) => 
                `${i + 1}. ID: ${u.telegramId} - $${(u.money + u.bank).toLocaleString()}`
            ).join('\n');
            
            const response = getLang("leaderboard", list || getLang("noData"));
            await ctx.replyWithMarkdown(response);
        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
