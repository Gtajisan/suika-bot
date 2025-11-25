module.exports = {
    config: {
        name: "ping",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Check bot's ping",
            ne: "बटको पिंग जाँच गर्नुहोस्"
        },
        category: "Samir",
        guide: {
            en: "{prefix}ping",
            ne: "{prefix}ping"
        },
        slash: true
    },

    langs: {
        en: {
            pinging: "Pinging...",
            ping: "🏓 Pong! Latency: %1ms\nAPI Latency: %2ms"
        },
        ne: {
            pinging: "पिङ्ग गर्दै...",
            ping: "🏓 पोंग! विलम्बता: %1ms\nAPI विलम्बता: %2ms"
        }
    },

    onStart: async ({ message, interaction, client, getLang }) => {
        const sent = message ? 
            await message.reply(getLang("pinging")) : 
            await interaction.reply({ content: getLang("pinging"), fetchReply: true });
        
        const latency = sent.createdTimestamp - (message?.createdTimestamp || interaction.createdTimestamp);
        const apiLatency = Math.round(client.ws.ping);
        
        const response = getLang("ping", latency, apiLatency);
        
        if (message) {
            await sent.edit(response);
        } else {
            await interaction.editReply(response);
        }
    }
};
