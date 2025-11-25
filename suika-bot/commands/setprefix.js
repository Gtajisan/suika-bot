module.exports = {
    config: {
        name: "setprefix",
        aliases: ["prefix"],
        version: "1.1",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Change the bot prefix for this server",
            ne: "यो सर्भरको लागि बट उपसर्ग परिवर्तन गर्नुहोस्"
        },
        category: "admin",
        guide: {
            en: "{prefix}setprefix <new prefix>",
            ne: "{prefix}setprefix <नयाँ उपसर्ग>"
        },
        slash: true,
        options: [
            {
                name: "prefix",
                description: "The new prefix (leave empty to view current)",
                type: 3,
                required: false,
                max_length: 5
            }
        ]
    },

    langs: {
        en: {
            success: "✅ Prefix changed to: **%1**",
            invalid: "❌ Please provide a valid prefix (max 5 characters)",
            current: "📌 Current prefix: **%1**",
            prefixInfo: "ℹ️ The bot prefix for this server is: **%1**\nUse `%1help` to see all commands!"
        },
        ne: {
            success: "✅ उपसर्ग परिवर्तन गरियो: **%1**",
            invalid: "❌ कृपया मान्य उपसर्ग प्रदान गर्नुहोस् (अधिकतम ५ अक्षर)",
            current: "📌 वर्तमान उपसर्ग: **%1**",
            prefixInfo: "ℹ️ यो सर्भरको लागि बट उपसर्ग: **%1**\nसबै आदेशहरू हेर्न `%1help` प्रयोग गर्नुहोस्!"
        }
    },

    onStart: async ({ message, interaction, args, guildsData, guildData, getLang }) => {
        const isInteraction = !!interaction;
        const guildId = isInteraction ? interaction.guildId : message.guildId;
        
        const newPrefix = isInteraction ? 
            interaction.options.getString('prefix') : 
            args[0];

        if (!newPrefix) {
            const response = getLang("current", guildData.prefix);
            return isInteraction ? interaction.reply(response) : message.reply(response);
        }

        if (newPrefix.length > 5) {
            const response = getLang("invalid");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        await guildsData.set(guildId, { prefix: newPrefix });
        const response = getLang("success", newPrefix);
        return isInteraction ? interaction.reply(response) : message.reply(response);
    },

    onChat: async ({ message, guildData, getLang }) => {
        const messageContent = message.content.toLowerCase();
        
        // Check if the message contains the word "prefix"
        if (messageContent.includes('prefix')) {
            const currentPrefix = guildData.prefix || global.RentoBot.config.bot.prefix;
            const response = getLang("prefixInfo", currentPrefix);
            return message.reply(response);
        }
    }
};
