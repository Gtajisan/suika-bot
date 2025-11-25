
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "callad",
        aliases: ["calladmin", "reportad", "reportadmin"],
        version: "1.2",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Directly contact bot administrators",
            ne: "बट प्रशासकहरूलाई सिधै सम्पर्क गर्नुहोस्"
        },
        category: "support",
        guide: {
            en: "{prefix}callad <your message>\nYou can also attach images or files by replying to the bot's message.",
            ne: "{prefix}callad <तपाईंको सन्देश>\nतपाईं बटको सन्देशको जवाफ दिएर छविहरू वा फाइलहरू पनि संलग्न गर्न सक्नुहुन्छ।"
        },
        slash: true,
        options: [
            {
                name: "message",
                description: "Message to send to bot administrators",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noMessage: "❌ Please provide a message to send to the admins!",
            sentSuccess: "✅ Your message has been sent to the bot administrators!\n📩 **Conversation ID:** `%1`\nThey will reply as soon as possible.\n\n💡 **Tip:** Reply to this message to continue the conversation with attachments.",
            adminNotification: "📩 New Message from User",
            userInfo: "**👤 User:** %1 (%2)\n**🏠 Guild:** %3\n**💬 Message:**\n%4",
            replyInstruction: "\n\n💡 **Reply to this message** to respond to the user.",
            adminReply: "📬 Response from Bot Admin",
            userReply: "📬 Reply from User",
            noAdmins: "❌ No bot administrators are configured!",
            sendError: "❌ Failed to send message to admins. Please try again later.",
            replySent: "✅ Your reply has been sent!",
            replyError: "❌ Failed to send reply. The user may have blocked DMs or is unavailable.",
            conversationContinued: "💬 Conversation continues..."
        },
        ne: {
            noMessage: "❌ कृपया प्रशासकहरूलाई पठाउन सन्देश प्रदान गर्नुहोस्!",
            sentSuccess: "✅ तपाईंको सन्देश बट प्रशासकहरूलाई पठाइयो!\n📩 **कुराकानी ID:** `%1`\nउनीहरूले सकेसम्म चाँडो जवाफ दिनेछन्।\n\n💡 **सुझाव:** संलग्नकहरू सहित कुराकानी जारी राख्न यो सन्देशको जवाफ दिनुहोस्।",
            adminNotification: "📩 प्रयोगकर्ताबाट नयाँ सन्देश",
            userInfo: "**👤 प्रयोगकर्ता:** %1 (%2)\n**🏠 गिल्ड:** %3\n**💬 सन्देश:**\n%4",
            replyInstruction: "\n\n💡 **यो सन्देशको जवाफ दिनुहोस्** प्रयोगकर्तालाई प्रतिक्रिया दिन।",
            adminReply: "📬 बट प्रशासकबाट प्रतिक्रिया",
            userReply: "📬 प्रयोगकर्ताबाट जवाफ",
            noAdmins: "❌ कुनै बट प्रशासकहरू कन्फिगर गरिएको छैन!",
            sendError: "❌ प्रशासकहरूलाई सन्देश पठाउन असफल। कृपया पछि पुन: प्रयास गर्नुहोस्।",
            replySent: "✅ तपाईंको जवाफ पठाइयो!",
            replyError: "❌ जवाफ पठाउन असफल। प्रयोगकर्ताले DMs ब्लक गरेको वा उपलब्ध नभएको हुन सक्छ।",
            conversationContinued: "💬 कुराकानी जारी..."
        }
    },

    onStart: async ({ message, interaction, args, getLang, client }) => {
        const isSlash = !message;
        const user = isSlash ? interaction.user : message.author;
        const guildName = isSlash ? interaction.guild?.name || "Direct Message" : message.guild?.name || "Direct Message";
        const userMessage = isSlash ? interaction.options.getString("message") : args.join(" ");

        if (!userMessage) {
            const response = getLang("noMessage");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const config = global.RentoBot?.config;
        if (!config?.bot?.adminBot?.length) {
            const response = getLang("noAdmins");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const attachments = [];
        
        // Get attachments from current message
        if (message?.attachments?.size) {
            attachments.push(...Array.from(message.attachments.values()).map(att => att.url));
        }
        
        // Extract URLs from message content (Discord CDN URLs)
        const urlRegex = /https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/attachments\/[\w\/\-\.]+/gi;
        const urlMatches = userMessage.match(urlRegex);
        if (urlMatches) {
            attachments.push(...urlMatches);
        }

        const conversationId = `CONV-${Date.now()}-${user.id}`;

        const embed = new EmbedBuilder()
            .setTitle(getLang("adminNotification"))
            .setDescription(getLang("userInfo", user.tag, user.id, guildName, userMessage))
            .setColor(0xFEE75C)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Conversation ID: ${conversationId}` })
            .setTimestamp();

        if (attachments.length > 0) {
            embed.addFields({
                name: "📎 Attachments",
                value: attachments.map((url, i) => `[Attachment ${i + 1}](${url})`).join("\n")
            });
        }

        embed.setDescription(embed.data.description + getLang("replyInstruction"));

        let sentCount = 0;
        const adminMessages = [];

        for (const adminId of config.bot.adminBot) {
            try {
                const admin = await client.users.fetch(adminId);
                const dmMessage = await admin.send({
                    embeds: [embed],
                    files: attachments.length > 0 ? attachments : []
                });

                adminMessages.push({ adminId, messageId: dmMessage.id });
                sentCount++;

                global.RentoBot.onReply.set(dmMessage.id, {
                    commandName: "callad",
                    messageId: dmMessage.id,
                    author: adminId,
                    targetUser: user.id,
                    conversationId,
                    handler: createAdminReplyHandler(user.id, adminId, conversationId, getLang, client)
                });
            } catch (error) {
                console.error(`Failed to DM admin ${adminId}:`, error);
            }
        }

        if (sentCount === 0) {
            const response = getLang("sendError");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const successEmbed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle("✅ Message Sent")
            .setDescription(getLang("sentSuccess", conversationId))
            .setFooter({ text: "Reply to this message to continue the conversation" })
            .setTimestamp();

        const userConfirmation = isSlash
            ? await interaction.reply({ embeds: [successEmbed], fetchReply: true })
            : await message.reply({ embeds: [successEmbed] });

        global.RentoBot.onReply.set(userConfirmation.id, {
            commandName: "callad",
            author: user.id,
            conversationId,
            adminMessages,
            handler: createUserReplyHandler(user.id, adminMessages, conversationId, getLang, client)
        });
    }
};

function createAdminReplyHandler(userId, adminId, conversationId, getLang, client) {
    return async ({ message: replyMsg }) => {
        try {
            const targetUser = await client.users.fetch(userId);
            const replyContent = replyMsg.content || "*[No text content]*";
            const attachments = [];
            
            // Get attachments from message
            if (replyMsg.attachments?.size) {
                attachments.push(...Array.from(replyMsg.attachments.values()).map(att => att.url));
            }
            
            // Extract URLs from message content
            const urlRegex = /https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/attachments\/[\w\/\-\.]+/gi;
            const urlMatches = replyMsg.content?.match(urlRegex);
            if (urlMatches) {
                attachments.push(...urlMatches);
            }

            const replyEmbed = new EmbedBuilder()
                .setTitle(getLang("adminReply"))
                .setDescription(replyContent)
                .setColor(0x57F287)
                .setFooter({ text: `Admin: ${replyMsg.author.tag} | Conversation: ${conversationId}` })
                .setTimestamp();

            if (attachments.length > 0) {
                replyEmbed.addFields({
                    name: "📎 Attachments",
                    value: attachments.map((url, i) => `[Attachment ${i + 1}](${url})`).join("\n")
                });
            }

            const userDM = await targetUser.send({
                embeds: [replyEmbed],
                files: attachments.length > 0 ? attachments : []
            });

            global.RentoBot.onReply.set(userDM.id, {
                commandName: "callad",
                author: userId,
                targetAdmin: adminId,
                conversationId,
                handler: createUserToAdminHandler(userId, adminId, conversationId, getLang, client)
            });

            await replyMsg.react("✅");
        } catch (err) {
            console.error("Error sending admin reply to user:", err);
            await replyMsg.reply(getLang("replyError"));
        }
    };
}

function createUserReplyHandler(userId, adminMessages, conversationId, getLang, client) {
    return async ({ message: userReply }) => {
        try {
            const replyContent = userReply.content || "*[No text content]*";
            const attachments = [];
            
            // Get attachments from message
            if (userReply.attachments?.size) {
                attachments.push(...Array.from(userReply.attachments.values()).map(att => att.url));
            }
            
            // Extract URLs from message content
            const urlRegex = /https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/attachments\/[\w\/\-\.]+/gi;
            const urlMatches = userReply.content?.match(urlRegex);
            if (urlMatches) {
                attachments.push(...urlMatches);
            }

            const userReplyEmbed = new EmbedBuilder()
                .setTitle(getLang("userReply"))
                .setDescription(replyContent)
                .setColor(0xFEE75C)
                .setThumbnail(userReply.author.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `User: ${userReply.author.tag} | Conversation: ${conversationId}` })
                .setTimestamp();

            if (attachments.length > 0) {
                userReplyEmbed.addFields({
                    name: "📎 Attachments",
                    value: attachments.map((url, i) => `[Attachment ${i + 1}](${url})`).join("\n")
                });
            }

            for (const { adminId } of adminMessages) {
                try {
                    const admin = await client.users.fetch(adminId);
                    const adminDM = await admin.send({
                        embeds: [userReplyEmbed],
                        files: attachments.length > 0 ? attachments : []
                    });

                    global.RentoBot.onReply.set(adminDM.id, {
                        commandName: "callad",
                        author: adminId,
                        targetUser: userId,
                        conversationId,
                        handler: createAdminReplyHandler(userId, adminId, conversationId, getLang, client)
                    });
                } catch (err) {
                    console.error(`Failed to send user reply to admin ${adminId}:`, err);
                }
            }

            await userReply.react("✅");

            const continueEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setDescription(getLang("conversationContinued"))
                .setFooter({ text: "Reply to this message to continue" })
                .setTimestamp();

            const continueMsg = await userReply.reply({ embeds: [continueEmbed] });

            global.RentoBot.onReply.set(continueMsg.id, {
                commandName: "callad",
                author: userId,
                conversationId,
                adminMessages,
                handler: createUserReplyHandler(userId, adminMessages, conversationId, getLang, client)
            });
        } catch (err) {
            console.error("Error sending user reply to admins:", err);
            await userReply.reply(getLang("replyError"));
        }
    };
}

function createUserToAdminHandler(userId, adminId, conversationId, getLang, client) {
    return async ({ message: userReply }) => {
        try {
            const replyContent = userReply.content || "*[No text content]*";
            const attachments = [];
            
            // Get attachments from message
            if (userReply.attachments?.size) {
                attachments.push(...Array.from(userReply.attachments.values()).map(att => att.url));
            }
            
            // Extract URLs from message content
            const urlRegex = /https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/attachments\/[\w\/\-\.]+/gi;
            const urlMatches = userReply.content?.match(urlRegex);
            if (urlMatches) {
                attachments.push(...urlMatches);
            }

            const userReplyEmbed = new EmbedBuilder()
                .setTitle(getLang("userReply"))
                .setDescription(replyContent)
                .setColor(0xFEE75C)
                .setThumbnail(userReply.author.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `User: ${userReply.author.tag} | Conversation: ${conversationId}` })
                .setTimestamp();

            if (attachments.length > 0) {
                userReplyEmbed.addFields({
                    name: "📎 Attachments",
                    value: attachments.map((url, i) => `[Attachment ${i + 1}](${url})`).join("\n")
                });
            }

            const admin = await client.users.fetch(adminId);
            const adminDM = await admin.send({
                embeds: [userReplyEmbed],
                files: attachments.length > 0 ? attachments : []
            });

            global.RentoBot.onReply.set(adminDM.id, {
                commandName: "callad",
                author: adminId,
                targetUser: userId,
                conversationId,
                handler: createAdminReplyHandler(userId, adminId, conversationId, getLang, client)
            });

            await userReply.react("✅");
        } catch (err) {
            console.error("Error sending user reply to admin:", err);
            await userReply.reply(getLang("replyError"));
        }
    };
}
