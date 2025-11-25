module.exports = {
    config: {
        name: "myinfo",
        aliases: ["info", "profile"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        description: { en: "View your profile information" },
        category: "info"
    },
    langs: {
        en: {
            info: `👤 *Your Profile*\n\nName: %1\nID: %2\nJoined: %3\n\n💰 Balance: $%4\n📊 Level: %5`
        }
    },
    onStart: async ({ ctx, usersData, getLang }) => {
        try {
            const userData = await usersData.get(String(ctx.from.id));
            const response = getLang("info",
                ctx.from.first_name,
                ctx.from.id,
                new Date(ctx.message.date * 1000).toLocaleDateString(),
                userData.money.toLocaleString(),
                userData.level || 1
            );
            await ctx.replyWithMarkdown(response);
        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
