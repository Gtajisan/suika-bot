const express = require('express');
const router = express.Router();
const config = require('../../config.json');

router.get('/', async (req, res) => {
    try {
        const client = req.app.locals.botClient;
        const allGuilds = global.db.allGuildData || [];
        const allUsers = global.db.allUserData || [];
        const allCommands = global.RentoBot.commands;

        res.render('home', {
            title: 'RentoBot - Home',
            clientId: config.discord.clientId,
            stats: {
                servers: allGuilds.length,
                users: allUsers.length,
                commands: allCommands.size
            },
            isAuthenticated: req.session.isAuthenticated || false,
            isAdmin: req.session.isAuthenticated || false,
            users: allUsers,
            guilds: allGuilds,
            config: config
        });
    } catch (error) {
        console.error('Error rendering home:', error);
        res.status(500).send('Error loading home page');
    }
});

module.exports = router;