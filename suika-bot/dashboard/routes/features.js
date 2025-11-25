const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('features', {
        title: 'Features - RentoBot',
        isAuthenticated: req.session.isAuthenticated || false
    });
});

module.exports = router;
