const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "avatar",
        aliases: ["av", "pfp"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Get avatar of mentioned user or yourself",
            ne: "उल्लेखित प्रयोगकर्ता वा आफ्नो अवतार प्राप्त गर्नुहोस्"
        },
        category: "info",
        guide: {
            en: "{prefix}avatar [@user]",
            ne: "{prefix}avatar [@प्रयोगकर्ता]"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user to get avatar for",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            title: "%1's Avatar",
            links: "[PNG](%1) | [JPG](%2) | [WEBP](%3)"
        },
        ne: {
            title: "%1 को अवतार",
            links: "[PNG](%1) | [JPG](%2) | [WEBP](%3)"
        }
    },

    onStart: async ({ message, interaction, getLang }) => {
        const targetUser = message ? 
            (message.mentions.users.first() || message.author) : 
            (interaction.options.getUser('user') || interaction.user);

        const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });
        const pngURL = targetUser.displayAvatarURL({ extension: 'png', size: 1024 });
        const jpgURL = targetUser.displayAvatarURL({ extension: 'jpg', size: 1024 });
        const webpURL = targetUser.displayAvatarURL({ extension: 'webp', size: 1024 });

        const embed = new EmbedBuilder()
            .setTitle(getLang("title", targetUser.username))
            .setDescription(getLang("links", pngURL, jpgURL, webpURL))
            .setImage(avatarURL)
            .setColor(0x5865F2)
            .setTimestamp();

        return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
    }
};
