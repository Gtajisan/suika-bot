const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('terms', {
        title: 'Terms of Service - RentoBot',
        isAuthenticated: req.session.isAuthenticated || false
    });
});

module.exports = router;
