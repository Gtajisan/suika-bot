const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    config: {
        name: "clear",
        aliases: ["purge", "clean"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Bulk delete messages from a channel",
            ne: "च्यानलबाट सन्देशहरू थोकमा मेटाउनुहोस्"
        },
        category: "moderation",
        guide: {
            en: "{prefix}clear <amount>\n{prefix}clear <amount> <@user> - Clear messages from specific user",
            ne: "{prefix}clear <संख्या>\n{prefix}clear <संख्या> <@प्रयोगकर्ता> - विशेष प्रयोगकर्ताबाट सन्देशहरू मेटाउनुहोस्"
        },
        slash: true,
        options: [
            {
                name: "amount",
                description: "Number of messages to delete (1-100)",
                type: 4,
                required: true,
                min_value: 1,
                max_value: 100
            },
            {
                name: "user",
                description: "Only delete messages from this user",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noPermission: "❌ You need **Manage Messages** permission to use this command!",
            botNoPermission: "❌ I need **Manage Messages** permission to delete messages!",
            noAmount: "❌ Please specify the number of messages to delete (1-100)!",
            invalidAmount: "❌ Please provide a valid number between 1 and 100!",
            clearSuccess: "🗑️ Successfully deleted **%1** message(s)!",
            clearUserSuccess: "🗑️ Successfully deleted **%1** message(s) from **%2**!",
            clearError: "❌ Failed to delete messages: %1",
            noMessages: "❌ No messages found to delete!",
            tooOld: "❌ Cannot delete messages older than 14 days!"
        },
        ne: {
            noPermission: "❌ तपाईंलाई यो आदेश प्रयोग गर्न **सन्देश व्यवस्थापन** अनुमति चाहिन्छ!",
            botNoPermission: "❌ मलाई सन्देशहरू मेटाउन **सन्देश व्यवस्थापन** अनुमति चाहिन्छ!",
            noAmount: "❌ कृपया मेटाउनको लागि सन्देशहरूको संख्या निर्दिष्ट गर्नुहोस् (१-१००)!",
            invalidAmount: "❌ कृपया १ र १०० बीचको मान्य संख्या प्रदान गर्नुहोस्!",
            clearSuccess: "🗑️ सफलतापूर्वक **%1** सन्देश(हरू) मेटियो!",
            clearUserSuccess: "🗑️ सफलतापूर्वक **%2** बाट **%1** सन्देश(हरू) मेटियो!",
            clearError: "❌ सन्देशहरू मेटाउन असफल: %1",
            noMessages: "❌ मेटाउनको लागि कुनै सन्देशहरू फेला परेन!",
            tooOld: "❌ १४ दिन भन्दा पुरानो सन्देशहरू मेटाउन सकिँदैन!"
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        const isInteraction = !!interaction;
        const member = isInteraction ? interaction.member : message.member;
        const channel = isInteraction ? interaction.channel : message.channel;
        const guild = isInteraction ? interaction.guild : message.guild;

        if (!guild) {
            const response = "❌ This command can only be used in servers!";
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (!member || !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const response = getLang("noPermission");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (!guild.members.me || !guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const response = getLang("botNoPermission");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const amount = isInteraction ? 
            interaction.options.getInteger('amount') : 
            parseInt(args[0]);

        if (!amount) {
            const response = getLang("noAmount");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (isNaN(amount) || amount < 1 || amount > 100) {
            const response = getLang("invalidAmount");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const targetUser = isInteraction ? 
            interaction.options.getUser('user') : 
            message.mentions.users.first();

        try {
            if (isInteraction) {
                await interaction.deferReply({ ephemeral: true });
            }

            const fetchAmount = Math.min(amount + (isInteraction ? 0 : 1), 100);
            const messages = await channel.messages.fetch({ limit: fetchAmount });
            
            let messagesToDelete = Array.from(messages.values());

            if (!isInteraction && message) {
                messagesToDelete = messagesToDelete.filter(msg => msg.id !== message.id);
            }

            if (targetUser) {
                messagesToDelete = messagesToDelete.filter(msg => msg.author.id === targetUser.id);
            }

            messagesToDelete = messagesToDelete.slice(0, amount);

            const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
            const recentMessages = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);

            if (recentMessages.length === 0) {
                const response = messagesToDelete.length > 0 ? getLang("tooOld") : getLang("noMessages");
                return isInteraction ? interaction.editReply(response) : message.reply(response);
            }

            const deleted = await channel.bulkDelete(recentMessages, true);

            const response = targetUser ? 
                getLang("clearUserSuccess", deleted.size, targetUser.tag) : 
                getLang("clearSuccess", deleted.size);

            if (isInteraction) {
                await interaction.editReply(response);
            } else {
                const reply = await message.reply(response);
                setTimeout(() => reply.delete().catch(() => {}), 5000);
            }
        } catch (error) {
            const response = getLang("clearError", error.message);
            if (isInteraction) {
                if (interaction.deferred) {
                    return interaction.editReply(response);
                } else {
                    return interaction.reply({ content: response, ephemeral: true });
                }
            } else {
                return message.reply(response);
            }
        }
    }
};
