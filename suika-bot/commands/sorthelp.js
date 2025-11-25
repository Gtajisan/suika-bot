module.exports = {
    config: {
        name: "sorthelp",
        version: "1.2",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Sort help list",
            ne: "मद्दत सूची क्रमबद्ध गर्नुहोस्"
        },
        category: "info",
        guide: {
            en: "{pn} [name | category]",
            ne: "{pn} [नाम | वर्ग]"
        },
        slash: true,
        options: [
            {
                name: "style",
                description: "Sort style (name/list or category)",
                type: 3,
                required: true,
                choices: [
                    { name: "List (by name)", value: "name" },
                    { name: "Category", value: "category" }
                ]
            }
        ]
    },

    langs: {
        en: {
            savedName: "✅ Saved sort help list by name (list mode with pagination)",
            savedCategory: "✅ Saved sort help list by category",
            invalidStyle: "❌ Invalid style! Please use `name` or `category`",
            usage: "**Sort Help Style**\nCurrent style: **%1**\n\nUse `{prefix}sorthelp name` for list mode (paginated)\nUse `{prefix}sorthelp category` for category mode"
        },
        ne: {
            savedName: "✅ नामद्वारा मद्दत सूची क्रमबद्ध बचत गरियो (पृष्ठीकरणसहित सूची मोड)",
            savedCategory: "✅ वर्गद्वारा मद्दत सूची क्रमबद्ध बचत गरियो",
            invalidStyle: "❌ अमान्य शैली! कृपया `name` वा `category` प्रयोग गर्नुहोस्",
            usage: "**मद्दत क्रमबद्ध शैली**\nवर्तमान शैली: **%1**\n\nसूची मोड (पृष्ठीकरण) को लागि `{prefix}sorthelp name` प्रयोग गर्नुहोस्\nवर्ग मोडको लागि `{prefix}sorthelp category` प्रयोग गर्नुहोस्"
        }
    },

    onStart: async function ({ message, interaction, args, usersData, getLang, prefix, event }) {
        const isSlash = !!interaction;
        const userID = isSlash ? interaction.user.id : event.author.id;
        const styleArg = isSlash ? interaction.options.getString('style') : args[0];

        if (!styleArg) {
            const userData = await usersData.get(userID);
            const currentStyle = userData.settings?.sortHelp || "name";
            const response = getLang("usage", currentStyle).replace("{prefix}", prefix);
            return isSlash ? ctx.reply(response) : ctx.reply(response);
        }

        if (styleArg === "name" || styleArg === "list") {
            await usersData.set(userID, "name", "settings.sortHelp");
            const response = getLang("savedName");
            return isSlash ? ctx.reply(response) : ctx.reply(response);
        }
        else if (styleArg === "category") {
            await usersData.set(userID, "category", "settings.sortHelp");
            const response = getLang("savedCategory");
            return isSlash ? ctx.reply(response) : ctx.reply(response);
        }
        else {
            const response = getLang("invalidStyle");
            return isSlash ? ctx.reply(response) : ctx.reply(response);
        }
    }
};
