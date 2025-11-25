const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "bank",
        aliases: ["dep", "wd"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Banking system - deposit or withdraw money",
            ne: "बैंकिङ प्रणाली - पैसा जम्मा वा निकाल्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}bank deposit <amount>\n{prefix}bank withdraw <amount>\n{prefix}bank info",
            ne: "{prefix}bank deposit <रकम>\n{prefix}bank withdraw <रकम>\n{prefix}bank info"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform (deposit/withdraw/info)",
                type: 3,
                required: true,
                choices: [
                    { name: "Deposit", value: "deposit" },
                    { name: "Withdraw", value: "withdraw" },
                    { name: "Info", value: "info" }
                ]
            },
            {
                name: "amount",
                description: "Amount of money",
                type: 4,
                required: false
            }
        ]
    },

    langs: {
        en: {
            invalidAmount: "❌ Please provide a valid amount!",
            negativeAmount: "❌ Amount must be positive!",
            insufficientWallet: "❌ You don't have enough money in your wallet!\nWallet: **$%1**",
            insufficientBank: "❌ You don't have enough money in your bank!\nBank: **$%1**",
            depositSuccess: "✅ Successfully deposited **$%1** to your bank!",
            withdrawSuccess: "✅ Successfully withdrew **$%1** from your bank!",
            bankInfo: "🏦 **Bank Information**\n\n💵 Wallet: **$%1**\n🏦 Bank: **$%2**\n📊 Total: **$%3**\n\n💡 Interest Rate: **2%** per day\n📈 Daily Interest: **$%4**\n\nDeposit money to earn interest!"
        },
        ne: {
            invalidAmount: "❌ कृपया मान्य रकम प्रदान गर्नुहोस्!",
            negativeAmount: "❌ रकम सकारात्मक हुनुपर्छ!",
            insufficientWallet: "❌ तपाईंको वालेटमा पर्याप्त पैसा छैन!\nवालेट: **$%1**",
            insufficientBank: "❌ तपाईंको बैंकमा पर्याप्त पैसा छैन!\nबैंक: **$%1**",
            depositSuccess: "✅ सफलतापूर्वक **$%1** तपाईंको बैंकमा जम्मा गरियो!",
            withdrawSuccess: "✅ सफलतापूर्वक **$%1** तपाईंको बैंकबाट निकालियो!",
            bankInfo: "🏦 **बैंक जानकारी**\n\n💵 वालेट: **$%1**\n🏦 बैंक: **$%2**\n📊 कुल: **$%3**\n\n💡 ब्याज दर: **२%** प्रति दिन\n📈 दैनिक ब्याज: **$%4**\n\nब्याज कमाउन पैसा जम्मा गर्नुहोस्!"
        }
    },

    onStart: async ({ message, interaction, args, usersData, userData, getLang }) => {
        const isSlash = !message;
        const action = isSlash ? interaction.options.getString('action') : args[0]?.toLowerCase();
        let amount = isSlash ? interaction.options.getInteger('amount') : parseInt(args[1]);

        if (!action) {
            return isSlash ? 
                interaction.reply({ content: getLang("invalidAmount"), ephemeral: true }) : 
                message.reply(getLang("invalidAmount"));
        }

        if (action === "info") {
            const total = userData.money + userData.bank;
            const dailyInterest = Math.floor(userData.bank * 0.02);
            const response = getLang("bankInfo", 
                userData.money.toLocaleString(),
                userData.bank.toLocaleString(),
                total.toLocaleString(),
                dailyInterest.toLocaleString()
            );

            const embed = new EmbedBuilder()
                .setDescription(response)
                .setColor(0x5865F2)
                .setTimestamp();

            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }

        if (args[1] === "all" || args[1] === "max") {
            amount = action === "deposit" ? userData.money : userData.bank;
        }

        if (!amount || isNaN(amount)) {
            return isSlash ? 
                interaction.reply({ content: getLang("invalidAmount"), ephemeral: true }) : 
                message.reply(getLang("invalidAmount"));
        }

        if (amount <= 0) {
            return isSlash ? 
                interaction.reply({ content: getLang("negativeAmount"), ephemeral: true }) : 
                message.reply(getLang("negativeAmount"));
        }

        const userID = isSlash ? interaction.user.id : message.author.id;

        if (action === "deposit" || action === "dep" || action === "d") {
            if (userData.money < amount) {
                return isSlash ? 
                    interaction.reply({ content: getLang("insufficientWallet", userData.money.toLocaleString()), ephemeral: true }) : 
                    message.reply(getLang("insufficientWallet", userData.money.toLocaleString()));
            }

            await usersData.set(userID, {
                money: userData.money - amount,
                bank: userData.bank + amount
            });

            const embed = new EmbedBuilder()
                .setDescription(getLang("depositSuccess", amount.toLocaleString()))
                .setColor(0x57F287)
                .setTimestamp();

            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }

        if (action === "withdraw" || action === "wd" || action === "w") {
            if (userData.bank < amount) {
                return isSlash ? 
                    interaction.reply({ content: getLang("insufficientBank", userData.bank.toLocaleString()), ephemeral: true }) : 
                    message.reply(getLang("insufficientBank", userData.bank.toLocaleString()));
            }

            await usersData.set(userID, {
                money: userData.money + amount,
                bank: userData.bank - amount
            });

            const embed = new EmbedBuilder()
                .setDescription(getLang("withdrawSuccess", amount.toLocaleString()))
                .setColor(0x57F287)
                .setTimestamp();

            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }

        return isSlash ? 
            interaction.reply({ content: "❌ Invalid action! Use deposit, withdraw, or info.", ephemeral: true }) : 
            message.reply("❌ Invalid action! Use deposit, withdraw, or info.");
    }
};
