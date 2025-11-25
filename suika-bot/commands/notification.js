const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "notification",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Send notifications to all guilds",
            ne: "सबै गिल्डहरूमा सूचनाहरू पठाउनुहोस्"
        },
        category: "owner",
        guide: {
            en: "{prefix}notification <message>",
            ne: "{prefix}notification <सन्देश>"
        },
        slash: true,
        options: [
            {
                name: "message",
                description: "Notification message to send",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noMessage: "Please provide a message to broadcast!",
            sending: "📢 Sending notification to all guilds...",
            success: "✅ Successfully sent notification to **%1/%2** guilds",
            failed: "⚠️ Failed to send to **%1** guilds",
            notificationTitle: "📢 Bot Notification",
            footer: "Notification from bot owner"
        },
        ne: {
            noMessage: "कृपया प्रसारण गर्न सन्देश प्रदान गर्नुहोस्!",
            sending: "📢 सबै गिल्डहरूमा सूचना पठाउँदै...",
            success: "✅ सफलतापूर्वक **%1/%2** गिल्डहरूमा सूचना पठाइयो",
            failed: "⚠️ **%1** गिल्डहरूमा पठाउन असफल",
            notificationTitle: "📢 बट सूचना",
            footer: "बट मालिकबाट सूचना"
        }
    },

    onStart: async ({ message, interaction, args, client, getLang }) => {
        const notificationMessage = args?.join(" ") || interaction?.options?.getString('message');

        if (!notificationMessage) {
            const response = getLang("noMessage");
            return message ? message.reply(response) : interaction.reply(response);
        }

        const statusMsg = message ? 
            await message.reply(getLang("sending")) : 
            await interaction.reply({ content: getLang("sending"), fetchReply: true });

        const guilds = client.guilds.cache;
        let successCount = 0;
        let failCount = 0;

        const embed = new EmbedBuilder()
            .setTitle(getLang("notificationTitle"))
            .setDescription(notificationMessage)
            .setColor(0x00AE86)
            .setFooter({ text: getLang("footer") })
            .setTimestamp();

        for (const [guildId, guild] of guilds) {
            try {
                const channels = guild.channels.cache.filter(
                    channel => channel.type === 0 && 
                    channel.permissionsFor(guild.members.me).has(['SendMessages', 'ViewChannel'])
                );

                const targetChannel = channels.find(ch => 
                    ch.name.includes('general') || 
                    ch.name.includes('chat') ||
                    ch.name.includes('announcement')
                ) || channels.first();

                if (targetChannel) {
                    await targetChannel.send({ embeds: [embed] });
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        let response = getLang("success", successCount, guilds.size);
        if (failCount > 0) {
            response += "\n" + getLang("failed", failCount);
        }

        if (message) {
            await statusMsg.edit(response);
        } else {
            await interaction.editReply(response);
        }
    }
};
