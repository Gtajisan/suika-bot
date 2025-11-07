const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('privacy', {
        title: 'Privacy Policy - RentoBot',
        isAuthenticated: req.session.isAuthenticated || false
    });
});

module.exports = router;
