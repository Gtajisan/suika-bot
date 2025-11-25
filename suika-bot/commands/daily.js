
module.exports = {
    config: {
        name: "daily",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Claim your daily reward",
            ne: "आफ्नो दैनिक इनाम दावी गर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}daily",
            ne: "{prefix}daily"
        },
        slash: true
    },

    langs: {
        en: {
            claimed: "💰 You claimed your daily reward of **$%1**!\nCome back in 24 hours!",
            alreadyClaimed: "⏰ You already claimed your daily reward!\nCome back in **%1**"
        },
        ne: {
            claimed: "💰 तपाईंले **$%1** को दैनिक इनाम प्राप्त गर्नुभयो!\n24 घण्टा पछि फर्कनुहोस्!",
            alreadyClaimed: "⏰ तपाईंले पहिले नै आफ्नो दैनिक इनाम प्राप्त गर्नुभएको छ!\n**%1** मा फर्कनुहोस्"
        }
    },

    onStart: async ({ message, interaction, usersData, userData, getLang }) => {
        const now = Date.now();
        const lastDaily = userData.data.lastDaily || 0;
        const cooldown = 86400000;

        if (now - lastDaily < cooldown) {
            const timeLeft = cooldown - (now - lastDaily);
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            const response = getLang("alreadyClaimed", `${hours}h ${minutes}m`);
            
            return message ? ctx.reply(response) : ctx.reply(response);
        }

        const reward = Math.floor(Math.random() * 500) + 500;
        await usersData.set((message?.author || interaction.user).id, {
            money: userData.money + reward,
            data: { ...userData.data, lastDaily: now }
        });

        const response = getLang("claimed", reward);
        const embed = {}
            // Description: response
            
            .setTimestamp();

        return message ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
    }
};
