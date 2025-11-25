const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "rob",
        aliases: ["steal"],
        version: "1.0",
        author: "Samir",
        countDown: 15,
        role: 0,
        description: {
            en: "Attempt to rob another user",
            ne: "अर्को प्रयोगकर्तालाई लुट्ने प्रयास गर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}rob <@user>",
            ne: "{prefix}rob <@प्रयोगकर्ता>"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "User to rob",
                type: 6,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noUser: "❌ Please mention a user to rob!",
            selfRob: "❌ You cannot rob yourself!",
            botRob: "❌ You cannot rob bots!",
            cooldown: "⏰ You need to wait **%1** before robbing again!",
            targetPoor: "❌ **%1** doesn't have enough money to rob! They need at least **$500** in their wallet.",
            robberPoor: "❌ You need at least **$200** in your wallet to attempt a robbery!",
            success: "✅ **Robbery Successful!**\n\nYou stole **$%1** from **%2**!\n💰 Your Balance: **$%3**",
            fail: "❌ **Robbery Failed!**\n\nYou got caught and paid **$%1** as a fine!\n💰 Your Balance: **$%2**",
            policeProtection: "🚔 **%1** has police protection active! You cannot rob them."
        },
        ne: {
            noUser: "❌ कृपया लुट्न प्रयोगकर्ता उल्लेख गर्नुहोस्!",
            selfRob: "❌ तपाईं आफैंलाई लुट्न सक्नुहुन्न!",
            botRob: "❌ तपाईं बटहरूलाई लुट्न सक्नुहुन्न!",
            cooldown: "⏰ तपाईंले फेरि लुट्नु अघि **%1** पर्खनु पर्छ!",
            targetPoor: "❌ **%1** सँग लुट्न पर्याप्त पैसा छैन! उनीहरूको वालेटमा कम्तिमा **$500** चाहिन्छ।",
            robberPoor: "❌ तपाईंलाई डकैती प्रयास गर्न आफ्नो वालेटमा कम्तिमा **$200** चाहिन्छ!",
            success: "✅ **डकैती सफल!**\n\nतपाईंले **%2** बाट **$%1** चोर्नुभयो!\n💰 तपाईंको ब्यालेन्स: **$%3**",
            fail: "❌ **डकैती असफल!**\n\nतपाईं समातिनुभयो र जरिवानाको रूपमा **$%1** तिर्नुभयो!\n💰 तपाईंको ब्यालेन्स: **$%2**",
            policeProtection: "🚔 **%1** सँग पुलिस सुरक्षा सक्रिय छ! तपाईं उनीहरूलाई लुट्न सक्नुहुन्न।"
        }
    },

    onStart: async ({ message, interaction, usersData, userData, getLang }) => {
        const isSlash = !message;
        const robber = isSlash ? interaction.user : message.author;
        const target = isSlash ? interaction.options.getUser('user') : message.mentions.users.first();

        if (!target) {
            return isSlash ? 
                interaction.reply({ content: getLang("noUser"), ephemeral: true }) : 
                message.reply(getLang("noUser"));
        }

        if (target.bot) {
            return isSlash ? 
                interaction.reply({ content: getLang("botRob"), ephemeral: true }) : 
                message.reply(getLang("botRob"));
        }

        if (target.id === robber.id) {
            return isSlash ? 
                interaction.reply({ content: getLang("selfRob"), ephemeral: true }) : 
                message.reply(getLang("selfRob"));
        }

        const now = Date.now();
        const lastRob = userData.data.lastRob || 0;
        const cooldown = 3600000;

        if (now - lastRob < cooldown) {
            const timeLeft = cooldown - (now - lastRob);
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            return isSlash ? 
                interaction.reply({ content: getLang("cooldown", `${minutes}m ${seconds}s`), ephemeral: true }) : 
                message.reply(getLang("cooldown", `${minutes}m ${seconds}s`));
        }

        if (userData.money < 200) {
            return isSlash ? 
                interaction.reply({ content: getLang("robberPoor"), ephemeral: true }) : 
                message.reply(getLang("robberPoor"));
        }

        const targetData = await usersData.get(target.id);

        if (targetData.data.policeProtection && targetData.data.policeProtection > now) {
            return isSlash ? 
                interaction.reply({ content: getLang("policeProtection", target.username), ephemeral: true }) : 
                message.reply(getLang("policeProtection", target.username));
        }

        if (targetData.money < 500) {
            return isSlash ? 
                interaction.reply({ content: getLang("targetPoor", target.username), ephemeral: true }) : 
                message.reply(getLang("targetPoor", target.username));
        }

        const successChance = 0.40;
        const success = Math.random() < successChance;

        if (success) {
            const maxSteal = Math.min(targetData.money * 0.3, 5000);
            const stolenAmount = Math.floor(Math.random() * maxSteal) + 100;

            await usersData.set(robber.id, {
                money: userData.money + stolenAmount,
                data: { ...userData.data, lastRob: now }
            });

            await usersData.set(target.id, {
                money: targetData.money - stolenAmount
            });

            const embed = new EmbedBuilder()
                .setDescription(getLang("success", stolenAmount.toLocaleString(), target.username, (userData.money + stolenAmount).toLocaleString()))
                .setColor(0x57F287)
                .setTimestamp();

            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        } else {
            const fine = Math.floor(Math.random() * 400) + 200;
            const actualFine = Math.min(fine, userData.money);

            await usersData.set(robber.id, {
                money: userData.money - actualFine,
                data: { ...userData.data, lastRob: now }
            });

            const embed = new EmbedBuilder()
                .setDescription(getLang("fail", actualFine.toLocaleString(), (userData.money - actualFine).toLocaleString()))
                .setColor(0xED4245)
                .setTimestamp();

            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }
    }
};
