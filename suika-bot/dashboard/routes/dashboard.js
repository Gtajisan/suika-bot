const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await global.db.usersData.getAll();
        const totalMoney = users.reduce((sum, u) => sum + (u.money || 0), 0);
        const totalBank = users.reduce((sum, u) => sum + (u.bank || 0), 0);
        const topUsers = users.sort((a, b) => (b.money + b.bank) - (a.money + a.bank)).slice(0, 5);

        res.render('dashboard', {
            title: 'Dashboard - Suika Bot',
            stats: { users: users.length, commands: global.SuikaBot.commands.size, uptime: Math.floor((Date.now() - global.SuikaBot.startTime) / 1000), totalMoney, totalBank },
            topUsers
        });
    } catch (error) {
        res.render('dashboard', { title: 'Dashboard - Suika Bot', stats: {}, topUsers: [], error: error.message });
    }
});

module.exports = router;
