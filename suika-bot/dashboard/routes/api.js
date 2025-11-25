const express = require('express');
const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const users = await global.db.usersData.getAll();
        res.json({
            users: users.length,
            commands: global.SuikaBot.commands.size,
            uptime: Math.floor((Date.now() - global.SuikaBot.startTime) / 1000),
            totalMoney: users.reduce((s, u) => s + (u.money || 0), 0),
            totalBank: users.reduce((s, u) => s + (u.bank || 0), 0)
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/leaderboard', async (req, res) => {
    try {
        const users = await global.db.usersData.getAll();
        const sorted = users.sort((a, b) => (b.money + b.bank) - (a.money + a.bank)).slice(0, 100);
        res.json(sorted);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/user/:id', async (req, res) => {
    try {
        const user = await global.db.usersData.get(req.params.id);
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
