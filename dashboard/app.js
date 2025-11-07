const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const log = require('../logger/log.js');

module.exports = function(client) {
    const app = express();
    const config = global.RentoBot.config;

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(session({
        secret: config.dashboard.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    }));

    app.locals.botClient = client;
    app.locals.config = config;
    
    app.use((req, res, next) => {
        res.locals.botClient = client;
        res.locals.isAuthenticated = req.session && req.session.user ? true : false;
        res.locals.user = req.session ? req.session.user : null;
        next();
    });

    const authMiddleware = require('./middleware/auth.js');

    app.use('/api', require('./routes/api.js'));
    app.use('/login', require('./routes/login.js'));
    app.use('/', require('./routes/home.js'));
    app.use('/home', require('./routes/home.js'));
    app.use('/dashboard', require('./routes/public-dashboard.js'));
    app.use('/about', require('./routes/about.js'));
    app.use('/features', require('./routes/features.js'));
    app.use('/commands', require('./routes/commands.js'));
    app.use('/terms', require('./routes/terms.js'));
    app.use('/privacy', require('./routes/privacy.js'));
    app.use('/admin', authMiddleware, require('./routes/admin.js'));

    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });

    app.use((req, res) => {
        res.status(404).render('404', { title: '404 - Not Found' });
    });

    const PORT = config.dashboard.port || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        log.success("DASHBOARD", `Dashboard is running on port ${PORT}`);
        log.info("DASHBOARD", `Visit http://localhost:${PORT} to access the dashboard`);
    });

    return app;
};
