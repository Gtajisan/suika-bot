const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const commands = Array.from(global.SuikaBot.commands.values()).map(cmd => ({
        name: cmd.config.name,
        aliases: cmd.config.aliases || [],
        category: cmd.config.category || 'General',
        description: cmd.config.description.en || 'No description',
        cooldown: cmd.config.countDown || 0
    })).sort((a, b) => a.name.localeCompare(b.name));

    res.render('commands', { title: 'Commands - Suika Bot', commands });
});

router.get('/api', (req, res) => {
    const commands = Array.from(global.SuikaBot.commands.values()).map(cmd => ({
        name: cmd.config.name,
        aliases: cmd.config.aliases || [],
        category: cmd.config.category || 'General',
        description: cmd.config.description.en || 'No description'
    }));
    res.json(commands);
});

module.exports = router;
