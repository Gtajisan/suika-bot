module.exports = {
    config: {
        name: "admin",
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 2,
        description: {
            en: "Manage bot administrators"
        },
        category: "owner"
    },

    langs: {
        en: {
            invalidAction: "❌ Invalid action! Use: add, remove, or list",
            noUser: "❌ Please provide a user ID!",
            addSuccess: "✅ Successfully added User ID %1 as bot admin",
            alreadyAdmin: "⚠️ User ID %1 is already a bot admin",
            removeSuccess: "✅ Successfully removed User ID %1 from bot admins",
            notAdmin: "⚠️ User ID %1 is not a bot admin",
            adminList: "*Bot Administrators:*\n%1",
            noAdmins: "No bot administrators found",
            unauthorized: "❌ You are not authorized to use this command"
        }
    },

    onStart: async ({ ctx, args, getLang }) => {
        try {
            if (!global.SuikaBot.config.bot.adminBot.includes(String(ctx.from.id))) {
                return ctx.reply(getLang("unauthorized"));
            }

            const action = args[0];
            
            if (!action) {
                return ctx.reply(getLang("invalidAction"));
            }

            const config = global.SuikaBot.config;

            if (action === 'add') {
                const userId = args[1];
                if (!userId) {
                    return ctx.reply(getLang("noUser"));
                }

                if (config.bot.adminBot.includes(userId)) {
                    return ctx.reply(getLang("alreadyAdmin", userId));
                }

                config.bot.adminBot.push(userId);
                return ctx.reply(getLang("addSuccess", userId));

            } else if (action === 'remove') {
                const userId = args[1];
                if (!userId) {
                    return ctx.reply(getLang("noUser"));
                }

                if (!config.bot.adminBot.includes(userId)) {
                    return ctx.reply(getLang("notAdmin", userId));
                }

                config.bot.adminBot = config.bot.adminBot.filter(id => id !== userId);
                return ctx.reply(getLang("removeSuccess", userId));

            } else if (action === 'list') {
                if (config.bot.adminBot.length === 0) {
                    return ctx.reply(getLang("noAdmins"));
                }

                const adminList = config.bot.adminBot.map((id, i) => `${i + 1}. \`${id}\``).join('\n');
                return ctx.replyWithMarkdown(getLang("adminList", adminList));
            } else {
                return ctx.reply(getLang("invalidAction"));
            }

        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
