# 🍈 Suika Bot Dashboard

Complete web dashboard for monitoring and managing your Suika Bot.

---

## Features

✨ **Dashboard Overview**
- Real-time bot statistics
- User count & activity tracking
- Command statistics
- Uptime monitoring
- Top users leaderboard

📊 **Statistics Page**
- Total users
- Total commands
- Bot uptime
- Total money in economy
- Total bank balance

🏆 **Leaderboard**
- Top 5 richest users
- Sorted by wallet + bank balance
- User levels and experience

⚡ **Commands List**
- All 98 commands displayed
- Search by category
- Aliases shown
- Command descriptions

---

## How to Run

### Option 1: With Bot (Recommended)
```bash
DASHBOARD=true npm start
```

### Option 2: Standalone
```bash
node -e "require('./dashboard/app.js').startDashboard()"
```

### Access Dashboard
Open in browser:
```
http://localhost:5000
```

---

## File Structure

```
dashboard/
├── app.js                  # Express server
├── public/
│   ├── css/
│   │   └── style.css      # Styling
│   └── js/
├── routes/
│   ├── dashboard.js       # Dashboard page
│   ├── api.js            # API endpoints
│   └── commands.js       # Commands page
└── views/
    ├── index.ejs         # Home page
    ├── dashboard.ejs     # Dashboard
    ├── commands.ejs      # Commands list
    ├── features.ejs      # Features
    ├── about.ejs         # About
    └── 404.ejs          # 404 page
```

---

## Available Routes

| Route | Purpose |
|-------|---------|
| `/` | Home page |
| `/dashboard` | Main dashboard |
| `/commands` | All commands list |
| `/features` | Bot features |
| `/about` | About Suika Bot |
| `/api/stats` | Get bot statistics (JSON) |
| `/api/leaderboard` | Get top users (JSON) |
| `/api/user/:id` | Get user info (JSON) |

---

## API Endpoints

### Get Bot Stats
```bash
GET /api/stats
```

Response:
```json
{
  "users": 150,
  "commands": 98,
  "uptime": 3600,
  "totalMoney": 50000,
  "totalBank": 100000
}
```

### Get Leaderboard
```bash
GET /api/leaderboard
```

Returns top 100 users by balance.

### Get User Info
```bash
GET /api/user/{telegramId}
```

Returns specific user data.

---

## Configuration

Edit `app.js` to customize:

```javascript
const PORT = process.env.DASHBOARD_PORT || 5000;
```

Set environment variable:
```bash
export DASHBOARD_PORT=3000
```

---

## Features

✅ **Real-Time Stats**
- Updates automatically
- Shows current user count
- Displays bot uptime

✅ **Responsive Design**
- Works on desktop
- Mobile friendly
- Modern styling

✅ **Fast & Lightweight**
- Minimal dependencies
- Quick load times
- Efficient database queries

✅ **Security**
- No hardcoded credentials
- Safe database access
- Input validation

---

## Styling

The dashboard uses a modern gradient theme:
- Purple gradient background (#667eea to #764ba2)
- White cards with shadows
- Responsive grid layout
- Clean, minimal design

Customize in `/public/css/style.css`

---

## Example Usage

### View Bot Stats
1. Open dashboard
2. See real-time statistics
3. View top users
4. Monitor uptime

### Check All Commands
1. Go to `/commands`
2. Browse 98 commands
3. See descriptions and aliases
4. Search by category

### Use API
```bash
curl http://localhost:5000/api/stats
curl http://localhost:5000/api/leaderboard
curl http://localhost:5000/api/user/123456789
```

---

## Troubleshooting

### Dashboard won't start
```bash
npm install express express-session ejs body-parser cookie-parser
npm start
```

### Port already in use
```bash
export DASHBOARD_PORT=3000
npm start
```

### Can't connect to database
- Check database initialization
- Verify `/data/suika.db` exists
- Check database permissions

---

## Performance Tips

- Dashboard loads stats from cache
- API responses cached for 30 seconds
- Images lazy loaded
- CSS/JS minified

---

## Future Enhancements

- [ ] Admin controls
- [ ] User management
- [ ] Command management
- [ ] Economy adjustments
- [ ] Chat history
- [ ] Analytics

---

**Made with ❤️ for Suika Bot**

Dashboard Version: 1.0.0  
Last Updated: November 25, 2025
