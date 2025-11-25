const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    config: {
        name: "kick",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Kick users from the server",
            ne: "सर्भरबाट प्रयोगकर्ताहरूलाई किक गर्नुहोस्"
        },
        category: "moderation",
        guide: {
            en: "{prefix}kick <@user> [reason]",
            ne: "{prefix}kick <@प्रयोगकर्ता> [कारण]"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "User to kick",
                type: 6,
                required: true
            },
            {
                name: "reason",
                description: "Reason for the kick",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noPermission: "❌ You need **Kick Members** permission to use this command!",
            botNoPermission: "❌ I need **Kick Members** permission to kick users!",
            noUser: "❌ Please mention a user to kick!",
            cantKickSelf: "❌ You cannot kick yourself!",
            cantKickBot: "❌ You cannot kick me!",
            cantKickAdmin: "❌ You cannot kick administrators!",
            higherRole: "❌ You cannot kick someone with a higher or equal role!",
            botHigherRole: "❌ I cannot kick someone with a higher or equal role than mine!",
            kickSuccess: "✅ Successfully kicked **%1**\n📝 Reason: %2",
            kickError: "❌ Failed to kick user: %1"
        },
        ne: {
            noPermission: "❌ तपाईंलाई यो आदेश प्रयोग गर्न **सदस्य किक गर्ने** अनुमति चाहिन्छ!",
            botNoPermission: "❌ मलाई प्रयोगकर्ताहरूलाई किक गर्न **सदस्य किक गर्ने** अनुमति चाहिन्छ!",
            noUser: "❌ कृपया किक गर्न प्रयोगकर्ता उल्लेख गर्नुहोस्!",
            cantKickSelf: "❌ तपाईं आफैंलाई किक गर्न सक्नुहुन्न!",
            cantKickBot: "❌ तपाईं मलाई किक गर्न सक्नुहुन्न!",
            cantKickAdmin: "❌ तपाईं प्रशासकहरूलाई किक गर्न सक्नुहुन्न!",
            higherRole: "❌ तपाईं उच्च वा बराबर भूमिका भएको कसैलाई किक गर्न सक्नुहुन्न!",
            botHigherRole: "❌ म मेरो भन्दा उच्च वा बराबर भूमिका भएको कसैलाई किक गर्न सक्दिन!",
            kickSuccess: "✅ सफलतापूर्वक **%1** लाई किक गरियो\n📝 कारण: %2",
            kickError: "❌ प्रयोगकर्ता किक गर्न असफल: %1"
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        const isInteraction = !!interaction;
        const member = isInteraction ? interaction.member : message.member;
        const guild = isInteraction ? interaction.guild : message.guild;

        if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
            const response = getLang("noPermission");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            const response = getLang("botNoPermission");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const targetUser = isInteraction ? 
            interaction.options.getUser('user') : 
            message.mentions.users.first();
        
        const reason = isInteraction ? 
            (interaction.options.getString('reason') || 'No reason provided') : 
            (args.slice(1).join(' ') || 'No reason provided');

        if (!targetUser) {
            const response = getLang("noUser");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (targetUser.id === member.id) {
            const response = getLang("cantKickSelf");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (targetUser.id === guild.members.me.id) {
            const response = getLang("cantKickBot");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
        
        if (!targetMember) {
            const response = "❌ User is not in this server!";
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
            const response = getLang("cantKickAdmin");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (targetMember.roles.highest.position >= member.roles.highest.position) {
            const response = getLang("higherRole");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (targetMember.roles.highest.position >= guild.members.me.roles.highest.position) {
            const response = getLang("botHigherRole");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        try {
            // Notify the user before kicking
            try {
                const dmEmbed = {
                    color: 0xFF6600,
                    title: '👢 You Have Been Kicked',
                    description: `You have been kicked from **${guild.name}**`,
                    fields: [
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: member.user.tag, inline: true }
                    ],
                    timestamp: new Date()
                };
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not DM ${targetUser.tag} about kick`);
            }

            await targetMember.kick(`${reason} - Kicked by ${member.user.tag}`);
            const response = getLang("kickSuccess", targetUser.tag, reason);
            return isInteraction ? interaction.reply(response) : message.reply(response);
        } catch (error) {
            const response = getLang("kickError", error.message);
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }
    }
};
