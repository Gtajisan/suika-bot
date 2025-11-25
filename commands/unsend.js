const { PermissionFlagsBits } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "unsend",
        aliases: ["deletemsg", "delmsg"],
        version: "1.0",
        author: "Samir",
        countDown: 3,
        role: 0,
        description: {
            en: "Delete bot's messages",
            ne: "बटका सन्देशहरू मेटाउनुहोस्"
        },
        category: "utility",
        guide: {
            en: "{prefix}unsend - Delete the bot's last message (reply to it)\n"
                + "{prefix}unsend <number> - Delete last N bot messages in channel\n"
                + "{prefix}unsend all - Delete all bot messages (max 100)",
            ne: "{prefix}unsend - बटको अन्तिम सन्देश मेटाउनुहोस् (यसमा जवाफ दिनुहोस्)\n"
                + "{prefix}unsend <संख्या> - च्यानलमा अन्तिम N बट सन्देशहरू मेटाउनुहोस्\n"
                + "{prefix}unsend all - सबै बट सन्देशहरू मेटाउनुहोस् (अधिकतम १००)"
        },
        slash: true,
        options: [
            {
                name: "count",
                description: "Number of bot messages to delete (1-100)",
                type: 4,
                required: false,
                min_value: 1,
                max_value: 100
            }
        ]
    },

    langs: {
        en: {
            deleted: "✅ Successfully deleted **%1** message(s)",
            noMessages: "❌ No bot messages found to delete",
            noPermission: "❌ I need **Manage Messages** permission to delete messages!",
            error: "❌ Error deleting messages: %1",
            replyToDelete: "💡 Reply to my message to delete it, or use `{prefix}unsend <number>` to delete multiple messages"
        },
        ne: {
            deleted: "✅ सफलतापूर्वक **%1** सन्देश(हरू) मेटाइयो",
            noMessages: "❌ मेटाउनको लागि कुनै बट सन्देश फेला परेन",
            noPermission: "❌ मलाई सन्देशहरू मेटाउन **सन्देश व्यवस्थापन** अनुमति चाहिन्छ!",
            error: "❌ सन्देशहरू मेटाउन त्रुटि: %1",
            replyToDelete: "💡ं मेटाउन मेरो सन्देशमा जवाफ दिनुहोस्, वा धेरै सन्देशहरू मेटाउन `{prefix}unsend <संख्या>` प्रयोग गर्नुहोस्"
        }
    },

    onStart: async ({ message, interaction, args, client, getLang, prefix }) => {
        const isInteraction = !!interaction;
        const channel = isInteraction ? interaction.channel : message.channel;
        const guild = isInteraction ? interaction.guild : message.guild;

        if (guild && !guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const response = getLang("noPermission");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        try {
            let count = 1;
            let deleteAll = false;

            if (isInteraction) {
                count = interaction.options.getInteger('count') || 1;
                if (count > 100) count = 100;
            } else {
                const arg = args[0];
                if (arg === 'all') {
                    deleteAll = true;
                    count = 100;
                } else if (arg && !isNaN(arg)) {
                    count = Math.min(parseInt(arg), 100);
                }
            }

            if (message?.reference?.messageId) {
                const repliedMsg = await channel.messages.fetch(message.reference.messageId).catch(() => null);
                if (repliedMsg && repliedMsg.author.id === client.user.id) {
                    await repliedMsg.delete();
                    if (message && !isInteraction) {
                        await message.delete().catch(() => {});
                    }
                    const response = getLang("deleted", 1);
                    if (isInteraction) {
                        return ctx.reply({ content: response, ephemeral: true });
                    }
                    return;
                }
            }

            const messages = await channel.messages.fetch({ limit: 100 });
            const botMessages = messages
                .filter(msg => msg.author.id === client.user.id)
                .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
                .first(count);

            if (botMessages.length === 0) {
                const response = getLang("noMessages");
                return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
            }

            if (isInteraction) {
                await interaction.deferReply({ ephemeral: true });
            }

            let deletedCount = 0;
            for (const msg of botMessages) {
                try {
                    await msg.delete();
                    deletedCount++;
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (error) {
                    console.error(`Failed to delete message ${msg.id}:`, error);
                }
            }

            if (message && !isInteraction) {
                await message.delete().catch(() => {});
            }

            const response = getLang("deleted", deletedCount);
            if (isInteraction) {
                await interaction.editReply(response);
            } else {
                const reply = await channel.send(response);
                setTimeout(() => reply.delete().catch(() => {}), 5000);
            }

        } catch (error) {
            console.error('Unsend error:', error);
            const response = getLang("error", error.message);
            if (isInteraction) {
                if (interaction.deferred) {
                    return interaction.editReply(response);
                } else {
                    return ctx.reply({ content: response, ephemeral: true });
                }
            } else {
                return ctx.reply(response);
            }
        }
    }
};
