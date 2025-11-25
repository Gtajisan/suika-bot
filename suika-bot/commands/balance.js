const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "money"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Check your balance or another user's balance",
            ne: "आफ्नो वा अर्को प्रयोगकर्ताको ब्यालेन्स जाँच गर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}balance [@user]",
            ne: "{prefix}balance [@प्रयोगकर्ता]"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user to check balance for",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            balance: "💰 **%1's Balance**\n\n💵 Wallet: **$%2**\n🏦 Bank: **$%3**\n📊 Total: **$%4**"
        },
        ne: {
            balance: "💰 **%1 को ब्यालेन्स**\n\n💵 वालेट: **$%2**\n🏦 बैंक: **$%3**\n📊 कुल: **$%4**"
        }
    },

    onStart: async ({ message, interaction, usersData, getLang }) => {
        const targetUser = message ? 
            (message.mentions.users.first() || message.author) : 
            (interaction.options.getUser('user') || interaction.user);

        const userData = await usersData.get(targetUser.id);
        const total = userData.money + userData.bank;

        const response = getLang("balance", 
            targetUser.username,
            userData.money.toLocaleString(),
            userData.bank.toLocaleString(),
            total.toLocaleString()
        );

        const embed = new EmbedBuilder()
            .setDescription(response)
            .setColor(0xFFD700)
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();

        return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
    }
};
