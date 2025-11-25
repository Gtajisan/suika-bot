const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "github",
        aliases: ["gh", "gituser"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        category: "info",
        description: {
            en: "Get GitHub user information",
            ne: "GitHub प्रयोगकर्ता जानकारी प्राप्त गर्नुहोस्"
        },
        guide: {
            en: "/github <username>",
            ne: "/github <प्रयोगकर्ता नाम>"
        }
    },

    langs: {
        en: {
            missingUser: "❌ Please provide a GitHub username. Example: /github torvalds",
            notFound: "❌ User not found or API error",
            fetching: "🔍 Fetching GitHub user...",
            error: "⚠️ Error: %1"
        },
        ne: {
            missingUser: "❌ कृपया GitHub प्रयोगकर्ता नाम प्रदान गर्नुहोस्",
            notFound: "❌ प्रयोगकर्ता नभेटिएको",
            fetching: "🔍 GitHub प्रयोगकर्ता खोज्दै...",
            error: "⚠️ त्रुटि: %1"
        }
    },

    onStart: async ({ ctx, args, getLang }) => {
        if (!args[0]) {
            return ctx.reply(getLang("missingUser"));
        }

        const username = args[0];
        const githubApiUrl = `https://api.github.com/users/${username}`;
        const tempDir = path.join(__dirname, "../temp");

        try {
            const msg = await ctx.reply(getLang("fetching"));
            fs.ensureDirSync(tempDir);

            const response = await axios.get(githubApiUrl, { timeout: 10000 });
            const userData = response.data;

            if (!userData || !userData.login) {
                await ctx.telegram.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});
                return ctx.reply(getLang("notFound"));
            }

            const userDetails = [
                `🐱 <b>GitHub User</b>`,
                `━━━━━━━━━━━━━━`,
                `<b>Username:</b> ${userData.login}`,
                `<b>Bio:</b> ${userData.bio || 'Not set'}`,
                `<b>Location:</b> ${userData.location || 'Not set'}`,
                `<b>Followers:</b> ${userData.followers}`,
                `<b>Following:</b> ${userData.following}`,
                `<b>Public Repos:</b> ${userData.public_repos}`,
                `<b>Created:</b> ${new Date(userData.created_at).toLocaleDateString()}`,
                `<b>Profile:</b> <a href="${userData.html_url}">View on GitHub</a>`,
                `━━━━━━━━━━━━━━`
            ].join('\n');

            try {
                const imgResponse = await axios.get(userData.avatar_url, { responseType: 'arraybuffer' });
                const tempFilePath = path.join(tempDir, `github_${username}.jpg`);
                fs.writeFileSync(tempFilePath, Buffer.from(imgResponse.data));

                await ctx.replyWithPhoto(
                    { source: tempFilePath },
                    { caption: userDetails, parse_mode: 'HTML' }
                );

                fs.unlinkSync(tempFilePath);
            } catch (photoErr) {
                await ctx.reply(userDetails, { parse_mode: 'HTML' });
            }

            await ctx.telegram.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});

        } catch (error) {
            ctx.reply(getLang("error", error.message.substring(0, 80)));
        }
    }
};
