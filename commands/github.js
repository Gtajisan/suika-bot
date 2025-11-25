const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "github",
        aliases: ["gh"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        category: "info",
        description: { en: "Get GitHub user info", ne: "GitHub प्रयोगकर्ता जानकारी" },
        guide: { en: "/github <username>", ne: "/github <नाम>" }
    },
    langs: {
        en: { missing: "❌ /github username", notfound: "❌ Not found", fetching: "🔍 Fetching...", error: "⚠️ Error: %1" },
        ne: { missing: "❌ नाम दिनुहोस्", notfound: "❌ नभेटिएको", fetching: "🔍 खोज्दै", error: "⚠️ त्रुटि: %1" }
    },
    onStart: async ({ ctx, args, getLang }) => {
        if (!args[0]) return ctx.reply(getLang("missing"));
        const username = args[0];
        try {
            const msg = await ctx.reply(getLang("fetching"));
            const res = await axios.get(`https://api.github.com/users/${username}`, { timeout: 10000 });
            const user = res.data;
            if (!user.login) throw new Error('Not found');
            const info = `🐱 <b>GitHub User</b>\n━━━━━━\n<b>User:</b> ${user.login}\n<b>Bio:</b> ${user.bio || 'N/A'}\n<b>Followers:</b> ${user.followers}\n<b>Repos:</b> ${user.public_repos}`;
            await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, undefined, info, { parse_mode: 'HTML' });
        } catch (err) { ctx.reply(getLang("error", err.message.substring(0, 60))); }
    }
};
