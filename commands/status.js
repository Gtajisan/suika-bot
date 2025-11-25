const { Markup } = require('telegraf');

module.exports = {
    config: {
        name: "status",
        aliases: ["info", "botinfo"],
        description: {
            en: "View bot status and information"
        },
        category: "Info",
        countDown: 3
    },
    run: async (msg, args, bot) => {
        const uptime = Math.floor((Date.now() - global.SuikaBot.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        const users = await global.db.usersData.getAll();
        const totalMoney = users.reduce((sum, u) => sum + (u.money || 0), 0);
        const totalBank = users.reduce((sum, u) => sum + (u.bank || 0), 0);

        const categories = {};
        for (const cmd of global.SuikaBot.commands.values()) {
            const cat = cmd.config.category || 'General';
            categories[cat] = (categories[cat] || 0) + 1;
        }

        const statusText = `
🍈 <b>SUIKA BOT STATUS</b>

📱 <b>Bot Information:</b>
├ Bot Name: Suika Bot
├ Developer: Gtajisan
├ Framework: Telegraf.js
└ Version: 1.0.0

⚡ <b>Commands:</b>
├ Total: ${global.SuikaBot.commands.size}
${Object.entries(categories).map(([cat, count]) => `├ ${cat}: ${count}`).join('\n')}
└ Status: ✅ All Loaded

⏱️ <b>Uptime:</b>
├ ${hours}h ${minutes}m ${seconds}s
└ Last Restart: Just now

👥 <b>User Statistics:</b>
├ Total Users: ${users.length}
├ Total Money: $${totalMoney.toLocaleString()}
├ Bank Balance: $${totalBank.toLocaleString()}
└ Avg Balance: $${Math.round((totalMoney + totalBank) / (users.length || 1)).toLocaleString()}

💾 <b>Database:</b>
├ Type: SQLite
├ Status: ✅ Active
├ Collections: ${Object.keys(global.db).length}
└ Size: N/A

🖥️ <b>System:</b>
├ Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB
├ Platform: ${process.platform}
├ Node Version: ${process.version}
└ Timezone: Asia/Kathmandu
        `;

        return msg.reply(statusText, { parse_mode: 'HTML' });
    }
};
