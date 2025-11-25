
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');
const os = require('os');

module.exports = {
    config: {
        name: "botinfo",
        version: "1.1",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Show bot statistics and information",
            ne: "बट तथ्याङ्क र जानकारी देखाउनुहोस्"
        },
        category: "info",
        guide: {
            en: "{prefix}botinfo",
            ne: "{prefix}botinfo"
        },
        slash: true
    },

    langs: {
        en: {
            title: "🤖 Bot Information",
            servers: "**Servers:** %1",
            users: "**Users:** %1",
            channels: "**Channels:** %1",
            commands: "**Commands:** %1",
            uptime: "**Uptime:** %1",
            memory: "**Memory Usage:** %1 MB / %2 MB",
            cpu: "**CPU Usage:** %1%",
            platform: "**Platform:** %1",
            nodeVersion: "**Node.js:** %1",
            discordJs: "**Discord.js:** %1",
            ping: "**Ping:** %1ms",
            owner: "**Owner:** %1",
            totalCommands: "**Total Executed:** %1",
            topCommands: "**Top Commands:**\n%1",
            noStats: "No command statistics available yet",
            totalMessages: "**Total Messages:** %1"
        },
        ne: {
            title: "🤖 बट जानकारी",
            servers: "**सर्भरहरू:** %1",
            users: "**प्रयोगकर्ताहरू:** %1",
            channels: "**च्यानलहरू:** %1",
            commands: "**आदेशहरू:** %1",
            uptime: "**अपटाइम:** %1",
            memory: "**मेमोरी प्रयोग:** %1 MB / %2 MB",
            cpu: "**CPU प्रयोग:** %1%",
            platform: "**प्लेटफर्म:** %1",
            nodeVersion: "**Node.js:** %1",
            discordJs: "**Discord.js:** %1",
            ping: "**पिंग:** %1ms",
            owner: "**मालिक:** %1",
            totalCommands: "**कुल कार्यान्वित:** %1",
            topCommands: "**शीर्ष आदेशहरू:**\n%1",
            noStats: "अझै कुनै आदेश तथ्याङ्क उपलब्ध छैन",
            totalMessages: "**कुल सन्देशहरू:** %1"
        }
    },

    onStart: async ({ message, interaction, client, getLang }) => {
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const totalCommands = global.RentoBot.commands.size;

        const uptime = Date.now() - global.RentoBot.startTime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor(uptime / 3600000) % 24;
        const minutes = Math.floor(uptime / 60000) % 60;
        const seconds = Math.floor(uptime / 1000) % 60;
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);

        const cpuUsage = process.cpuUsage();
        const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2);

        const platform = `${os.type()} ${os.release()}`;
        const nodeVersion = process.version;
        const discordJsVersion = require('../adapters/discord-to-telegram.js').version;
        const ping = client.ws.ping;

        let ownerTag = "Unknown";
        try {
            const ownerId = global.RentoBot.config.bot.adminBot?.[0];
            if (ownerId) {
                const owner = await client.users.fetch(ownerId);
                ownerTag = owner.tag;
            }
        } catch (error) {
            ownerTag = "Unknown";
        }

        // Get command execution statistics
        let totalCommandExecutions = 0;
        let topCommandsText = getLang("noStats");
        let totalMessagesTracked = 0;

        try {
            const allCommandStats = global.db.allCommandStats || [];
            
            if (allCommandStats.length > 0) {
                // Calculate total executions
                totalCommandExecutions = allCommandStats.reduce((sum, stat) => sum + (stat.executionCount || 0), 0);

                // Get top 5 commands
                const topCommands = allCommandStats
                    .filter(stat => stat.executionCount > 0)
                    .sort((a, b) => b.executionCount - a.executionCount)
                    .slice(0, 5);

                if (topCommands.length > 0) {
                    topCommandsText = topCommands
                        .map((stat, index) => `${index + 1}. \`${stat.commandName}\` - ${stat.executionCount.toLocaleString()} uses`)
                        .join('\n');
                }
            }
        } catch (error) {
            console.error('Error fetching command stats:', error);
        }

        // Calculate total messages tracked across all users
        try {
            const allUsers = global.db.allUserData || [];
            totalMessagesTracked = allUsers.reduce((sum, user) => sum + (user.stats?.totalMessages || 0), 0);
        } catch (error) {
            console.error('Error fetching total messages:', error);
        }

        const embed = new EmbedBuilder()
            .setTitle(getLang("title"))
            .setColor(0x00AE86)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: "📊 Statistics", value: 
                    getLang("servers", totalGuilds) + "\n" +
                    getLang("users", totalUsers.toLocaleString()) + "\n" +
                    getLang("channels", totalChannels) + "\n" +
                    getLang("commands", totalCommands),
                    inline: true
                },
                { name: "⚙️ System", value: 
                    getLang("uptime", uptimeString) + "\n" +
                    getLang("memory", memoryUsage, totalMemory) + "\n" +
                    getLang("platform", platform) + "\n" +
                    getLang("ping", ping),
                    inline: true
                },
                { name: "💻 Technical", value: 
                    getLang("nodeVersion", nodeVersion) + "\n" +
                    getLang("discordJs", discordJsVersion) + "\n" +
                    getLang("owner", ownerTag),
                    inline: false
                },
                { name: "📈 Command Usage", value: 
                    getLang("totalCommands", totalCommandExecutions.toLocaleString()) + "\n" +
                    getLang("totalMessages", totalMessagesTracked.toLocaleString()) + "\n\n" +
                    getLang("topCommands", topCommandsText),
                    inline: false
                }
            )
            .setFooter({ text: `Bot ID: ${client.user.id}` })
            .setTimestamp();

        return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
    }
};
