const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

router.get('/', async (req, res) => {
    try {
        const config = global.RentoBot.config;
        
        res.render('config', {
            user: req.session.user,
            config: config.bot,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Config page error:', error);
        res.status(500).send('Error loading config page');
    }
});

router.post('/', async (req, res) => {
    try {
        const { prefix, language, adminBot } = req.body;
        
        const configPath = path.join(__dirname, '../../config.json');
        const config = await fs.readJSON(configPath);
        
        config.bot.prefix = prefix || '!';
        config.bot.language = language || 'en';
        config.bot.adminBot = adminBot ? adminBot.split(',').map(id => id.trim()) : [];
        
        await fs.writeJSON(configPath, config, { spaces: 2 });
        
        global.RentoBot.config = config;
        
        res.redirect('/config?success=Configuration updated successfully');
    } catch (error) {
        console.error('Config update error:', error);
        res.redirect('/config?error=Error updating configuration');
    }
});

module.exports = router;
