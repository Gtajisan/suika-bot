const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const usersData = global.db.usersData;
        const allUsers = await usersData.getAll();
        
        const uptime = Date.now() - global.SuikaBot.startTime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor(uptime / 3600000) % 24;
        const minutes = Math.floor(uptime / 60000) % 60;
        const seconds = Math.floor(uptime / 1000) % 60;
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        
        const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const botInfo = await global.SuikaBot.bot.telegram.getMe();
        
        const stats = {
            totalUsers: allUsers.length,
            totalCommands: global.SuikaBot.commands.size,
            totalMoney: allUsers.reduce((sum, u) => sum + u.money, 0),
            totalBank: allUsers.reduce((sum, u) => sum + u.bank, 0),
            uptime: uptimeStr,
            memory: memoryUsage,
            ping: 0,
            botUsername: botInfo.username,
            botId: botInfo.id
        };

        const topUsers = allUsers
            .sort((a, b) => (b.money + b.bank) - (a.money + a.bank))
            .slice(0, 10);

        res.render('dashboard', {
            stats,
            topUsers,
            nodeVersion: process.version,
            platform: require('os').platform()
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;
