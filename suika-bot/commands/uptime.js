const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "uptime",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Show how long the bot has been running",
            ne: "बट कति समयदेखि चलिरहेको छ देखाउनुहोस्"
        },
        category: "info",
        guide: {
            en: "{prefix}uptime",
            ne: "{prefix}uptime"
        },
        slash: true
    },

    langs: {
        en: {
            title: "⏰ Bot Uptime",
            uptime: "**Uptime:** %1",
            details: "**Days:** %1\n**Hours:** %2\n**Minutes:** %3\n**Seconds:** %4",
            started: "**Started:** %1"
        },
        ne: {
            title: "⏰ बट अपटाइम",
            uptime: "**अपटाइम:** %1",
            details: "**दिन:** %1\n**घण्टा:** %2\n**मिनेट:** %3\n**सेकेन्ड:** %4",
            started: "**सुरु:** %1"
        }
    },

    onStart: async ({ message, interaction, getLang }) => {
        const uptime = Date.now() - global.RentoBot.startTime;
        
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor(uptime / 3600000) % 24;
        const minutes = Math.floor(uptime / 60000) % 60;
        const seconds = Math.floor(uptime / 1000) % 60;
        
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        const startedAt = `<t:${Math.floor(global.RentoBot.startTime / 1000)}:F>`;

        const embed = new EmbedBuilder()
            .setTitle(getLang("title"))
            .setDescription(
                getLang("uptime", uptimeString) + "\n\n" +
                getLang("details", days, hours, minutes, seconds) + "\n\n" +
                getLang("started", startedAt)
            )
            .setColor(0x00AE86)
            .setTimestamp();

        return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
    }
};
