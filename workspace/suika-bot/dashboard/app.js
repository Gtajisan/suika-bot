const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const log = require('../logger/log.js');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.use(session({
    secret: 'suika-bot-secret-2025',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/dashboard', require('./routes/dashboard.js'));
app.use('/api', require('./routes/api.js'));
app.use('/commands', require('./routes/commands.js'));

// Home route
app.get('/', (req, res) => {
    res.render('index', { title: 'Suika Bot' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About Suika Bot' });
});

app.get('/features', (req, res) => {
    res.render('features', { title: 'Features' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

function startDashboard() {
    app.listen(PORT, '0.0.0.0', () => {
        log.info(`🍈 Dashboard running on http://0.0.0.0:${PORT}`);
    });
}

module.exports = { app, startDashboard };
