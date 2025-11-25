const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "stats",
        aliases: ["lvl", "profile"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Display your stats with level, EXP, and money",
            ne: "स्तर, EXP र पैसासहित आफ्नो तथ्याङ्क प्रदर्शन गर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}stats [@user]",
            ne: "{prefix}stats [@प्रयोगकर्ता]"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user to view stats card for",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            error: "❌ An error occurred while generating stats card"
        },
        ne: {
            error: "❌ तथ्याङ्क कार्ड उत्पन्न गर्दा त्रुटि देखा पर्यो"
        }
    },

    onStart: async ({ message, interaction, usersData, getLang }) => {
        try {
            const targetUser = message ? 
                (message.mentions.users.first() || message.author) : 
                (interaction.options.getUser('user') || interaction.user);

            const userData = await usersData.get(targetUser.id);
            const allUsers = await usersData.getAll();

            const sortedUsers = allUsers
                .filter(u => u.exp > 0)
                .sort((a, b) => b.exp - a.exp);

            const userRank = sortedUsers.findIndex(u => u.userID === targetUser.id) + 1;
            const currentLevel = global.utils.calculateLevel(userData.exp);
            const expForCurrentLevel = global.utils.getExpForLevel(currentLevel);
            const expNeeded = global.utils.getExpForNextLevel(userData.exp);
            const expInCurrentLevel = userData.exp - expForCurrentLevel;
            const progress = Math.floor((expInCurrentLevel / expNeeded) * 100);

            const cardColor = '#5865F2'; // Setting a fixed color for minimal style
            const progressBar = createProgressBar(progress, 20);
            const card = generateMinimalCard(targetUser, userData, userRank, expNeeded, progressBar);

            const embed = new EmbedBuilder()
                .setColor(cardColor)
                .setDescription(card)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ text: `Requested by ${message?.author?.tag || interaction.user.tag}` })
                .setTimestamp();

            return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Rankcard error:', error);
            const response = getLang("error");
            return message ? message.reply(response) : interaction.reply(response);
        }
    }
};

function createProgressBar(percentage, length = 20) {
    const filled = Math.floor((percentage / 100) * length);
    const empty = length - filled;

    const filledChar = '█';
    const emptyChar = '░';

    return filledChar.repeat(filled) + emptyChar.repeat(empty);
}

function generateMinimalCard(user, userData, rank, expNeeded, progressBar) {
    const { exp, money, bank } = userData;
    const level = global.utils.calculateLevel(exp);
    const expForCurrentLevel = global.utils.getExpForLevel(level);
    const expInCurrentLevel = exp - expForCurrentLevel;
    const totalMoney = money + (bank || 0);

    return `**${user.username}**\n` +
           `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
           `📊 Rank: #${rank || 'N/A'}\n` +
           `⭐ Level: ${level}\n` +
           `✨ EXP: ${expInCurrentLevel}/${expNeeded}\n` +
           `💰 Total Money: $${totalMoney.toLocaleString()}\n` +
           `💵 Wallet: $${money.toLocaleString()}\n` +
           `🏦 Bank: $${(bank || 0).toLocaleString()}\n` +
           `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
           `${progressBar} ${Math.floor((expInCurrentLevel / expNeeded) * 100)}%`;
}