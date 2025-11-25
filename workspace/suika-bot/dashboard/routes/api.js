const express = require('express');
const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const usersData = global.db.usersData;
        const allUsers = await usersData.getAll();
        
        const stats = {
            totalUsers: allUsers.length,
            totalCommands: global.SuikaBot.commands.size,
            totalMoney: allUsers.reduce((sum, u) => sum + u.money, 0),
            totalBank: allUsers.reduce((sum, u) => sum + u.bank, 0)
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const usersData = global.db.usersData;
        const allUsers = await usersData.getAll();
        
        const users = allUsers
            .sort((a, b) => (b.money + b.bank) - (a.money + a.bank))
            .slice(0, 20)
            .map(u => ({
                telegramId: u.telegramId,
                money: u.money,
                bank: u.bank,
                total: u.money + u.bank
            }));
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/commands', (req, res) => {
    try {
        const commands = Array.from(global.SuikaBot.commands.values()).map(cmd => ({
            name: cmd.config.name,
            category: cmd.config.category,
            description: cmd.config.description.en,
            author: cmd.config.author
        }));
        
        res.json(commands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
