
module.exports = {
    config: {
        name: "guild",
        aliases: ["server", "manageguild"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Guild/server management for bot owners",
            ne: "बट मालिकहरूको लागि गिल्ड/सर्भर व्यवस्थापन"
        },
        category: "owner",
        guide: {
            en: "{prefix}guild list - List all servers\n"
                + "{prefix}guild search <name> - Search servers by name\n"
                + "{prefix}guild info <guildId> - Get server info\n"
                + "{prefix}guild ban <guildId> [reason] - Ban server from bot\n"
                + "{prefix}guild unban <guildId> - Unban server from bot\n"
                + "{prefix}guild leave <guildId> - Leave a server",
            ne: "{prefix}guild list - सबै सर्भरहरू सूचीबद्ध गर्नुहोस्\n"
                + "{prefix}guild search <नाम> - नामबाट सर्भरहरू खोज्नुहोस्\n"
                + "{prefix}guild info <guildId> - सर्भर जानकारी प्राप्त गर्नुहोस्\n"
                + "{prefix}guild ban <guildId> [कारण] - बटबाट सर्भर प्रतिबन्ध लगाउनुहोस्\n"
                + "{prefix}guild unban <guildId> - बटबाट सर्भर अनब्यान गर्नुहोस्\n"
                + "{prefix}guild leave <guildId> - सर्भर छोड्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform",
                type: 3,
                required: true,
                choices: [
                    { name: "list", value: "list" },
                    { name: "search", value: "search" },
                    { name: "info", value: "info" },
                    { name: "ban", value: "ban" },
                    { name: "unban", value: "unban" },
                    { name: "leave", value: "leave" }
                ]
            },
            {
                name: "query",
                description: "Server name or guild ID",
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
            listTitle: "🏰 **All Servers** (%1 total)\n\n%2",
            searchResults: "🔍 **Search Results for '%1'**\n\n%2",
            noResults: "❌ No servers found matching '%1'",
            banned: "✅ Successfully banned server **%1** (ID: %2)\n📝 Reason: %3",
            unbanned: "✅ Successfully unbanned server **%1** (ID: %2)",
            alreadyBanned: "⚠️ Server is already banned",
            notBanned: "⚠️ Server is not banned",
            leftServer: "✅ Successfully left server **%1** (ID: %2)",
            invalidGuild: "❌ Please specify a valid guild ID",
            guildNotFound: "❌ Guild not found"
        },
        ne: {
            listTitle: "🏰 **सबै सर्भरहरू** (कुल %1)\n\n%2",
            searchResults: "🔍 **'%1' को लागि खोज परिणामहरू**\n\n%2",
            noResults: "❌ '%1' सँग मेल खाने कुनै सर्भरहरू फेला परेन",
            banned: "✅ सफलतापूर्वक सर्भर **%1** (ID: %2) लाई प्रतिबन्ध लगाइयो\n📝 कारण: %3",
            unbanned: "✅ सफलतापूर्वक सर्भर **%1** (ID: %2) लाई अनब्यान गरियो",
            alreadyBanned: "⚠️ सर्भर पहिले नै प्रतिबन्धित छ",
            notBanned: "⚠️ सर्भर प्रतिबन्धित छैन",
            leftServer: "✅ सफलतापूर्वक सर्भर **%1** (ID: %2) छोडियो",
            invalidGuild: "❌ कृपया मान्य guild ID निर्दिष्ट गर्नुहोस्",
            guildNotFound: "❌ गिल्ड फेला परेन"
        }
    },

    onStart: async ({ message, interaction, args, guildsData, client, getLang }) => {
        const isInteraction = !!interaction;
        const action = isInteraction ? 
            interaction.options.getString('action') : 
            (args[0] || '').toLowerCase();

        const query = isInteraction ? 
            interaction.options.getString('query') : 
            args.slice(1).join(' ');

        const reason = isInteraction ? 
            (interaction.options.getString('reason') || 'No reason provided') : 
            (args.slice(2).join(' ') || 'No reason provided');

        try {
            switch (action) {
                case 'list': {
                    const guildArray = Array.from(client.guilds.cache.values())
                        .sort((a, b) => b.memberCount - a.memberCount)
                        .slice(0, 20);

                    const guilds = guildArray
                        .map((guild, i) => {
                            return `${i + 1}. **${guild.name}** (ID: \`${guild.id}\`)\n   👥 Members: ${guild.memberCount}`;
                        })
                        .join('\n\n');

                    const embed = {}
                        // Title: `🏰 All Servers (${client.guilds.cache.size} total`)
                        // Description: guilds.length > 0 ? guilds : 'No servers found'
                        
                        .setTimestamp();

                    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
                }

                case 'search': {
                    if (!query) {
                        const response = "❌ Please provide a search query";
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    const searchResults = client.guilds.cache
                        .filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
                        .map(guild => `**${guild.name}** (ID: \`${guild.id}\`)\n   👥 Members: ${guild.memberCount}`)
                        .slice(0, 10)
                        .join('\n\n');

                    if (!searchResults) {
                        const response = getLang("noResults", query);
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    const embed = {}
                        // Title: `🔍 Search Results: "${query}"`
                        // Description: searchResults
                        
                        .setTimestamp();

                    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
                }

                case 'info': {
                    if (!query) {
                        const response = getLang("invalidGuild");
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    const guild = client.guilds.cache.get(query);
                    if (!guild) {
                        const response = getLang("guildNotFound");
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    const guildData = await guildsData.get(guild.id);
                    const owner = await guild.fetchOwner().catch(() => null);

                    const embed = {}
                        // Title: `🏰 ${guild.name}`
                        .setDescription(
                            `**ID:** \`${guild.id}\`\n` +
                            `**Owner:** ${owner?.user?.tag || 'Unknown'}\n` +
                            `**Members:** ${guild.memberCount}\n` +
                            `**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>\n` +
                            `**Prefix:** \`${guildData.prefix}\`\n` +
                            `**Banned:** ${guildData.banned.status ? `Yes - ${guildData.banned.reason}` : 'No'}`
                        )
                        // Thumbnail: guild.iconURL({ dynamic: true, size: 256 }*/ //(guildData.banned.status ? 0xff0000 : 0x00ff00)
                        .setTimestamp();

                    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
                }

                case 'ban': {
                    if (!query) {
                        const response = getLang("invalidGuild");
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    const guildData = await guildsData.get(query);
                    const guild = client.guilds.cache.get(query);

                    if (guildData.banned.status) {
                        const response = getLang("alreadyBanned");
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    await guildsData.set(query, {
                        banned: {
                            status: true,
                            reason: reason,
                            date: new Date().toISOString()
                        }
                    });

                    const response = getLang("banned", guild?.name || 'Unknown', query, reason);
                    
                    if (guild) {
                        await guild.leave().catch(() => {});
                    }

                    return isInteraction ? ctx.reply(response) : ctx.reply(response);
                }

                case 'unban': {
                    if (!query) {
                        const response = getLang("invalidGuild");
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    const guildData = await guildsData.get(query);

                    if (!guildData.banned.status) {
                        const response = getLang("notBanned");
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    await guildsData.set(query, {
                        banned: {
                            status: false,
                            reason: "",
                            date: ""
                        }
                    });

                    const response = getLang("unbanned", 'Guild', query);
                    return isInteraction ? ctx.reply(response) : ctx.reply(response);
                }

                case 'leave': {
                    if (!query) {
                        const response = getLang("invalidGuild");
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    const guild = client.guilds.cache.get(query);
                    if (!guild) {
                        const response = getLang("guildNotFound");
                        return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                    }

                    const guildName = guild.name;
                    await guild.leave();

                    const response = getLang("leftServer", guildName, query);
                    return isInteraction ? ctx.reply(response) : ctx.reply(response);
                }

                default: {
                    const response = "Invalid action. Use: list, search, info, ban, unban, or leave";
                    return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
                }
            }
        } catch (error) {
            console.error('Guild management error:', error);
            const response = `❌ Error: ${error.message}`;
            return isInteraction ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }
    }
};
