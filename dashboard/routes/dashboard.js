const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const client = global.RentoBot.client;
        const commands = global.RentoBot.commands;
        
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = global.db.allUserData.length;
        const totalCommands = commands.size;
        
        const uptime = Date.now() - global.RentoBot.startTime;
        const uptimeSeconds = Math.floor(uptime / 1000);
        const uptimeDays = Math.floor(uptimeSeconds / 86400);
        const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
        const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeSecondsRemaining = uptimeSeconds % 60;
        
        const uptimeString = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSecondsRemaining}s`;
        
        const stats = {
            totalGuilds,
            totalUsers,
            totalCommands,
            uptime: uptimeString,
            botUsername: client.user ? client.user.tag : 'Loading...',
            botAvatar: client.user ? client.user.displayAvatarURL() : ''
        };

        res.render('dashboard', {
            user: req.session.user,
            stats
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

module.exports = router;
