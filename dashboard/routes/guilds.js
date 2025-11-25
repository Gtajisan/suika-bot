const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const client = global.RentoBot.client;
        let guilds = global.db.allGuildData;

        if (search) {
            guilds = guilds.filter(guild => 
                guild.guildID.includes(search) || 
                (guild.guildName && guild.guildName.toLowerCase().includes(search.toLowerCase()))
            );
        }

        const guildsWithData = guilds.map(guild => {
            const discordGuild = client.guilds.cache.get(guild.guildID);
            return {
                ...guild,
                memberCount: discordGuild ? discordGuild.memberCount : 0,
                isInGuild: !!discordGuild
            };
        });

        const totalGuilds = guildsWithData.length;
        const totalPages = Math.ceil(totalGuilds / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedGuilds = guildsWithData.slice(startIndex, endIndex);

        res.render('guilds', {
            user: req.session.user,
            guilds: paginatedGuilds,
            search,
            pagination: {
                page,
                limit,
                totalGuilds,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Guilds list error:', error);
        res.status(500).send('Error loading guilds');
    }
});

router.get('/edit/:guildID', async (req, res) => {
    try {
        const guildData = await global.db.guildsData.get(req.params.guildID);
        res.json({ success: true, guild: guildData });
    } catch (error) {
        console.error('Get guild error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/edit/:guildID', async (req, res) => {
    try {
        const { guildID } = req.params;
        const { prefix, language, welcomeEnabled, leaveEnabled, levelUpEnabled } = req.body;

        const currentData = await global.db.guildsData.get(guildID);
        
        const updateData = {
            prefix: prefix || '!',
            settings: {
                ...currentData.settings,
                language: language || 'en',
                welcomeEnabled: welcomeEnabled === 'true',
                leaveEnabled: leaveEnabled === 'true',
                levelUpEnabled: levelUpEnabled === 'true'
            }
        };

        await global.db.guildsData.set(guildID, updateData);
        res.json({ success: true, message: 'Guild updated successfully' });
    } catch (error) {
        console.error('Edit guild error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/ban/:guildID', async (req, res) => {
    try {
        const { guildID } = req.params;
        const { reason } = req.body;

        await global.db.guildsData.set(guildID, {
            banned: {
                status: true,
                reason: reason || 'No reason provided',
                date: new Date().toISOString()
            }
        });

        res.json({ success: true, message: 'Guild banned successfully' });
    } catch (error) {
        console.error('Ban guild error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/unban/:guildID', async (req, res) => {
    try {
        const { guildID } = req.params;

        await global.db.guildsData.set(guildID, {
            banned: {
                status: false,
                reason: '',
                date: ''
            }
        });

        res.json({ success: true, message: 'Guild unbanned successfully' });
    } catch (error) {
        console.error('Unban guild error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/leave/:guildID', async (req, res) => {
    try {
        const { guildID } = req.params;
        const client = global.RentoBot.client;
        
        const guild = client.guilds.cache.get(guildID);
        if (!guild) {
            return res.json({ success: false, message: 'Bot is not in this guild' });
        }

        await guild.leave();
        res.json({ success: true, message: `Successfully left guild: ${guild.name}` });
    } catch (error) {
        console.error('Leave guild error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/bulk-ban', async (req, res) => {
    try {
        const { guildIDs, reason } = req.body;
        
        if (!guildIDs || !Array.isArray(guildIDs) || guildIDs.length === 0) {
            return res.json({ success: false, message: 'No guilds selected' });
        }

        let successCount = 0;
        let failCount = 0;

        for (const guildID of guildIDs) {
            try {
                await global.db.guildsData.set(guildID, {
                    banned: {
                        status: true,
                        reason: reason || 'Bulk ban action',
                        date: new Date().toISOString()
                    }
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to ban guild ${guildID}:`, err);
                failCount++;
            }
        }

        res.json({ 
            success: true, 
            message: `Banned ${successCount} guilds. ${failCount > 0 ? `Failed: ${failCount}` : ''}` 
        });
    } catch (error) {
        console.error('Bulk ban error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/bulk-unban', async (req, res) => {
    try {
        const { guildIDs } = req.body;
        
        if (!guildIDs || !Array.isArray(guildIDs) || guildIDs.length === 0) {
            return res.json({ success: false, message: 'No guilds selected' });
        }

        let successCount = 0;
        let failCount = 0;

        for (const guildID of guildIDs) {
            try {
                await global.db.guildsData.set(guildID, {
                    banned: {
                        status: false,
                        reason: '',
                        date: ''
                    }
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to unban guild ${guildID}:`, err);
                failCount++;
            }
        }

        res.json({ 
            success: true, 
            message: `Unbanned ${successCount} guilds. ${failCount > 0 ? `Failed: ${failCount}` : ''}` 
        });
    } catch (error) {
        console.error('Bulk unban error:', error);
        res.json({ success: false, message: error.message });
    }
});

module.exports = router;
