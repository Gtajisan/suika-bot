const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "afk",
        aliases: ["away"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Set yourself as AFK. Bot will notify others when they mention you.",
            ne: "आफूलाई AFK को रूपमा सेट गर्नुहोस्। कसैले तपाईंलाई उल्लेख गर्दा बटले सूचित गर्नेछ।"
        },
        category: "utility",
        guide: {
            en: "{prefix}afk [reason] - Set yourself as AFK\n{prefix}afk - Set AFK without reason\nTo remove AFK, just send any message",
            ne: "{prefix}afk [कारण] - आफूलाई AFK को रूपमा सेट गर्नुहोस्\n{prefix}afk - कारण बिना AFK सेट गर्नुहोस्\nAFK हटाउन, कुनै पनि सन्देश पठाउनुहोस्"
        },
        slash: true,
        options: [
            {
                name: "reason",
                description: "Reason for being AFK",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            afkSet: "💤 You're now AFK%1",
            afkRemoved: "👋 Welcome back! Your AFK status has been removed.",
            afkNotification: "💤 %1 is currently AFK%2",
            withReason: ": %1",
            since: "\n⏰ Since: <t:%1:R>"
        },
        ne: {
            afkSet: "💤 तपाईं अब AFK हुनुहुन्छ%1",
            afkRemoved: "👋 स्वागत छ फिर्ता! तपाईंको AFK स्थिति हटाइयो।",
            afkNotification: "💤 %1 हाल AFK छ%2",
            withReason: ": %1",
            since: "\n⏰ देखि: <t:%1:R>"
        }
    },

    onStart: async ({ message, interaction, args, usersData, userData, getLang }) => {
        const isInteraction = !!interaction;
        const user = isInteraction ? interaction.user : message.author;
        
        // Get reason from interaction or message args
        const reason = isInteraction ? 
            (interaction.options.getString('reason') || null) : 
            (args.join(' ') || null);

        // Set AFK status in user database
        await usersData.set(user.id, {
            status: true,
            reason: reason,
            since: Math.floor(Date.now() / 1000) // Unix timestamp in seconds
        }, 'settings.afk');

        // Build response message
        let response = getLang("afkSet", reason ? getLang("withReason", reason) : "");
        
        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setDescription(response)
            .setFooter({ text: "Send any message to remove AFK status" })
            .setTimestamp();

        if (isInteraction) {
            await interaction.reply({ embeds: [embed] });
        } else {
            await message.reply({ embeds: [embed] });
        }
    },

    onChat: async ({ message, usersData, getLang }) => {
        if (!message || message.author.bot) return;

        const authorID = message.author.id;
        
        // Check if the message author is AFK and remove their AFK status
        try {
            const authorData = await usersData.get(authorID);
            
            if (authorData?.settings?.afk?.status) {
                // Remove AFK status
                await usersData.set(authorID, {
                    status: false,
                    reason: null,
                    since: null
                }, 'settings.afk');

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setDescription(getLang("afkRemoved"))
                    .setTimestamp();

                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("Error checking AFK status for author:", error);
        }

        // Check if anyone mentioned in the message is AFK
        if (message.mentions.users.size > 0) {
            for (const [userID, mentionedUser] of message.mentions.users) {
                // Skip if the mentioned user is the message author
                if (userID === authorID) continue;
                
                try {
                    const mentionedUserData = await usersData.get(userID);
                    
                    if (mentionedUserData?.settings?.afk?.status) {
                        const afkData = mentionedUserData.settings.afk;
                        const reason = afkData.reason;
                        const since = afkData.since;
                        
                        // Build notification message
                        let notification = getLang(
                            "afkNotification", 
                            mentionedUser.username,
                            reason ? getLang("withReason", reason) : ""
                        );
                        
                        if (since) {
                            notification += getLang("since", since);
                        }

                        const embed = new EmbedBuilder()
                            .setColor(0xFFA500)
                            .setDescription(notification)
                            .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true }))
                            .setTimestamp();

                        await message.reply({ embeds: [embed] });
                    }
                } catch (error) {
                    console.error(`Error checking AFK status for ${mentionedUser.username}:`, error);
                }
            }
        }
    }
};
