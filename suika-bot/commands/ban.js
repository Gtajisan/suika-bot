const { PermissionFlagsBits } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "ban",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Ban users from the server",
            ne: "सर्भरबाट प्रयोगकर्ताहरूलाई प्रतिबन्ध लगाउनुहोस्"
        },
        category: "moderation",
        guide: {
            en: "{prefix}ban <@user> [reason]\n{prefix}ban unban <@user>\n{prefix}ban list",
            ne: "{prefix}ban <@प्रयोगकर्ता> [कारण]\n{prefix}ban unban <@प्रयोगकर्ता>\n{prefix}ban list"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform (ban/unban/list)",
                type: 3,
                required: true,
                choices: [
                    { name: "ban", value: "ban" },
                    { name: "unban", value: "unban" },
                    { name: "list", value: "list" }
                ]
            },
            {
                name: "user",
                description: "User to ban or unban",
                type: 6,
                required: false
            },
            {
                name: "reason",
                description: "Reason for the ban",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noPermission: "❌ You need **Administrator** permission to use this command!",
            botNoPermission: "❌ I need **Ban Members** permission to ban users!",
            noUser: "❌ Please mention a user to ban!",
            noUserUnban: "❌ Please provide a user ID to unban!",
            cantBanSelf: "❌ You cannot ban yourself!",
            cantBanBot: "❌ You cannot ban me!",
            cantBanAdmin: "❌ You cannot ban administrators!",
            banSuccess: "✅ Successfully banned **%1**\n📝 Reason: %2",
            banError: "❌ Failed to ban user: %1",
            unbanSuccess: "✅ Successfully unbanned user with ID: **%1**",
            unbanError: "❌ Failed to unban user: %1",
            notBanned: "❌ This user is not banned!",
            bannedList: "📋 **Banned Users:**\n%1",
            noBans: "✅ No banned users in this server!",
            listError: "❌ Failed to fetch ban list: %1"
        },
        ne: {
            noPermission: "❌ तपाईंलाई यो आदेश प्रयोग गर्न **प्रशासक** अनुमति चाहिन्छ!",
            botNoPermission: "❌ मलाई प्रयोगकर्ताहरूलाई प्रतिबन्ध लगाउन **सदस्य प्रतिबन्ध** अनुमति चाहिन्छ!",
            noUser: "❌ कृपया प्रतिबन्ध लगाउन प्रयोगकर्ता उल्लेख गर्नुहोस्!",
            noUserUnban: "❌ कृपया अनब्यान गर्न प्रयोगकर्ता ID प्रदान गर्नुहोस्!",
            cantBanSelf: "❌ तपाईं आफैलाई प्रतिबन्ध लगाउन सक्नुहुन्न!",
            cantBanBot: "❌ तपाईं मलाई प्रतिबन्ध लगाउन सक्नुहुन्न!",
            cantBanAdmin: "❌ तपाईं प्रशासकहरूलाई प्रतिबन्ध लगाउन सक्नुहुन्न!",
            banSuccess: "✅ सफलतापूर्वक **%1** लाई प्रतिबन्ध लगाइयो\n📝 कारण: %2",
            banError: "❌ प्रयोगकर्तालाई प्रतिबन्ध लगाउन असफल: %1",
            unbanSuccess: "✅ सफलतापूर्वक ID: **%1** भएको प्रयोगकर्तालाई अनब्यान गरियो",
            unbanError: "❌ प्रयोगकर्तालाई अनब्यान गर्न असफल: %1",
            notBanned: "❌ यो प्रयोगकर्ता प्रतिबन्धित छैन!",
            bannedList: "📋 **प्रतिबन्धित प्रयोगकर्ताहरू:**\n%1",
            noBans: "✅ यो सर्भरमा कुनै प्रतिबन्धित प्रयोगकर्ताहरू छैनन्!",
            listError: "❌ प्रतिबन्ध सूची प्राप्त गर्न असफल: %1"
        }
    },

    onStart: async ({ message, interaction, args, getLang, guildsData }) => {
        const isInteraction = !!interaction;
        const source = isInteraction ? interaction : message;
        const member = isInteraction ? interaction.member : message.member;
        const guild = isInteraction ? interaction.guild : message.guild;

        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            const response = getLang("noPermission");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            const response = getLang("botNoPermission");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const action = isInteraction ? interaction.options.getString('action') : args[0];

        if (!action || action.toLowerCase() === 'ban') {
            const targetUser = isInteraction ? interaction.options.getUser('user') : message.mentions.users.first();
            const reason = isInteraction ? 
                (interaction.options.getString('reason') || 'No reason provided') : 
                (args.slice(1).join(' ') || 'No reason provided');

            if (!targetUser) {
                const response = getLang("noUser");
                return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }

            if (targetUser.id === member.id) {
                const response = getLang("cantBanSelf");
                return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }

            if (targetUser.id === guild.members.me.id) {
                const response = getLang("cantBanBot");
                return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }

            const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
            if (targetMember && targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
                const response = getLang("cantBanAdmin");
                return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }

            try {
                // Notify the user before banning
                try {
                    const dmEmbed = {
                        color: 0xFF0000,
                        title: '🔨 You Have Been Banned',
                        description: `You have been banned from **${guild.name}**`,
                        fields: [
                            { name: 'Reason', value: reason, inline: true },
                            { name: 'Moderator', value: member.user.tag, inline: true }
                        ],
                        footer: { text: 'You can appeal this ban if you believe it was unjust' },
                        timestamp: new Date()
                    };
                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (dmError) {
                    console.log(`Could not DM ${targetUser.tag} about ban`);
                }

                await guild.members.ban(targetUser.id, { reason: `${reason} - Banned by ${member.user.tag}` });

                const guildData = await guildsData.get(guild.id);
                if (!guildData.data.bans) {
                    guildData.data.bans = [];
                }
                guildData.data.bans.push({
                    userId: targetUser.id,
                    userName: targetUser.tag,
                    reason: reason,
                    bannedBy: member.id,
                    bannedAt: new Date().toISOString()
                });
                await guildsData.set(guild.id, guildData.data, 'data');

                const response = getLang("banSuccess", targetUser.tag, reason);
                return isInteraction ? interaction.reply(response) : message.reply(response);
            } catch (error) {
                const response = getLang("banError", error.message);
                return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }
        } else if (action.toLowerCase() === 'unban') {
            const userId = isInteraction ? 
                interaction.options.getUser('user')?.id : 
                (args[1] || message.mentions.users.first()?.id);

            if (!userId) {
                const response = getLang("noUserUnban");
                return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }

            try {
                await guild.members.unban(userId);

                const guildData = await guildsData.get(guild.id);
                if (guildData.data.bans) {
                    guildData.data.bans = guildData.data.bans.filter(ban => ban.userId !== userId);
                    await guildsData.set(guild.id, guildData.data, 'data');
                }

                const response = getLang("unbanSuccess", userId);
                return isInteraction ? interaction.reply(response) : message.reply(response);
            } catch (error) {
                if (error.code === 10026) {
                    const response = getLang("notBanned");
                    return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                }
                const response = getLang("unbanError", error.message);
                return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }
        } else if (action.toLowerCase() === 'list') {
            try {
                const bans = await guild.bans.fetch();
                if (bans.size === 0) {
                    const response = getLang("noBans");
                    return isInteraction ? interaction.reply(response) : message.reply(response);
                }

                const banList = Array.from(bans.values())
                    .map((ban, index) => `${index + 1}. **${ban.user.tag}** (${ban.user.id})\n   Reason: ${ban.reason || 'No reason'}`)
                    .join('\n\n');

                const response = getLang("bannedList", banList);
                return isInteraction ? interaction.reply(response) : message.reply(response);
            } catch (error) {
                const response = getLang("listError", error.message);
                return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }
        }
    }
};
