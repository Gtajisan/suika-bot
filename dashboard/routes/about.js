const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('about', {
        title: 'About - RentoBot',
        isAuthenticated: req.session.isAuthenticated || false
    });
});

module.exports = router;
