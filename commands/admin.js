const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "admin",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Manage bot administrators",
            ne: "बट प्रशासकहरू व्यवस्थापन गर्नुहोस्"
        },
        category: "owner",
        guide: {
            en: "{prefix}admin add <@user>\n{prefix}admin remove <@user>\n{prefix}admin list",
            ne: "{prefix}admin add <@प्रयोगकर्ता>\n{prefix}admin remove <@प्रयोगकर्ता>\n{prefix}admin list"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform (add/remove/list)",
                type: 3,
                required: true,
                choices: [
                    { name: "add", value: "add" },
                    { name: "remove", value: "remove" },
                    { name: "list", value: "list" }
                ]
            },
            {
                name: "user",
                description: "User to add or remove as admin",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            invalidAction: "Invalid action! Use: add, remove, or list",
            noUser: "Please mention a user or provide a user ID!",
            addSuccess: "✅ Successfully added **%1** as bot admin",
            alreadyAdmin: "⚠️ **%1** is already a bot admin",
            removeSuccess: "✅ Successfully removed **%1** from bot admins",
            notAdmin: "⚠️ **%1** is not a bot admin",
            adminList: "**Bot Administrators:**\n%1",
            noAdmins: "No bot administrators found",
            saveError: "❌ Error saving config: %1"
        },
        ne: {
            invalidAction: "अमान्य कार्य! प्रयोग गर्नुहोस्: add, remove, वा list",
            noUser: "कृपया एक प्रयोगकर्ता उल्लेख गर्नुहोस् वा प्रयोगकर्ता ID प्रदान गर्नुहोस्!",
            addSuccess: "✅ सफलतापूर्वक **%1** लाई बट प्रशासकको रूपमा थपियो",
            alreadyAdmin: "⚠️ **%1** पहिले नै बट प्रशासक हुनुहुन्छ",
            removeSuccess: "✅ सफलतापूर्वक **%1** लाई बट प्रशासकबाट हटाइयो",
            notAdmin: "⚠️ **%1** बट प्रशासक होइनन्",
            adminList: "**बट प्रशासकहरू:**\n%1",
            noAdmins: "कुनै बट प्रशासकहरू फेला परेन",
            saveError: "❌ कन्फिग सेभ गर्दा त्रुटि: %1"
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        const action = args?.[0] || interaction?.options?.getString('action');
        const targetUser = interaction?.options?.getUser('user') || 
                          (message?.mentions?.users?.first()) ||
                          (args?.[1] ? await global.RentoBot.client.users.fetch(args[1]).catch(() => null) : null);

        if (!action) {
            const response = getLang("invalidAction");
            return message ? ctx.reply(response) : ctx.reply(response);
        }

        const config = global.RentoBot.config;
        
        if (!config.bot.adminBot) {
            config.bot.adminBot = [];
        }

        switch (action.toLowerCase()) {
            case 'add': {
                if (!targetUser) {
                    const response = getLang("noUser");
                    return message ? ctx.reply(response) : ctx.reply(response);
                }

                if (config.bot.adminBot.includes(targetUser.id)) {
                    const response = getLang("alreadyAdmin", targetUser.tag);
                    return message ? ctx.reply(response) : ctx.reply(response);
                }

                config.bot.adminBot.push(targetUser.id);
                
                try {
                    const configPath = path.join(process.cwd(), 'config.json');
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    const response = getLang("addSuccess", targetUser.tag);
                    return message ? ctx.reply(response) : ctx.reply(response);
                } catch (error) {
                    const response = getLang("saveError", error.message);
                    return message ? ctx.reply(response) : ctx.reply(response);
                }
            }

            case 'remove': {
                if (!targetUser) {
                    const response = getLang("noUser");
                    return message ? ctx.reply(response) : ctx.reply(response);
                }

                const index = config.bot.adminBot.indexOf(targetUser.id);
                if (index === -1) {
                    const response = getLang("notAdmin", targetUser.tag);
                    return message ? ctx.reply(response) : ctx.reply(response);
                }

                config.bot.adminBot.splice(index, 1);
                
                try {
                    const configPath = path.join(process.cwd(), 'config.json');
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    const response = getLang("removeSuccess", targetUser.tag);
                    return message ? ctx.reply(response) : ctx.reply(response);
                } catch (error) {
                    const response = getLang("saveError", error.message);
                    return message ? ctx.reply(response) : ctx.reply(response);
                }
            }

            case 'list': {
                if (config.bot.adminBot.length === 0) {
                    const response = getLang("noAdmins");
                    return message ? ctx.reply(response) : ctx.reply(response);
                }

                const adminList = await Promise.all(
                    config.bot.adminBot.map(async (id, idx) => {
                        try {
                            const user = await global.RentoBot.client.users.fetch(id);
                            return `${idx + 1}. ${user.tag} (${id})`;
                        } catch {
                            return `${idx + 1}. Unknown User (${id})`;
                        }
                    })
                );

                const response = getLang("adminList", adminList.join("\n"));
                return message ? ctx.reply(response) : ctx.reply(response);
            }

            default: {
                const response = getLang("invalidAction");
                return message ? ctx.reply(response) : ctx.reply(response);
            }
        }
    }
};
