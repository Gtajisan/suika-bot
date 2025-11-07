
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    config: {
        name: "appeal",
        aliases: ["unban-request", "appealban"],
        version: "1.0",
        author: "Samir",
        countDown: 60,
        role: 0,
        description: {
            en: "Appeal your ban from the bot",
            ne: "बटबाट आफ्नो प्रतिबन्धको अपील गर्नुहोस्"
        },
        category: "support",
        guide: {
            en: "{prefix}appeal <reason for appeal>\nExplain why you should be unbanned.",
            ne: "{prefix}appeal <अपीलको कारण>\nतपाईंलाई किन अनब्यान गर्नुपर्छ व्याख्या गर्नुहोस्।"
        },
        slash: true,
        options: [
            {
                name: "reason",
                description: "Reason for your appeal",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            notBanned: "❌ You are not banned from using this bot!",
            noReason: "❌ Please provide a reason for your appeal!",
            pendingAppeal: "⚠️ You already have a pending appeal. Please wait for a response from the administrators.",
            appealSent: "✅ Your appeal has been sent to the bot administrators!\n\n📩 **Appeal Details:**\n**User:** %1 (%2)\n**Original Ban Reason:** %3\n**Appeal Reason:** %4\n\nPlease wait for an administrator to review your appeal.",
            noAdmins: "❌ No bot administrators are configured!",
            sendError: "❌ Failed to send appeal. Please try again later.",
            appealNotification: "📨 New Ban Appeal",
            appealInfo: "**👤 User:** %1 (%2)\n**🚫 Original Ban Reason:** %3\n**📅 Banned On:** %4\n\n**📝 Appeal Reason:**\n%5",
            adminInstruction: "\n\n💡 **Click a button below to respond to this appeal.**",
            approved: "✅ Appeal Approved",
            approvedMessage: "🎉 **Good news!** Your ban appeal has been approved by an administrator.\n\n**Admin:** %1\n**Reason:** %2\n\nYou can now use the bot again!",
            disapproved: "❌ Appeal Denied",
            disapprovedMessage: "Unfortunately, your ban appeal has been denied by an administrator.\n\n**Admin:** %1\n**Reason:** %2\n\nYour ban remains in effect.",
            alreadyProcessed: "⚠️ This appeal has already been processed.",
            approveSuccess: "✅ Appeal approved and user unbanned!",
            disapproveSuccess: "✅ Appeal denied. User remains banned.",
            processError: "❌ Error processing appeal: %1"
        },
        ne: {
            notBanned: "❌ तपाईं यो बट प्रयोग गर्नबाट प्रतिबन्धित हुनुहुन्न!",
            noReason: "❌ कृपया आफ्नो अपीलको लागि कारण प्रदान गर्नुहोस्!",
            pendingAppeal: "⚠️ तपाईंसँग पहिले नै पेन्डिङ अपील छ। कृपया प्रशासकहरूबाट प्रतिक्रियाको लागि पर्खनुहोस्।",
            appealSent: "✅ तपाईंको अपील बट प्रशासकहरूलाई पठाइयो!\n\n📩 **अपील विवरण:**\n**प्रयोगकर्ता:** %1 (%2)\n**मूल प्रतिबन्ध कारण:** %3\n**अपील कारण:** %4\n\nकृपया प्रशासकले तपाईंको अपील समीक्षा गर्नको लागि पर्खनुहोस्।",
            noAdmins: "❌ कुनै बट प्रशासकहरू कन्फिगर गरिएको छैन!",
            sendError: "❌ अपील पठाउन असफल भयो। कृपया पछि पुन: प्रयास गर्नुहोस्।",
            appealNotification: "📨 नयाँ प्रतिबन्ध अपील",
            appealInfo: "**👤 प्रयोगकर्ता:** %1 (%2)\n**🚫 मूल प्रतिबन्ध कारण:** %3\n**📅 प्रतिबन्धित मिति:** %4\n\n**📝 अपील कारण:**\n%5",
            adminInstruction: "\n\n💡 **यो अपीलको जवाफ दिन तलको बटन क्लिक गर्नुहोस्।**",
            approved: "✅ अपील स्वीकृत",
            approvedMessage: "🎉 **शुभ समाचार!** तपाईंको प्रतिबन्ध अपील प्रशासकद्वारा स्वीकृत गरिएको छ।\n\n**प्रशासक:** %1\n**कारण:** %2\n\nतपाईं अब फेरि बट प्रयोग गर्न सक्नुहुन्छ!",
            disapproved: "❌ अपील अस्वीकृत",
            disapprovedMessage: "दुर्भाग्यवश, तपाईंको प्रतिबन्ध अपील प्रशासकद्वारा अस्वीकृत गरिएको छ।\n\n**प्रशासक:** %1\n**कारण:** %2\n\nतपाईंको प्रतिबन्ध प्रभावमा रहन्छ।",
            alreadyProcessed: "⚠️ यो अपील पहिले नै प्रशोधन गरिएको छ।",
            approveSuccess: "✅ अपील स्वीकृत र प्रयोगकर्ता अनब्यान गरियो!",
            disapproveSuccess: "✅ अपील अस्वीकृत। प्रयोगकर्ता प्रतिबन्धित रहन्छ।",
            processError: "❌ अपील प्रशोधन गर्दा त्रुटि: %1"
        }
    },

    onStart: async ({ message, interaction, args, getLang, client, usersData }) => {
        const isSlash = !message;
        const user = isSlash ? interaction.user : message.author;
        const appealReason = isSlash ? interaction.options.getString("reason") : args.join(" ");

        const userData = await usersData.get(user.id);

        if (!userData.banned.status) {
            const response = getLang("notBanned");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (!appealReason) {
            const response = getLang("noReason");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (userData.data?.pendingAppeal) {
            const response = getLang("pendingAppeal");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const config = global.RentoBot?.config;
        if (!config?.bot?.adminBot?.length) {
            const response = getLang("noAdmins");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const appealId = `APPEAL-${Date.now()}-${user.id}`;

        await usersData.set(user.id, {
            pendingAppeal: true,
            appealId: appealId
        }, 'data');

        const embed = new EmbedBuilder()
            .setTitle(getLang("appealNotification"))
            .setDescription(getLang(
                "appealInfo",
                user.tag,
                user.id,
                userData.banned.reason || "No reason provided",
                userData.banned.date ? new Date(userData.banned.date).toLocaleString() : "Unknown",
                appealReason
            ))
            .setColor(0xFFA500)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Appeal ID: ${appealId}` })
            .setTimestamp();

        embed.setDescription(embed.data.description + getLang("adminInstruction"));

        const approveButton = new ButtonBuilder()
            .setCustomId(`appeal_approve_${user.id}`)
            .setLabel("✅ Approve")
            .setStyle(ButtonStyle.Success);

        const disapproveButton = new ButtonBuilder()
            .setCustomId(`appeal_disapprove_${user.id}`)
            .setLabel("❌ Deny")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(approveButton, disapproveButton);

        let sentCount = 0;
        for (const adminId of config.bot.adminBot) {
            try {
                const admin = await client.users.fetch(adminId);
                await admin.send({
                    embeds: [embed],
                    components: [row]
                });
                sentCount++;
            } catch (error) {
                console.error(`Failed to DM admin ${adminId}:`, error);
            }
        }

        if (sentCount === 0) {
            await usersData.set(user.id, { pendingAppeal: false }, 'data');
            const response = getLang("sendError");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const successEmbed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle("✅ Appeal Submitted")
            .setDescription(getLang(
                "appealSent",
                user.tag,
                user.id,
                userData.banned.reason || "No reason provided",
                appealReason
            ))
            .setFooter({ text: `Appeal ID: ${appealId}` })
            .setTimestamp();

        return isSlash 
            ? interaction.reply({ embeds: [successEmbed], ephemeral: true })
            : message.reply({ embeds: [successEmbed] });
    },

    onButton: async ({ interaction, getLang, usersData, client }) => {
        const [action, type, userId] = interaction.customId.split('_');

        if (action !== 'appeal') return;

        try {
            const userData = await usersData.get(userId);

            if (!userData.data?.pendingAppeal) {
                return interaction.reply({ 
                    content: getLang("alreadyProcessed"), 
                    ephemeral: true 
                });
            }

            const adminUser = interaction.user;

            const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
            const modal = new ModalBuilder()
                .setCustomId(`appeal_reason_${type}_${userId}`)
                .setTitle(type === 'approve' ? 'Approve Appeal' : 'Deny Appeal');

            const reasonInput = new TextInputBuilder()
                .setCustomId('reason')
                .setLabel(type === 'approve' ? 'Reason (optional)' : 'Reason for denial')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder(type === 'approve' ? 'Optional reason for approval...' : 'Required reason for denial...')
                .setRequired(type === 'disapprove')
                .setMaxLength(500);

            const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);

            global.RentoBot.onModal.set(`appeal_reason_${type}_${userId}`, async (modalInteraction) => {
                const reason = modalInteraction.fields.getTextInputValue('reason') || 'No reason provided';

                try {
                    const targetUser = await client.users.fetch(userId);

                    if (type === 'approve') {
                        await usersData.set(userId, {
                            banned: {
                                status: false,
                                reason: "",
                                date: ""
                            },
                            data: {
                                ...userData.data,
                                pendingAppeal: false,
                                appealId: null,
                                lastAppeal: {
                                    result: 'approved',
                                    adminId: adminUser.id,
                                    adminTag: adminUser.tag,
                                    reason: reason,
                                    date: new Date().toISOString()
                                }
                            }
                        });

                        const userEmbed = new EmbedBuilder()
                            .setTitle(getLang("approved"))
                            .setDescription(getLang("approvedMessage", adminUser.tag, reason))
                            .setColor(0x57F287)
                            .setTimestamp();

                        await targetUser.send({ embeds: [userEmbed] }).catch(() => {});

                        const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                            .setColor(0x57F287)
                            .setFooter({ text: `✅ Approved by ${adminUser.tag} | ${new Date().toLocaleString()}` });

                        await interaction.message.edit({ 
                            embeds: [originalEmbed], 
                            components: [] 
                        });

                        await modalInteraction.reply({ 
                            content: getLang("approveSuccess"), 
                            ephemeral: true 
                        });

                    } else {
                        await usersData.set(userId, {
                            pendingAppeal: false,
                            appealId: null,
                            lastAppeal: {
                                result: 'denied',
                                adminId: adminUser.id,
                                adminTag: adminUser.tag,
                                reason: reason,
                                date: new Date().toISOString()
                            }
                        }, 'data');

                        const userEmbed = new EmbedBuilder()
                            .setTitle(getLang("disapproved"))
                            .setDescription(getLang("disapprovedMessage", adminUser.tag, reason))
                            .setColor(0xFF0000)
                            .setTimestamp();

                        await targetUser.send({ embeds: [userEmbed] }).catch(() => {});

                        const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                            .setColor(0xFF0000)
                            .setFooter({ text: `❌ Denied by ${adminUser.tag} | ${new Date().toLocaleString()}` });

                        await interaction.message.edit({ 
                            embeds: [originalEmbed], 
                            components: [] 
                        });

                        await modalInteraction.reply({ 
                            content: getLang("disapproveSuccess"), 
                            ephemeral: true 
                        });
                    }
                } catch (error) {
                    console.error("Error processing appeal:", error);
                    await modalInteraction.reply({ 
                        content: getLang("processError", error.message), 
                        ephemeral: true 
                    });
                }
            });

        } catch (error) {
            console.error("Error in appeal button handler:", error);
            return interaction.reply({ 
                content: getLang("processError", error.message), 
                ephemeral: true 
            });
        }
    }
};
