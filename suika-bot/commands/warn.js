
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "warn",
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Warn users and track warnings per guild",
            ne: "प्रयोगकर्ताहरूलाई चेतावनी दिनुहोस् र प्रति गिल्ड चेतावनीहरू ट्र्याक गर्नुहोस्"
        },
        category: "moderation",
        guide: {
            en: "{prefix}warn <@user> [reason] - Warn a user\n{prefix}warn list [@user] - List warnings\n{prefix}warn remove <@user> [number] - Remove a warning\n{prefix}warn reset - Reset all warnings",
            ne: "{prefix}warn <@प्रयोगकर्ता> [कारण] - प्रयोगकर्तालाई चेतावनी दिनुहोस्\n{prefix}warn list [@प्रयोगकर्ता] - चेतावनीहरू सूचीबद्ध गर्नुहोस्\n{prefix}warn remove <@प्रयोगकर्ता> [संख्या] - चेतावनी हटाउनुहोस्\n{prefix}warn reset - सबै चेतावनीहरू रिसेट गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform",
                type: 3,
                required: true,
                choices: [
                    { name: "add", value: "add" },
                    { name: "list", value: "list" },
                    { name: "remove", value: "remove" },
                    { name: "reset", value: "reset" }
                ]
            },
            {
                name: "user",
                description: "User to warn or check",
                type: 6,
                required: false
            },
            {
                name: "reason",
                description: "Reason for the warning",
                type: 3,
                required: false
            },
            {
                name: "number",
                description: "Warning number to remove",
                type: 4,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noPermission: "You need **Moderate Members** permission to use this command!",
            botNoPermission: "I need **Kick Members** permission to kick users after 3 warnings!",
            guildOnly: "This command can only be used in a server!",
            noUser: "Please mention a user to warn!",
            cantWarnSelf: "You cannot warn yourself!",
            cantWarnBot: "You cannot warn me!",
            cantWarnAdmin: "You cannot warn administrators!",
            userNotInGuild: "User is not in this server!",
            warnSuccess: "User Warned",
            warnedUser: "Warned User",
            warnReason: "Reason",
            totalWarnings: "Total Warnings",
            warnedBy: "Warned By",
            noReasonProvided: "No reason provided",
            warnKick: "User Kicked",
            kickedUser: "Kicked User",
            kickReason: "User received 3 warnings",
            lastReason: "Last Reason",
            warnError: "Failed to warn user: %1",
            noWarnings: "No warnings found for this user in this server!",
            userWarnings: "Warnings for %1",
            allWarnings: "All Warnings in Server",
            noWarningsServer: "No warnings in this server!",
            removeSuccess: "Warning Removed",
            warningNumber: "Warning #%1",
            removedFrom: "Removed From",
            removeError: "Failed to remove warning: %1",
            invalidNumber: "Invalid warning number! User has %1 warnings in this server.",
            resetSuccess: "All Warnings Reset",
            resetDesc: "All warnings in this server have been cleared!",
            resetError: "Failed to reset warnings: %1",
            dmWarnTitle: "You have been warned in %1",
            dmWarnDesc: "A moderator has issued you a warning.",
            dmKickTitle: "You have been kicked from %1",
            dmKickDesc: "You received 3 warnings and have been kicked from the server.",
            dmRemoveTitle: "Warning Removed in %1",
            dmRemoveDesc: "A warning has been removed from your record."
        },
        ne: {
            noPermission: "तपाईंलाई यो आदेश प्रयोग गर्न **सदस्य संयमित** अनुमति चाहिन्छ!",
            botNoPermission: "मलाई ३ चेतावनी पछि प्रयोगकर्ताहरूलाई किक गर्न **सदस्य किक** अनुमति चाहिन्छ!",
            guildOnly: "यो आदेश केवल सर्भरमा प्रयोग गर्न सकिन्छ!",
            noUser: "कृपया चेतावनी दिन प्रयोगकर्ता उल्लेख गर्नुहोस्!",
            cantWarnSelf: "तपाईं आफैंलाई चेतावनी दिन सक्नुहुन्न!",
            cantWarnBot: "तपाईं मलाई चेतावनी दिन सक्नुहुन्न!",
            cantWarnAdmin: "तपाईं प्रशासकहरूलाई चेतावनी दिन सक्नुहुन्न!",
            userNotInGuild: "प्रयोगकर्ता यो सर्भरमा छैन!",
            warnSuccess: "प्रयोगकर्तालाई चेतावनी दिइयो",
            warnedUser: "चेतावनी दिइएको प्रयोगकर्ता",
            warnReason: "कारण",
            totalWarnings: "कुल चेतावनीहरू",
            warnedBy: "द्वारा चेतावनी",
            noReasonProvided: "कुनै कारण प्रदान गरिएको छैन",
            warnKick: "प्रयोगकर्ता किक गरियो",
            kickedUser: "किक गरिएको प्रयोगकर्ता",
            kickReason: "प्रयोगकर्ताले ३ चेतावनी प्राप्त गर्यो",
            lastReason: "अन्तिम कारण",
            warnError: "प्रयोगकर्तालाई चेतावनी दिन असफल: %1",
            noWarnings: "यस सर्भरमा यस प्रयोगकर्ताको लागि कुनै चेतावनी फेला परेन!",
            userWarnings: "%1 को चेतावनीहरू",
            allWarnings: "सर्भरमा सबै चेतावनीहरू",
            noWarningsServer: "यो सर्भरमा कुनै चेतावनी छैन!",
            removeSuccess: "चेतावनी हटाइयो",
            warningNumber: "चेतावनी #%1",
            removedFrom: "बाट हटाइयो",
            removeError: "चेतावनी हटाउन असफल: %1",
            invalidNumber: "अमान्य चेतावनी संख्या! यस सर्भरमा प्रयोगकर्तासँग %1 चेतावनीहरू छन्।",
            resetSuccess: "सबै चेतावनीहरू रिसेट गरियो",
            resetDesc: "यस सर्भरमा सबै चेतावनीहरू खाली गरिएको छ!",
            resetError: "चेतावनीहरू रिसेट गर्न असफल: %1",
            dmWarnTitle: "तपाईंलाई %1 मा चेतावनी दिइयो",
            dmWarnDesc: "एक मध्यस्थले तपाईंलाई चेतावनी जारी गरेको छ।",
            dmKickTitle: "तपाईंलाई %1 बाट किक गरियो",
            dmKickDesc: "तपाईंले ३ चेतावनी प्राप्त गर्नुभयो र सर्भरबाट किक गरिएको छ।",
            dmRemoveTitle: "%1 मा चेतावनी हटाइयो",
            dmRemoveDesc: "तपाईंको रेकर्डबाट एक चेतावनी हटाइएको छ।"
        }
    },

    onStart: async ({ message, interaction, args, getLang, guildsData, usersData }) => {
        const isInteraction = !!interaction;
        const member = isInteraction ? interaction.member : message?.member;
        const guild = isInteraction ? interaction.guild : message?.guild;

        if (!guild) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`❌ ${getLang("guildOnly")}`);
            return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
        }

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`❌ ${getLang("guildOnly")}`);
            return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
        }

        if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`❌ ${getLang("noPermission")}`);
            return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
        }

        const action = isInteraction ? interaction.options.getString('action') : (args[0] || 'add');

        if (action === 'add' || !['list', 'remove', 'reset'].includes(action.toLowerCase())) {
            const targetUser = isInteraction ? 
                interaction.options.getUser('user') : 
                message.mentions.users.first();
            
            const reason = isInteraction ? 
                (interaction.options.getString('reason') || getLang("noReasonProvided")) : 
                (args.slice(1).join(' ') || getLang("noReasonProvided"));

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("noUser")}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }

            if (targetUser.id === member.id) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("cantWarnSelf")}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }

            if (targetUser.id === guild.members.me.id) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("cantWarnBot")}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }

            const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
            if (!targetMember) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("userNotInGuild")}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }

            if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("cantWarnAdmin")}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }

            try {
                let guildData = await guildsData.get(guild.id);
                
                if (!guildData.data.warnings) {
                    guildData.data.warnings = {};
                }

                if (!guildData.data.warnings[targetUser.id]) {
                    guildData.data.warnings[targetUser.id] = [];
                }

                guildData.data.warnings[targetUser.id].push({
                    reason: reason,
                    warnedBy: member.id,
                    warnedAt: new Date().toISOString()
                });

                await guildsData.set(guild.id, guildData.data.warnings, 'data.warnings');

                guildData = await guildsData.get(guild.id);
                const warningCount = (guildData.data.warnings[targetUser.id] || []).length;

                if (warningCount >= 3) {
                    if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription(`❌ ${getLang("botNoPermission")}`);
                        return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
                    }
                    
                    try {
                        const dmEmbed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle(`🔨 ${getLang("dmKickTitle", guild.name)}`)
                            .setDescription(getLang("dmKickDesc"))
                            .addFields(
                                { name: getLang("lastReason"), value: reason, inline: false }
                            )
                            .setTimestamp();

                        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {});

                        await targetMember.kick(`3 warnings reached - Last reason: ${reason}`);

                        const kickEmbed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle(`🔨 ${getLang("warnKick")}`)
                            .addFields(
                                { name: getLang("kickedUser"), value: `${targetUser.tag}`, inline: true },
                                { name: getLang("warnReason"), value: getLang("kickReason"), inline: true },
                                { name: getLang("lastReason"), value: reason, inline: false }
                            )
                            .setThumbnail(targetUser.displayAvatarURL())
                            .setTimestamp();

                        return isInteraction ? interaction.reply({ embeds: [kickEmbed] }) : message.reply({ embeds: [kickEmbed] });
                    } catch (error) {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription(`❌ ${getLang("warnError", error.message)}`);
                        return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
                    }
                } else {
                    const dmEmbed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle(`⚠️ ${getLang("dmWarnTitle", guild.name)}`)
                        .setDescription(getLang("dmWarnDesc"))
                        .addFields(
                            { name: getLang("warnReason"), value: reason, inline: false },
                            { name: getLang("totalWarnings"), value: `${warningCount}/3`, inline: true },
                            { name: getLang("warnedBy"), value: `${member.user.tag}`, inline: true }
                        )
                        .setTimestamp();

                    await targetUser.send({ embeds: [dmEmbed] }).catch(() => {});

                    const warnEmbed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle(`⚠️ ${getLang("warnSuccess")}`)
                        .addFields(
                            { name: getLang("warnedUser"), value: `${targetUser.tag}`, inline: true },
                            { name: getLang("warnReason"), value: reason, inline: false },
                            { name: getLang("totalWarnings"), value: `${warningCount}/3`, inline: true },
                            { name: getLang("warnedBy"), value: `${member.user.tag}`, inline: true }
                        )
                        .setThumbnail(targetUser.displayAvatarURL())
                        .setTimestamp();

                    return isInteraction ? interaction.reply({ embeds: [warnEmbed] }) : message.reply({ embeds: [warnEmbed] });
                }
            } catch (error) {
                console.error('Warn command error:', error);
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("warnError", error.message)}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }
        } else if (action.toLowerCase() === 'list') {
            const targetUser = isInteraction ? 
                interaction.options.getUser('user') : 
                message.mentions.users.first();

            try {
                const guildData = await guildsData.get(guild.id);
                const allWarnings = guildData.data.warnings || {};

                if (targetUser) {
                    const warnings = allWarnings[targetUser.id] || [];

                    if (warnings.length === 0) {
                        const embed = new EmbedBuilder()
                            .setColor(0x00FF00)
                            .setDescription(`✅ ${getLang("noWarnings")}`);
                        return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                    }

                    const embed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle(`⚠️ ${getLang("userWarnings", targetUser.tag)}`)
                        .setThumbnail(targetUser.displayAvatarURL());

                    warnings.forEach((w, i) => {
                        embed.addFields({
                            name: `${i + 1}. ${getLang("warnReason")}`,
                            value: `**${w.reason}**\n${getLang("warnedBy")}: <@${w.warnedBy}>\n📅 ${new Date(w.warnedAt).toLocaleDateString()}`,
                            inline: false
                        });
                    });

                    embed.addFields({ name: getLang("totalWarnings"), value: `${warnings.length}`, inline: true });

                    return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                } else {
                    const userIds = Object.keys(allWarnings).filter(id => allWarnings[id] && allWarnings[id].length > 0);

                    if (userIds.length === 0) {
                        const embed = new EmbedBuilder()
                            .setColor(0x00FF00)
                            .setDescription(`✅ ${getLang("noWarningsServer")}`);
                        return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                    }

                    const embed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle(`⚠️ ${getLang("allWarnings")}`);

                    for (const userId of userIds) {
                        const user = await global.RentoBot.client.users.fetch(userId).catch(() => null);
                        const warningCount = allWarnings[userId].length;
                        embed.addFields({
                            name: user?.tag || userId,
                            value: `${warningCount} ${getLang("totalWarnings").toLowerCase()}`,
                            inline: true
                        });
                    }

                    return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                }
            } catch (error) {
                console.error('Warn list error:', error);
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("warnError", error.message)}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }
        } else if (action.toLowerCase() === 'remove') {
            const targetUser = isInteraction ? 
                interaction.options.getUser('user') : 
                message.mentions.users.first();
            
            const warningNum = isInteraction ? 
                interaction.options.getInteger('number') : 
                parseInt(args[2]);

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("noUser")}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }

            try {
                let guildData = await guildsData.get(guild.id);
                const allWarnings = guildData.data.warnings || {};
                const warnings = allWarnings[targetUser.id] || [];

                if (warnings.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`❌ ${getLang("noWarnings")}`);
                    return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
                }

                const removeIndex = warningNum ? warningNum - 1 : warnings.length - 1;

                if (removeIndex < 0 || removeIndex >= warnings.length) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`❌ ${getLang("invalidNumber", warnings.length)}`);
                    return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
                }

                warnings.splice(removeIndex, 1);
                
                if (!guildData.data.warnings) {
                    guildData.data.warnings = {};
                }

                if (warnings.length === 0) {
                    delete guildData.data.warnings[targetUser.id];
                } else {
                    guildData.data.warnings[targetUser.id] = warnings;
                }

                await guildsData.set(guild.id, guildData.data.warnings, 'data.warnings');

                const dmEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle(`✅ ${getLang("dmRemoveTitle", guild.name)}`)
                    .setDescription(getLang("dmRemoveDesc"))
                    .addFields(
                        { name: getLang("warningNumber", removeIndex + 1), value: getLang("removedFrom") + " " + member.user.tag, inline: false }
                    )
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] }).catch(() => {});

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle(`✅ ${getLang("removeSuccess")}`)
                    .addFields(
                        { name: getLang("warningNumber", removeIndex + 1), value: getLang("removedFrom"), inline: true },
                        { name: getLang("warnedUser"), value: targetUser.tag, inline: true }
                    )
                    .setThumbnail(targetUser.displayAvatarURL())
                    .setTimestamp();

                return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Warn remove error:', error);
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("removeError", error.message)}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }
        } else if (action.toLowerCase() === 'reset') {
            try {
                await guildsData.set(guild.id, {}, 'data.warnings');

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle(`✅ ${getLang("resetSuccess")}`)
                    .setDescription(getLang("resetDesc"))
                    .setTimestamp();

                return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Warn reset error:', error);
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`❌ ${getLang("resetError", error.message)}`);
                return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
            }
        }
    }
};
