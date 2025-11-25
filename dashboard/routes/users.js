const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        let users = global.db.allUserData;

        if (search) {
            users = users.filter(user => 
                user.userID.includes(search) || 
                (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
            );
        }

        const totalUsers = users.length;
        const totalPages = Math.ceil(totalUsers / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = users.slice(startIndex, endIndex);

        res.render('users', {
            user: req.session.user,
            users: paginatedUsers,
            search,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Users list error:', error);
        res.status(500).send('Error loading users');
    }
});

router.get('/edit/:userID', async (req, res) => {
    try {
        const userData = await global.db.usersData.get(req.params.userID);
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error('Get user error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/edit/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        const { money, bank, level, exp } = req.body;

        const updateData = {
            money: parseInt(money) || 0,
            bank: parseInt(bank) || 0,
            level: parseInt(level) || 1,
            exp: parseInt(exp) || 0
        };

        await global.db.usersData.set(userID, updateData);
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Edit user error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/ban/:userID', async (req, res) => {
    try {
        const { userID } = req.params;
        const { reason } = req.body;

        await global.db.usersData.set(userID, {
            banned: {
                status: true,
                reason: reason || 'No reason provided',
                date: new Date().toISOString()
            }
        });

        res.json({ success: true, message: 'User banned successfully' });
    } catch (error) {
        console.error('Ban user error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/unban/:userID', async (req, res) => {
    try {
        const { userID } = req.params;

        await global.db.usersData.set(userID, {
            banned: {
                status: false,
                reason: '',
                date: ''
            }
        });

        res.json({ success: true, message: 'User unbanned successfully' });
    } catch (error) {
        console.error('Unban user error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/bulk-ban', async (req, res) => {
    try {
        const { userIDs, reason } = req.body;
        
        if (!userIDs || !Array.isArray(userIDs) || userIDs.length === 0) {
            return res.json({ success: false, message: 'No users selected' });
        }

        let successCount = 0;
        let failCount = 0;

        for (const userID of userIDs) {
            try {
                await global.db.usersData.set(userID, {
                    banned: {
                        status: true,
                        reason: reason || 'Bulk ban action',
                        date: new Date().toISOString()
                    }
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to ban user ${userID}:`, err);
                failCount++;
            }
        }

        res.json({ 
            success: true, 
            message: `Banned ${successCount} users. ${failCount > 0 ? `Failed: ${failCount}` : ''}` 
        });
    } catch (error) {
        console.error('Bulk ban error:', error);
        res.json({ success: false, message: error.message });
    }
});

router.post('/bulk-unban', async (req, res) => {
    try {
        const { userIDs } = req.body;
        
        if (!userIDs || !Array.isArray(userIDs) || userIDs.length === 0) {
            return res.json({ success: false, message: 'No users selected' });
        }

        let successCount = 0;
        let failCount = 0;

        for (const userID of userIDs) {
            try {
                await global.db.usersData.set(userID, {
                    banned: {
                        status: false,
                        reason: '',
                        date: ''
                    }
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to unban user ${userID}:`, err);
                failCount++;
            }
        }

        res.json({ 
            success: true, 
            message: `Unbanned ${successCount} users. ${failCount > 0 ? `Failed: ${failCount}` : ''}` 
        });
    } catch (error) {
        console.error('Bulk unban error:', error);
        res.json({ success: false, message: error.message });
    }
});

module.exports = router;
