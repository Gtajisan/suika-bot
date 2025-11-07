const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const commands = global.RentoBot.commands;
        const allCommandStats = global.db.allCommandStats || [];
        const sortBy = req.query.sort || 'name';
        
        const commandStatsMap = {};
        allCommandStats.forEach(stat => {
            commandStatsMap[stat.commandName] = stat.executionCount || 0;
        });

        const commandList = Array.from(commands.values()).map(cmd => {
            return {
                name: cmd.config.name,
                description: cmd.config.description?.en || 'No description',
                category: cmd.config.category || 'General',
                usage: commandStatsMap[cmd.config.name] || 0
            };
        });

        if (sortBy === 'usage') {
            commandList.sort((a, b) => b.usage - a.usage);
        } else {
            commandList.sort((a, b) => a.name.localeCompare(b.name));
        }

        res.render('commands', {
            title: 'Commands - RentoBot',
            commands: commandList,
            isAuthenticated: req.session.isAuthenticated || false,
            currentSort: sortBy
        });
    } catch (error) {
        console.error('Error rendering commands:', error);
        res.status(500).send('Error loading commands page');
    }
});

module.exports = router;
