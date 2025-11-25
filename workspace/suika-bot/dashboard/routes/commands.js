const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const commands = Array.from(global.SuikaBot.commands.values())
            .map(cmd => ({
                name: cmd.config.name,
                aliases: cmd.config.aliases || [],
                category: cmd.config.category,
                description: cmd.config.description.en,
                author: cmd.config.author,
                version: cmd.config.version
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        const categories = [...new Set(commands.map(c => c.category))];

        res.render('commands', { commands, categories });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;
