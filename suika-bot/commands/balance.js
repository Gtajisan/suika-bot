module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "money"],
        version: "1.0",
        author: "Suika",
        countDown: 5,
        role: 0,
        description: {
            en: "Check your balance or another user's balance"
        },
        category: "economy"
    },

    langs: {
        en: {
            balance: "💰 *%1's Balance*\n\n💵 Wallet: *$%2*\n🏦 Bank: *$%3*\n📊 Total: *$%4*"
        }
    },

    onStart: async ({ ctx, usersData, getLang, args }) => {
        try {
            const targetUserId = ctx.from.id;
            
            const userData = await usersData.get(targetUserId);
            const total = userData.money + userData.bank;

            const response = getLang("balance", 
                ctx.from.first_name,
                userData.money.toLocaleString(),
                userData.bank.toLocaleString(),
                total.toLocaleString()
            );

            await ctx.replyWithHTML(response);
        } catch (error) {
            await ctx.reply('❌ Error checking balance: ' + error.message);
        }
    }
};
