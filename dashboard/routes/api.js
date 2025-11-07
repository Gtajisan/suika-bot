const express = require('express');
const router = express.Router();
const os = require('os');

router.get('/stats', async (req, res) => {
    try {
        const allGuilds = global.db.allGuildData || [];
        const allUsers = global.db.allUserData || [];

        const totalGuilds = allGuilds.length;
        const totalUsers = allUsers.length;
        const totalCommands = global.RentoBot.commands.size;

        let totalCommandsUsed = 0;
        allUsers.forEach(user => {
            if (user.stats?.totalCommandsUsed) {
                totalCommandsUsed += user.stats.totalCommandsUsed;
            }
        });

        res.json({
            servers: totalGuilds,
            users: totalUsers,
            commands: totalCommands,
            commandsUsed: totalCommandsUsed
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

router.get('/leaderboard/guilds', async (req, res) => {
    try {
        const allGuilds = global.db.allGuildData || [];
        
        const leaderboard = allGuilds
            .filter(guild => guild.stats && guild.stats.totalCommandsUsed > 0)
            .sort((a, b) => (b.stats.totalCommandsUsed || 0) - (a.stats.totalCommandsUsed || 0))
            .slice(0, 10)
            .map((guild, index) => ({
                rank: index + 1,
                name: guild.guildName || 'Unknown Server',
                members: guild.stats?.totalMembers || 0,
                commands: guild.stats?.totalCommandsUsed || 0,
                messages: guild.stats?.totalMessages || 0
            }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching guild leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch guild leaderboard' });
    }
});

router.get('/leaderboard/users', async (req, res) => {
    try {
        const allUsers = global.db.allUserData || [];
        
        const leaderboard = allUsers
            .filter(user => user.stats && user.stats.totalCommandsUsed > 0)
            .sort((a, b) => (b.stats.totalCommandsUsed || 0) - (a.stats.totalCommandsUsed || 0))
            .slice(0, 10)
            .map((user, index) => ({
                rank: index + 1,
                name: user.name || 'Unknown User',
                commands: user.stats?.totalCommandsUsed || 0,
                messages: user.stats?.totalMessages || 0
            }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching user leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch user leaderboard' });
    }
});

router.get('/commands/stats', async (req, res) => {
    try {
        const commands = global.RentoBot.commands;
        const allUsers = global.db.allUserData || [];
        
        const commandUsage = {};
        allUsers.forEach(user => {
            if (user.commandStats) {
                Object.entries(user.commandStats).forEach(([cmdName, count]) => {
                    commandUsage[cmdName] = (commandUsage[cmdName] || 0) + count;
                });
            }
        });
        
        const stats = Object.entries(commandUsage)
            .map(([name, usage]) => ({ name, usage }))
            .sort((a, b) => b.usage - a.usage);

        res.json(stats);
    } catch (error) {
        console.error('Error fetching command stats:', error);
        res.status(500).json({ error: 'Failed to fetch command stats' });
    }
});

router.get('/botinfo', async (req, res) => {
    try {
        if (!global.RentoBot || !global.RentoBot.client || !global.RentoBot.client.user) {
            return res.status(503).json({ 
                error: 'Bot is still initializing. Please try again in a moment.',
                initializing: true 
            });
        }

        const client = global.RentoBot.client;
        const allGuilds = global.db.allGuildData || [];
        const allUsers = global.db.allUserData || [];
        const allCommandStats = global.db.allCommandStats || [];

        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const totalCommands = global.RentoBot.commands.size;

        const uptime = Date.now() - (global.RentoBot.startTime || Date.now());
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
        const discordJsVersion = require('discord.js').version;
        const ping = client.ws.ping;

        let ownerTag = "Unknown";
        let ownerAvatar = null;
        try {
            const ownerId = global.RentoBot.config.bot.adminBot?.[0];
            if (ownerId) {
                const owner = await client.users.fetch(ownerId);
                ownerTag = owner.tag;
                ownerAvatar = owner.displayAvatarURL();
            }
        } catch (error) {
            ownerTag = "Unknown";
        }

        let totalCommandExecutions = 0;
        let topCommands = [];
        
        if (allCommandStats.length > 0) {
            totalCommandExecutions = allCommandStats.reduce((sum, stat) => sum + (stat.executionCount || 0), 0);
            topCommands = allCommandStats
                .filter(stat => stat.executionCount > 0)
                .sort((a, b) => b.executionCount - a.executionCount)
                .slice(0, 5)
                .map((stat, index) => ({
                    rank: index + 1,
                    name: stat.commandName,
                    executions: stat.executionCount
                }));
        }

        const totalMessages = allUsers.reduce((sum, user) => sum + (user.stats?.totalMessages || 0), 0);

        res.json({
            statistics: {
                servers: totalGuilds,
                users: totalUsers,
                channels: totalChannels,
                commands: totalCommands,
                totalCommandsUsed: totalCommandExecutions,
                totalMessages: totalMessages
            },
            system: {
                uptime: uptimeString,
                uptimeMs: uptime,
                memoryUsage: parseFloat(memoryUsage),
                totalMemory: parseFloat(totalMemory),
                memoryPercent: ((parseFloat(memoryUsage) / parseFloat(totalMemory)) * 100).toFixed(2),
                cpuUsage: parseFloat(cpuPercent),
                platform: platform,
                nodeVersion: nodeVersion,
                discordJsVersion: discordJsVersion,
                ping: ping
            },
            owner: {
                tag: ownerTag,
                avatar: ownerAvatar
            },
            topCommands: topCommands,
            botAvatar: client.user.displayAvatarURL(),
            botId: client.user.id,
            botTag: client.user.tag
        });
    } catch (error) {
        console.error('Error fetching bot info:', error);
        res.status(500).json({ error: 'Failed to fetch bot info' });
    }
});

router.get('/system', async (req, res) => {
    try {
        const client = global.RentoBot.client;
        
        const uptime = Date.now() - (global.RentoBot.startTime || Date.now());
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        res.json({
            uptime: uptime,
            memory: {
                heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
                heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
                rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
                external: (memoryUsage.external / 1024 / 1024).toFixed(2),
                systemTotal: (os.totalmem() / 1024 / 1024).toFixed(2),
                systemFree: (os.freemem() / 1024 / 1024).toFixed(2)
            },
            cpu: {
                user: (cpuUsage.user / 1000000).toFixed(2),
                system: (cpuUsage.system / 1000000).toFixed(2),
                cores: os.cpus().length
            },
            platform: {
                type: os.type(),
                release: os.release(),
                arch: os.arch(),
                hostname: os.hostname()
            },
            versions: {
                node: process.version,
                discordJs: require('discord.js').version
            },
            ping: client.ws.ping
        });
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({ error: 'Failed to fetch system info' });
    }
});

router.get('/messages/total', async (req, res) => {
    try {
        const allUsers = global.db.allUserData || [];
        const totalMessages = allUsers.reduce((sum, user) => sum + (user.stats?.totalMessages || 0), 0);
        
        res.json({
            total: totalMessages,
            users: allUsers.filter(u => u.stats?.totalMessages > 0).length
        });
    } catch (error) {
        console.error('Error fetching total messages:', error);
        res.status(500).json({ error: 'Failed to fetch total messages' });
    }
});

module.exports = router;
