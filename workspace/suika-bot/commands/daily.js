module.exports = {
    config: {
        name: "daily",
        aliases: ["d"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        description: {
            en: "Claim your daily reward"
        },
        category: "economy"
    },

    langs: {
        en: {
            claimed: "✅ You claimed your daily reward! You got *$%1*",
            alreadyClaimed: "⏱️ You already claimed today. Come back tomorrow!",
            newBalance: "\n💰 New Balance: *$%1*"
        }
    },

    onStart: async ({ ctx, usersData, getLang }) => {
        try {
            const userId = String(ctx.from.id);
            const userData = await usersData.get(userId);
            const now = new Date();
            const lastDaily = userData.lastDaily ? new Date(userData.lastDaily) : null;

            const isToday = lastDaily && 
                lastDaily.getDate() === now.getDate() &&
                lastDaily.getMonth() === now.getMonth() &&
                lastDaily.getFullYear() === now.getFullYear();

            if (isToday) {
                return ctx.replyWithMarkdown(getLang("alreadyClaimed"));
            }

            const reward = 500;
            const newMoney = userData.money + reward;

            await usersData.set(userId, {
                money: newMoney,
                lastDaily: now.toISOString()
            });

            const response = getLang("claimed", reward) + 
                           getLang("newBalance", newMoney.toLocaleString());

            await ctx.replyWithMarkdown(response);
        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
