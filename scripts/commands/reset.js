
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    config: {
        name: "reset",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Reset database collections (Bot Owner Only)",
            ne: "डाटाबेस सङ्ग्रहहरू रिसेट गर्नुहोस् (बट मालिक मात्र)"
        },
        category: "owner",
        guide: {
            en: "{prefix}reset users - Reset all user data\n{prefix}reset guilds - Reset all guild data\n{prefix}reset stats - Reset command statistics\n{prefix}reset all - Reset entire database",
            ne: "{prefix}reset users - सबै प्रयोगकर्ता डाटा रिसेट गर्नुहोस्\n{prefix}reset guilds - सबै गिल्ड डाटा रिसेट गर्नुहोस्\n{prefix}reset stats - आदेश तथ्याङ्क रिसेट गर्नुहोस्\n{prefix}reset all - सम्पूर्ण डाटाबेस रिसेट गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "type",
                description: "What to reset",
                type: 3,
                required: true,
                choices: [
                    { name: "users", value: "users" },
                    { name: "guilds", value: "guilds" },
                    { name: "stats", value: "stats" },
                    { name: "all", value: "all" }
                ]
            }
        ]
    },

    langs: {
        en: {
            invalidType: "Invalid type! Use: users, guilds, stats, or all",
            confirmReset: "⚠️ **WARNING: This action is irreversible!**\n\nYou are about to reset: **%1**\n\nClick Confirm to proceed or Cancel to abort.\n\nThis will expire in 30 seconds.",
            cancelled: "❌ Database reset cancelled.",
            timeout: "⏱️ Reset confirmation timed out.",
            resetting: "🔄 Resetting %1...",
            usersReset: "✅ Successfully reset **%1** user records from database",
            guildsReset: "✅ Successfully reset **%1** guild records from database",
            statsReset: "✅ Successfully reset **%1** command statistics records from database",
            allReset: "✅ Successfully reset entire database:\n• Users: **%1** records\n• Guilds: **%2** records\n• Stats: **%3** records",
            error: "❌ Error resetting database: %1",
            recreatingGuilds: "🔄 Recreating current guild data...",
            guildsRecreated: "✅ Recreated data for **%1** current guilds",
            notYourRequest: "This is not your reset request!"
        },
        ne: {
            invalidType: "अमान्य प्रकार! प्रयोग गर्नुहोस्: users, guilds, stats, वा all",
            confirmReset: "⚠️ **चेतावनी: यो कार्य अपरिवर्तनीय छ!**\n\nतपाईं रिसेट गर्न लाग्दै हुनुहुन्छ: **%1**\n\nअगाडि बढ्न Confirm वा रद्द गर्न Cancel क्लिक गर्नुहोस्।\n\nयो ३० सेकेन्डमा समाप्त हुनेछ।",
            cancelled: "❌ डाटाबेस रिसेट रद्द गरियो।",
            timeout: "⏱️ रिसेट पुष्टिकरण समय समाप्त भयो।",
            resetting: "🔄 %1 रिसेट गर्दै...",
            usersReset: "✅ सफलतापूर्वक डाटाबेसबाट **%1** प्रयोगकर्ता रेकर्डहरू रिसेट गरियो",
            guildsReset: "✅ सफलतापूर्वक डाटाबेसबाट **%1** गिल्ड रेकर्डहरू रिसेट गरियो",
            statsReset: "✅ सफलतापूर्वक डाटाबेसबाट **%1** आदेश तथ्याङ्क रेकर्डहरू रिसेट गरियो",
            allReset: "✅ सफलतापूर्वक सम्पूर्ण डाटाबेस रिसेट गरियो:\n• प्रयोगकर्ताहरू: **%1** रेकर्डहरू\n• गिल्डहरू: **%2** रेकर्डहरू\n• तथ्याङ्क: **%3** रेकर्डहरू",
            error: "❌ डाटाबेस रिसेट गर्दा त्रुटि: %1",
            recreatingGuilds: "🔄 वर्तमान गिल्ड डाटा पुन: सिर्जना गर्दै...",
            guildsRecreated: "✅ **%1** वर्तमान गिल्डहरूको लागि डाटा पुन: सिर्जना गरियो",
            notYourRequest: "यो तपाईंको रिसेट अनुरोध होइन!"
        }
    },

    onStart: async ({ message, interaction, args, getLang, client }) => {
        const isSlash = !message;
        const user = isSlash ? interaction.user : message.author;

        const resetType = args?.[0] || interaction?.options?.getString('type');

        if (!resetType || !['users', 'guilds', 'stats', 'all'].includes(resetType.toLowerCase())) {
            const response = getLang("invalidType");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const type = resetType.toLowerCase();
        const typeDisplay = type === 'all' ? 'ALL DATABASE COLLECTIONS' : type.toUpperCase();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reset_confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('reset_cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );

        const confirmEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🚨 Database Reset Confirmation')
            .setDescription(getLang("confirmReset", typeDisplay))
            .setFooter({ text: 'This action cannot be undone!' })
            .setTimestamp();

        const reply = isSlash ? 
            await interaction.reply({ embeds: [confirmEmbed], components: [row], fetchReply: true }) : 
            await message.reply({ embeds: [confirmEmbed], components: [row] });

        const buttonHandler = async (btnInteraction) => {
            if (btnInteraction.user.id !== user.id) {
                return btnInteraction.reply({ content: getLang("notYourRequest"), ephemeral: true });
            }

            if (btnInteraction.customId === 'reset_cancel') {
                const cancelledEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setDescription(getLang("cancelled"))
                    .setTimestamp();

                await btnInteraction.update({ embeds: [cancelledEmbed], components: [] });
                
                global.RentoBot.onButton.delete('reset_confirm');
                global.RentoBot.onButton.delete('reset_cancel');
                return;
            }

            if (btnInteraction.customId === 'reset_confirm') {
                const resettingEmbed = new EmbedBuilder()
                    .setColor('#FFFF00')
                    .setDescription(getLang("resetting", typeDisplay))
                    .setTimestamp();

                await btnInteraction.update({ embeds: [resettingEmbed], components: [] });

                let userCount = 0;
                let guildCount = 0;
                let statsCount = 0;

                try {
                    switch (type) {
                        case 'users': {
                            userCount = global.db.allUserData.length;
                            await global.db.userModel.deleteMany({});
                            global.db.allUserData = [];

                            const successEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setDescription(getLang("usersReset", userCount))
                                .setTimestamp();

                            await btnInteraction.editReply({ embeds: [successEmbed] });
                            break;
                        }

                        case 'guilds': {
                            guildCount = global.db.allGuildData.length;
                            await global.db.guildModel.deleteMany({});
                            global.db.allGuildData = [];

                            const recreatingEmbed = new EmbedBuilder()
                                .setColor('#FFFF00')
                                .setDescription(getLang("recreatingGuilds"))
                                .setTimestamp();
                            await btnInteraction.editReply({ embeds: [recreatingEmbed] });

                            let recreatedCount = 0;
                            for (const [guildId, guild] of client.guilds.cache) {
                                await global.db.guildsData.create(guildId, guild.name);
                                recreatedCount++;
                            }

                            const successEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setDescription(getLang("guildsReset", guildCount) + '\n' + getLang("guildsRecreated", recreatedCount))
                                .setTimestamp();

                            await btnInteraction.editReply({ embeds: [successEmbed] });
                            break;
                        }

                        case 'stats': {
                            statsCount = global.db.allCommandStats.length;
                            await global.db.commandStatsModel.deleteMany({});
                            global.db.allCommandStats = [];

                            const successEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setDescription(getLang("statsReset", statsCount))
                                .setTimestamp();

                            await btnInteraction.editReply({ embeds: [successEmbed] });
                            break;
                        }

                        case 'all': {
                            userCount = global.db.allUserData.length;
                            guildCount = global.db.allGuildData.length;
                            statsCount = global.db.allCommandStats.length;

                            await global.db.userModel.deleteMany({});
                            await global.db.guildModel.deleteMany({});
                            await global.db.commandStatsModel.deleteMany({});

                            global.db.allUserData = [];
                            global.db.allGuildData = [];
                            global.db.allCommandStats = [];

                            const recreatingEmbed = new EmbedBuilder()
                                .setColor('#FFFF00')
                                .setDescription(getLang("recreatingGuilds"))
                                .setTimestamp();
                            await btnInteraction.editReply({ embeds: [recreatingEmbed] });

                            let recreatedCount = 0;
                            for (const [guildId, guild] of client.guilds.cache) {
                                await global.db.guildsData.create(guildId, guild.name);
                                recreatedCount++;
                            }

                            const successEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setDescription(getLang("allReset", userCount, guildCount, statsCount) + '\n' + getLang("guildsRecreated", recreatedCount))
                                .setTimestamp();

                            await btnInteraction.editReply({ embeds: [successEmbed] });
                            break;
                        }
                    }
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(getLang("error", error.message))
                        .setTimestamp();

                    await btnInteraction.editReply({ embeds: [errorEmbed] });
                }

                global.RentoBot.onButton.delete('reset_confirm');
                global.RentoBot.onButton.delete('reset_cancel');
            }
        };

        global.RentoBot.onButton.set('reset_confirm', buttonHandler);
        global.RentoBot.onButton.set('reset_cancel', buttonHandler);

        setTimeout(async () => {
            if (global.RentoBot.onButton.has('reset_confirm')) {
                global.RentoBot.onButton.delete('reset_confirm');
                global.RentoBot.onButton.delete('reset_cancel');

                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setDescription(getLang("timeout"))
                    .setTimestamp();

                try {
                    if (isSlash) {
                        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                    } else {
                        await reply.edit({ embeds: [timeoutEmbed], components: [] });
                    }
                } catch (err) {
                    console.error("Error editing reset timeout:", err);
                }
            }
        }, 30000);
    }
};
