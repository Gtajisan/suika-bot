const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const log = require('../logger/log.js');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'suika-bot-secret',
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
    res.redirect('/dashboard');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

function startDashboard() {
    app.listen(PORT, () => {
        log.info(`Dashboard running on http://localhost:${PORT}`);
    });
}

module.exports = { app, startDashboard };
