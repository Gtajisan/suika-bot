module.exports = {
    config: {
        name: "stats",
        aliases: ["stat"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        description: {
            en: "View your statistics"
        },
        category: "info"
    },

    langs: {
        en: {
            stats: `📊 *Your Statistics*

👤 *Profile:*
Name: %1
User ID: %2

💰 *Economy:*
Wallet: $%3
Bank: $%4
Total: $%5

📈 *Level:* %6
⭐ *Experience:* %7

📅 *Account Age:* %8`
        }
    },

    onStart: async ({ ctx, usersData, getLang }) => {
        try {
            const userId = String(ctx.from.id);
            const userData = await usersData.get(userId);
            const total = userData.money + userData.bank;

            const response = getLang("stats",
                ctx.from.first_name,
                userId,
                userData.money.toLocaleString(),
                userData.bank.toLocaleString(),
                total.toLocaleString(),
                userData.level || 1,
                userData.experience || 0,
                'New User'
            );

            await ctx.replyWithMarkdown(response);
        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
