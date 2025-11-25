const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "user",
        aliases: ["usermanage", "manageuser"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "User management for bot owners (search, ban, unban)",
            ne: "बट मालिकहरूको लागि प्रयोगकर्ता व्यवस्थापन (खोज, प्रतिबन्ध, प्रतिबन्ध हटाउनुहोस्)"
        },
        category: "owner",
        guide: {
            en: "{prefix}user search <name> - Search users by name\n"
                + "{prefix}user ban <@user|uid> [reason] - Ban user from bot\n"
                + "{prefix}user unban <@user|uid> - Unban user from bot\n"
                + "{prefix}user banned - List all banned users\n"
                + "{prefix}user list - List all users\n"
                + "{prefix}user info <@user|uid> - Get detailed user info",
            ne: "{prefix}user search <नाम> - नामद्वारा प्रयोगकर्ताहरू खोज्नुहोस्\n"
                + "{prefix}user ban <@प्रयोगकर्ता|uid> [कारण] - बटबाट प्रयोगकर्ता प्रतिबन्ध गर्नुहोस्\n"
                + "{prefix}user unban <@प्रयोगकर्ता|uid> - बटबाट प्रयोगकर्ता प्रतिबन्ध हटाउनुहोस्\n"
                + "{prefix}user banned - सबै प्रतिबन्धित प्रयोगकर्ताहरू सूचीबद्ध गर्नुहोस्\n"
                + "{prefix}user list - सबै प्रयोगकर्ताहरू सूचीबद्ध गर्नुहोस्\n"
                + "{prefix}user info <@प्रयोगकर्ता|uid> - विस्तृत प्रयोगकर्ता जानकारी प्राप्त गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform",
                type: 3,
                required: true,
                choices: [
                    { name: "search", value: "search" },
                    { name: "ban", value: "ban" },
                    { name: "unban", value: "unban" },
                    { name: "banned", value: "banned" },
                    { name: "list", value: "list" },
                    { name: "info", value: "info" }
                ]
            },
            {
                name: "user",
                description: "User to manage",
                type: 6,
                required: false
            },
            {
                name: "query",
                description: "Search query or user ID",
                type: 3,
                required: false
            },
            {
                name: "reason",
                description: "Ban reason",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            searchResults: "🔍 **Search Results for '%1'**\n\n%2",
            noResults: "❌ No users found matching '%1'",
            banned: "✅ Successfully banned user **%1** (ID: %2)\n📝 Reason: %3",
            unbanned: "✅ Successfully unbanned user **%1** (ID: %2)",
            alreadyBanned: "⚠️ User **%1** is already banned",
            notBanned: "⚠️ User **%1** is not banned",
            bannedList: "📋 **Banned Users** (%1 total)\n\n%2",
            noBanned: "✅ No users are currently banned",
            userInfo: "**User Information**\n\n"
                + "**Name:** %1\n"
                + "**ID:** `%2`\n"
                + "**Level:** %3\n"
                + "**EXP:** %4\n"
                + "**Money:** $%5\n"
                + "**Bank:** $%6\n"
                + "**Banned:** %7",
            invalidUser: "❌ Please specify a valid user or user ID"
        },
        ne: {
            searchResults: "🔍 **'%1' को खोज परिणामहरू**\n\n%2",
            noResults: "❌ '%1' मिल्ने कुनै प्रयोगकर्ता फेला परेन",
            banned: "✅ सफलतापूर्वक प्रयोगकर्ता **%1** प्रतिबन्ध गरियो (ID: %2)\n📝 कारण: %3",
            unbanned: "✅ सफलतापूर्वक प्रयोगकर्ता **%1** प्रतिबन्ध हटाइयो (ID: %2)",
            alreadyBanned: "⚠️ प्रयोगकर्ता **%1** पहिले नै प्रतिबन्धित छ",
            notBanned: "⚠️ प्रयोगकर्ता **%1** प्रतिबन्धित छैन",
            bannedList: "📋 **प्रतिबन्धित प्रयोगकर्ताहरू** (कुल %1)\n\n%2",
            noBanned: "✅ हाल कुनै प्रयोगकर्ता प्रतिबन्धित छैन",
            userInfo: "**प्रयोगकर्ता जानकारी**\n\n"
                + "**नाम:** %1\n"
                + "**ID:** `%2`\n"
                + "**स्तर:** %3\n"
                + "**EXP:** %4\n"
                + "**पैसा:** $%5\n"
                + "**बैंक:** $%6\n"
                + "**प्रतिबन्धित:** %7",
            invalidUser: "❌ कृपया मान्य प्रयोगकर्ता वा प्रयोगकर्ता ID निर्दिष्ट गर्नुहोस्"
        }
    },

    onStart: async ({ message, interaction, args, usersData, client, getLang }) => {
        const isInteraction = !!interaction;
        const action = isInteraction ? 
            interaction.options.getString('action') : 
            (args[0] || '').toLowerCase();

        const targetUser = isInteraction ? 
            interaction.options.getUser('user') : 
            null;

        const query = isInteraction ? 
            interaction.options.getString('query') : 
            args.slice(1).join(' ');

        const reason = isInteraction ? 
            (interaction.options.getString('reason') || 'No reason provided') : 
            (args.slice(message?.mentions?.users?.size ? 2 : 1).join(' ') || 'No reason provided');

        try {
            switch (action) {
                case 'search': {
                    if (!query) {
                        const response = "❌ Please provide a search query";
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    const allUsers = await usersData.getAll();
                    const searchResults = allUsers
                        .filter(u => u.name && u.name.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 20);

                    if (searchResults.length === 0) {
                        const response = getLang("noResults", query);
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    const resultText = searchResults
                        .map((u, i) => `${i + 1}. **${u.name || 'Unknown'}** (ID: \`${u.userID}\`)\n   💰 Money: $${u.money.toLocaleString()} | 🏦 Bank: $${u.bank.toLocaleString()}`)
                        .join('\n\n');

                    const embed = new EmbedBuilder()
                        .setTitle(`🔍 Search Results: "${query}" (${searchResults.length} found)`)
                        .setDescription(resultText)
                        .setColor(0x3498db)
                        .setTimestamp();

                    return isInteraction ? interaction.reply({ embeds: [embed], ephemeral: true }) : message.reply({ embeds: [embed] });
                }

                case 'ban': {
                    const userId = targetUser?.id || query || (message?.mentions?.users?.first()?.id);
                    if (!userId) {
                        const response = getLang("invalidUser");
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    const userData = await usersData.get(userId);
                    
                    if (userData.banned.status) {
                        const response = getLang("alreadyBanned", userData.name || userId);
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    await usersData.set(userId, {
                        banned: {
                            status: true,
                            reason: reason,
                            date: new Date().toISOString()
                        }
                    });

                    const response = getLang("banned", userData.name || userId, userId, reason);
                    return isInteraction ? interaction.reply(response) : message.reply(response);
                }

                case 'unban': {
                    const userId = targetUser?.id || query || (message?.mentions?.users?.first()?.id);
                    if (!userId) {
                        const response = getLang("invalidUser");
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    const userData = await usersData.get(userId);
                    
                    if (!userData.banned.status) {
                        const response = getLang("notBanned", userData.name || userId);
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    await usersData.set(userId, {
                        banned: {
                            status: false,
                            reason: "",
                            date: ""
                        }
                    });

                    const response = getLang("unbanned", userData.name || userId, userId);
                    return isInteraction ? interaction.reply(response) : message.reply(response);
                }

                case 'banned': {
                    const allUsers = await usersData.getAll();
                    const bannedUsers = allUsers.filter(u => u.banned && u.banned.status);

                    if (bannedUsers.length === 0) {
                        const response = getLang("noBanned");
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    const listText = bannedUsers
                        .slice(0, 20)
                        .map((u, i) => `${i + 1}. **${u.name || 'Unknown'}** (ID: \`${u.userID}\`)\n   📝 Reason: ${u.banned.reason}\n   📅 Date: ${new Date(u.banned.date).toLocaleDateString()}`)
                        .join('\n\n');

                    const embed = new EmbedBuilder()
                        .setTitle(`📋 Banned Users (${bannedUsers.length} total)`)
                        .setDescription(listText)
                        .setColor(0xff0000)
                        .setTimestamp();

                    return isInteraction ? interaction.reply({ embeds: [embed], ephemeral: true }) : message.reply({ embeds: [embed] });
                }

                case 'list': {
                    const allUsers = await usersData.getAll();
                    const sortedUsers = allUsers
                        .sort((a, b) => (b.money + b.bank) - (a.money + a.bank))
                        .slice(0, 20);

                    if (sortedUsers.length === 0) {
                        const response = "❌ No users found in the database";
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    const listText = sortedUsers
                        .map((u, i) => `${i + 1}. **${u.name || 'Unknown'}** (ID: \`${u.userID}\`)\n   💰 Money: $${u.money.toLocaleString()} | 🏦 Bank: $${u.bank.toLocaleString()}\n   ${u.banned && u.banned.status ? '🚫 Banned' : '✅ Active'}`)
                        .join('\n\n');

                    const embed = new EmbedBuilder()
                        .setTitle(`👥 All Users (${allUsers.length} total)`)
                        .setDescription(listText)
                        .setColor(0x00ff00)
                        .setFooter({ text: 'Showing top 20 users by total wealth' })
                        .setTimestamp();

                    return isInteraction ? interaction.reply({ embeds: [embed], ephemeral: true }) : message.reply({ embeds: [embed] });
                }

                case 'info': {
                    const userId = targetUser?.id || query || (message?.mentions?.users?.first()?.id);
                    if (!userId) {
                        const response = getLang("invalidUser");
                        return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                    }

                    const userData = await usersData.get(userId);
                    const user = await client.users.fetch(userId).catch(() => null);

                    const embed = new EmbedBuilder()
                        .setTitle("👤 User Information")
                        .setDescription(
                            `**Name:** ${userData.name || user?.username || 'Unknown'}\n` +
                            `**ID:** \`${userId}\`\n` +
                            `**Level:** ${userData.level}\n` +
                            `**EXP:** ${userData.exp}\n` +
                            `**Money:** $${userData.money.toLocaleString()}\n` +
                            `**Bank:** $${userData.bank.toLocaleString()}\n` +
                            `**Banned:** ${userData.banned.status ? `Yes - ${userData.banned.reason}` : 'No'}`
                        )
                        .setThumbnail(user?.displayAvatarURL({ dynamic: true, size: 256 }) || null)
                        .setColor(userData.banned.status ? 0xff0000 : 0x00ff00)
                        .setTimestamp();

                    return isInteraction ? interaction.reply({ embeds: [embed], ephemeral: true }) : message.reply({ embeds: [embed] });
                }

                default: {
                    const response = "Invalid action. Use: search, ban, unban, list, or info";
                    return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
                }
            }
        } catch (error) {
            console.error('User management error:', error);
            const response = `❌ Error: ${error.message}`;
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }
    }
};
