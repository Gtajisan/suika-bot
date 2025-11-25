const { PermissionFlagsBits } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "mute",
        aliases: ["timeout"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Timeout/mute users for a specified duration",
            ne: "निर्दिष्ट अवधिको लागि प्रयोगकर्ताहरूलाई टाइमआउट/म्युट गर्नुहोस्"
        },
        category: "moderation",
        guide: {
            en: "{prefix}mute <@user> <duration> [reason]\n{prefix}mute unmute <@user>\nDuration format: 1m, 30m, 1h, 2d (minutes, hours, days)",
            ne: "{prefix}mute <@प्रयोगकर्ता> <अवधि> [कारण]\n{prefix}mute unmute <@प्रयोगकर्ता>\nअवधि ढाँचा: 1m, 30m, 1h, 2d (मिनेट, घण्टा, दिन)"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform (mute/unmute)",
                type: 3,
                required: true,
                choices: [
                    { name: "mute", value: "mute" },
                    { name: "unmute", value: "unmute" }
                ]
            },
            {
                name: "user",
                description: "User to mute or unmute",
                type: 6,
                required: true
            },
            {
                name: "duration",
                description: "Duration (e.g., 10m, 1h, 2d)",
                type: 3,
                required: false
            },
            {
                name: "reason",
                description: "Reason for the timeout",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noPermission: "❌ You need **Moderate Members** permission to use this command!",
            botNoPermission: "❌ I need **Moderate Members** permission to timeout users!",
            noUser: "❌ Please mention a user to mute!",
            noDuration: "❌ Please specify a duration! (e.g., 10m, 1h, 2d)",
            invalidDuration: "❌ Invalid duration format! Use: 10m, 1h, 2d (max 28 days)",
            cantMuteSelf: "❌ You cannot mute yourself!",
            cantMuteBot: "❌ You cannot mute me!",
            cantMuteAdmin: "❌ You cannot mute administrators!",
            higherRole: "❌ You cannot mute someone with a higher or equal role!",
            botHigherRole: "❌ I cannot mute someone with a higher or equal role than mine!",
            muteSuccess: "🔇 **%1** has been muted for **%2**\n📝 Reason: %3",
            muteError: "❌ Failed to mute user: %1",
            unmuteSuccess: "🔊 **%1** has been unmuted!",
            unmuteError: "❌ Failed to unmute user: %1",
            notMuted: "❌ This user is not muted!"
        },
        ne: {
            noPermission: "❌ तपाईंलाई यो आदेश प्रयोग गर्न **सदस्य मध्यस्थ गर्ने** अनुमति चाहिन्छ!",
            botNoPermission: "❌ मलाई प्रयोगकर्ताहरूलाई टाइमआउट गर्न **सदस्य मध्यस्थ गर्ने** अनुमति चाहिन्छ!",
            noUser: "❌ कृपया म्युट गर्न प्रयोगकर्ता उल्लेख गर्नुहोस्!",
            noDuration: "❌ कृपया अवधि निर्दिष्ट गर्नुहोस्! (उदाहरण: 10m, 1h, 2d)",
            invalidDuration: "❌ अमान्य अवधि ढाँचा! प्रयोग गर्नुहोस्: 10m, 1h, 2d (अधिकतम २८ दिन)",
            cantMuteSelf: "❌ तपाईं आफैंलाई म्युट गर्न सक्नुहुन्न!",
            cantMuteBot: "❌ तपाईं मलाई म्युट गर्न सक्नुहुन्न!",
            cantMuteAdmin: "❌ तपाईं प्रशासकहरूलाई म्युट गर्न सक्नुहुन्न!",
            higherRole: "❌ तपाईं उच्च वा बराबर भूमिका भएको कसैलाई म्युट गर्न सक्नुहुन्न!",
            botHigherRole: "❌ म मेरो भन्दा उच्च वा बराबर भूमिका भएको कसैलाई म्युट गर्न सक्दिन!",
            muteSuccess: "🔇 **%1** लाई **%2** को लागि म्युट गरियो\n📝 कारण: %3",
            muteError: "❌ प्रयोगकर्ता म्युट गर्न असफल: %1",
            unmuteSuccess: "🔊 **%1** लाई अनम्युट गरियो!",
            unmuteError: "❌ प्रयोगकर्ता अनम्युट गर्न असफल: %1",
            notMuted: "❌ यो प्रयोगकर्ता म्युट गरिएको छैन!"
        }
    },

    parseDuration(duration) {
        const regex = /^(\d+)([mhd])$/;
        const match = duration.toLowerCase().match(regex);
        
        if (!match) return null;
        
        const value = parseInt(match[1]);
        const unit = match[2];
        
        let milliseconds = 0;
        switch (unit) {
            case 'm':
                milliseconds = value * 60 * 1000;
                break;
            case 'h':
                milliseconds = value * 60 * 60 * 1000;
                break;
            case 'd':
                milliseconds = value * 24 * 60 * 60 * 1000;
                break;
        }
        
        const maxDuration = 28 * 24 * 60 * 60 * 1000;
        if (milliseconds > maxDuration || milliseconds < 1000) {
            return null;
        }
        
        return milliseconds;
    },

    formatDuration(ms) {
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        
        return parts.join(' ') || '0m';
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        const isInteraction = !!interaction;
        const member = isInteraction ? interaction.member : message.member;
        const guild = isInteraction ? interaction.guild : message.guild;

        if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const response = getLang("noPermission");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const response = getLang("botNoPermission");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        const action = isInteraction ? interaction.options.getString('action') : (args[0] || 'mute');

        const targetUser = isInteraction ? 
            interaction.options.getUser('user') : 
            message.mentions.users.first();

        if (!targetUser) {
            const response = getLang("noUser");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
        
        if (!targetMember) {
            const response = "❌ User is not in this server!";
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        if (targetUser.id === member.id) {
            const response = getLang("cantMuteSelf");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        if (targetUser.id === guild.members.me.id) {
            const response = getLang("cantMuteBot");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
            const response = getLang("cantMuteAdmin");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        const config = global.RentoBot?.config;
        const isOwner = config?.bot?.adminBot?.includes(member.id);
        
        if (!isOwner && targetMember.roles.highest.position >= member.roles.highest.position) {
            const response = getLang("higherRole");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        if (targetMember.roles.highest.position >= guild.members.me.roles.highest.position) {
            const response = getLang("botHigherRole");
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        if (action.toLowerCase() === 'unmute') {
            try {
                await targetMember.timeout(null);
                
                // Notify the user
                try {
                    const dmEmbed = {
                        color: 0x00FF00,
                        title: '🔊 You Have Been Unmuted',
                        description: `You have been unmuted in **${guild.name}**`,
                        fields: [
                            { name: 'Moderator', value: member.user.tag, inline: true }
                        ],
                        timestamp: new Date()
                    };
                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (dmError) {
                    console.log(`Could not DM ${targetUser.tag} about unmute`);
                }

                const response = getLang("unmuteSuccess", targetUser.tag);
                return isInteraction ? ctx.reply(response) : ctx.reply(response);
            } catch (error) {
                if (targetMember.communicationDisabledUntilTimestamp === null) {
                    const response = getLang("notMuted");
                    return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                }
                const response = getLang("unmuteError", error.message);
                return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
            }
        } else {
            const durationStr = isInteraction ? 
                interaction.options.getString('duration') : 
                args[1];
            
            const reason = isInteraction ? 
                (interaction.options.getString('reason') || 'No reason provided') : 
                (args.slice(2).join(' ') || 'No reason provided');

            if (!durationStr) {
                const response = getLang("noDuration");
                return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
            }

            const duration = module.exports.parseDuration(durationStr);
            if (!duration) {
                const response = getLang("invalidDuration");
                return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
            }

            try {
                await targetMember.timeout(duration, `${reason} - Muted by ${member.user.tag}`);
                
                // Notify the user
                try {
                    const dmEmbed = {
                        color: 0xFF9900,
                        title: '🔇 You Have Been Muted',
                        description: `You have been muted in **${guild.name}**`,
                        fields: [
                            { name: 'Duration', value: module.exports.formatDuration(duration), inline: true },
                            { name: 'Reason', value: reason, inline: true },
                            { name: 'Moderator', value: member.user.tag, inline: true }
                        ],
                        timestamp: new Date()
                    };
                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (dmError) {
                    console.log(`Could not DM ${targetUser.tag} about mute`);
                }

                const response = getLang("muteSuccess", targetUser.tag, module.exports.formatDuration(duration), reason);
                return isInteraction ? ctx.reply(response) : ctx.reply(response);
            } catch (error) {
                const response = getLang("muteError", error.message);
                return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
            }
        }
    }
};
