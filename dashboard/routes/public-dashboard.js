const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const allGuilds = global.db.allGuildData || [];
        const allUsers = global.db.allUserData || [];

        const totalGuilds = allGuilds.length;
        const totalUsers = allUsers.length;

        let totalCommandsUsed = 0;
        allUsers.forEach(user => {
            if (user.stats?.totalCommandsUsed) {
                totalCommandsUsed += user.stats.totalCommandsUsed;
            }
        });

        res.render('public-dashboard', {
            title: 'Dashboard - RentoBot',
            stats: {
                servers: totalGuilds,
                users: totalUsers,
                commandsUsed: totalCommandsUsed
            },
            isAuthenticated: req.session.isAuthenticated || false
        });
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).send('Error loading dashboard');
    }
});

module.exports = router;
