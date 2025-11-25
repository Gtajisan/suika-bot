const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const client = req.app.locals.botClient;

        const allGuilds = global.db.allGuildData || [];
        const allUsers = global.db.allUserData || [];

        res.render('admin/dashboard', {
            title: 'Admin Panel - RentoBot',
            isAuthenticated: true,
            stats: {
                totalGuilds: allGuilds.length,
                totalUsers: allUsers.length,
                totalCommands: global.RentoBot.commands.size
            }
        });
    } catch (error) {
        console.error('Error rendering admin dashboard:', error);
        res.status(500).send('Error loading admin panel');
    }
});

router.get('/users', async (req, res) => {
    try {
        const allUsers = global.db.allUserData || [];

        res.render('admin/users', {
            title: 'User Management - Admin Panel',
            isAuthenticated: true,
            users: allUsers
        });
    } catch (error) {
        console.error('Error rendering admin users:', error);
        res.status(500).send('Error loading user management');
    }
});

router.get('/guilds', async (req, res) => {
    try {
        const allGuilds = global.db.allGuildData || [];

        res.render('admin/guilds', {
            title: 'Server Management - Admin Panel',
            isAuthenticated: true,
            guilds: allGuilds
        });
    } catch (error) {
        console.error('Error rendering admin guilds:', error);
        res.status(500).send('Error loading server management');
    }
});

router.get('/commands', async (req, res) => {
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
        
        const allCommandStats = Object.entries(commandUsage).map(([cmdName, count]) => ({
            commandName: cmdName,
            category: commands.get(cmdName)?.config?.category || 'Unknown',
            executionCount: count,
            lastExecuted: null
        }));

        res.render('admin/commands', {
            title: 'Command Stats - Admin Panel',
            isAuthenticated: true,
            commandStats: allCommandStats
        });
    } catch (error) {
        console.error('Error rendering admin commands:', error);
        res.status(500).send('Error loading command stats');
    }
});

router.post('/users/:userId/ban', async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const { db } = global;

        const userData = await db.usersData.get(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db.usersData.set(userId, {
            banned: {
                status: true,
                reason: reason || 'No reason provided',
                date: new Date().toISOString()
            }
        });

        res.json({ success: true, message: 'User banned successfully' });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
});

router.post('/users/:userId/unban', async (req, res) => {
    try {
        const { userId } = req.params;
        const { db } = global;

        const userData = await db.usersData.get(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db.usersData.set(userId, {
            banned: {
                status: false,
                reason: '',
                date: ''
            }
        });

        res.json({ success: true, message: 'User unbanned successfully' });
    } catch (error) {
        console.error('Error unbanning user:', error);
        res.status(500).json({ error: 'Failed to unban user' });
    }
});

router.get('/users/:userId/edit', async (req, res) => {
    try {
        const { userId } = req.params;
        const { db } = global;

        const userData = await db.usersData.get(userId);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('Error getting user data:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

router.post('/users/:userId/update', async (req, res) => {
    try {
        const { userId } = req.params;
        const { userData } = req.body;
        const { db } = global;

        if (!userData || typeof userData !== 'object') {
            return res.status(400).json({ error: 'Invalid user data' });
        }

        // Ensure userID is preserved
        userData.userID = userId;

        // Save the entire user data object
        await db.usersData.save(userId, userData, 'update');

        res.json({ success: true, message: 'User data updated successfully' });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Failed to update user data: ' + error.message });
    }
});

router.post('/guilds/:guildId/ban', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { reason } = req.body;
        const { db } = global;

        const guildData = await db.guildsData.get(guildId);
        if (!guildData) {
            return res.status(404).json({ error: 'Guild not found' });
        }

        await db.guildsData.set(guildId, {
            banned: {
                status: true,
                reason: reason || 'No reason provided',
                date: new Date().toISOString()
            }
        });

        res.json({ success: true, message: 'Guild banned successfully' });
    } catch (error) {
        console.error('Error banning guild:', error);
        res.status(500).json({ error: 'Failed to ban guild' });
    }
});

router.post('/guilds/:guildId/unban', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { db } = global;

        const guildData = await db.guildsData.get(guildId);
        if (!guildData) {
            return res.status(404).json({ error: 'Guild not found' });
        }

        await db.guildsData.set(guildId, {
            banned: {
                status: false,
                reason: '',
                date: ''
            }
        });

        res.json({ success: true, message: 'Guild unbanned successfully' });
    } catch (error) {
        console.error('Error unbanning guild:', error);
        res.status(500).json({ error: 'Failed to unban guild' });
    }
});

router.get('/guilds/:guildId/edit', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { db } = global;

        const guildData = await db.guildsData.get(guildId);
        if (!guildData) {
            return res.status(404).json({ error: 'Guild not found' });
        }

        res.json({ success: true, guild: guildData });
    } catch (error) {
        console.error('Error getting guild data:', error);
        res.status(500).json({ error: 'Failed to get guild data' });
    }
});

router.post('/guilds/:guildId/update', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { guildData } = req.body;
        const { db } = global;

        if (!guildData || typeof guildData !== 'object') {
            return res.status(400).json({ error: 'Invalid guild data' });
        }

        // Ensure guildID is preserved
        guildData.guildID = guildId;

        // Save the entire guild data object
        await db.guildsData.save(guildId, guildData, 'update');

        res.json({ success: true, message: 'Guild data updated successfully' });
    } catch (error) {
        console.error('Error updating guild data:', error);
        res.status(500).json({ error: 'Failed to update guild data: ' + error.message });
    }
});

router.post('/users/:userId/delete', async (req, res) => {
    try {
        const { userId } = req.params;
        const { db } = global;

        await db.userModel.deleteOne({ userID: userId });
        
        const index = global.db.allUserData.findIndex(u => u.userID === userId);
        if (index !== -1) {
            global.db.allUserData.splice(index, 1);
        }

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

router.post('/guilds/:guildId/delete', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { db } = global;

        await db.guildModel.deleteOne({ guildID: guildId });
        
        const index = global.db.allGuildData.findIndex(g => g.guildID === guildId);
        if (index !== -1) {
            global.db.allGuildData.splice(index, 1);
        }

        res.json({ success: true, message: 'Guild deleted successfully' });
    } catch (error) {
        console.error('Error deleting guild:', error);
        res.status(500).json({ error: 'Failed to delete guild' });
    }
});

module.exports = router;
