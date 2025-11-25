module.exports = {
    config: {
        name: "bank",
        aliases: ["bank"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        description: {
            en: "Check bank information"
        },
        category: "economy"
    },

    langs: {
        en: {
            bankInfo: `🏦 *Bank Information*

💵 *Wallet:* $%1
🏦 *Bank:* $%2
📊 *Total:* $%3

*Commands:*
/deposit <amount> - Deposit to bank
/withdraw <amount> - Withdraw from bank`,
            depositSuccess: "✅ Successfully deposited *$%1* to your bank!",
            withdrawSuccess: "✅ Successfully withdrew *$%1* from your bank!",
            insufficientFunds: "❌ Insufficient funds!",
            invalidAmount: "❌ Please provide a valid amount"
        }
    },

    onStart: async ({ ctx, usersData, getLang, args }) => {
        try {
            const userId = String(ctx.from.id);
            const userData = await usersData.get(userId);
            const total = userData.money + userData.bank;

            const response = getLang("bankInfo",
                userData.money.toLocaleString(),
                userData.bank.toLocaleString(),
                total.toLocaleString()
            );

            await ctx.replyWithMarkdown(response);
        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
