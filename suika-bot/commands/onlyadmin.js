const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "onlyadmin",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Toggle admin-only mode for the bot",
            ne: "बटको लागि प्रशासक-मात्र मोड टगल गर्नुहोस्"
        },
        category: "owner",
        guide: {
            en: "{prefix}onlyadmin [on/off]\n{prefix}onlyadmin - Shows current status",
            ne: "{prefix}onlyadmin [on/off]\n{prefix}onlyadmin - हालको स्थिति देखाउँछ"
        },
        slash: true,
        options: [
            {
                name: "mode",
                description: "Turn admin-only mode on or off",
                type: 3,
                required: false,
                choices: [
                    { name: "on", value: "on" },
                    { name: "off", value: "off" }
                ]
            }
        ]
    },

    langs: {
        en: {
            currentStatus: "🔒 **Admin-Only Mode Status**\nCurrent: **%1**\n\nWhen enabled, only bot administrators can use any commands.\n\nUse `%2onlyadmin on` to enable or `%2onlyadmin off` to disable.",
            enableSuccess: "✅ **Admin-only mode enabled**\nOnly bot administrators can now use the bot commands.",
            disableSuccess: "✅ **Admin-only mode disabled**\nAll users can now use the bot commands (subject to command-specific restrictions).",
            alreadyEnabled: "⚠️ Admin-only mode is already enabled",
            alreadyDisabled: "⚠️ Admin-only mode is already disabled",
            saveError: "❌ Error saving configuration: %1"
        },
        ne: {
            currentStatus: "🔒 **प्रशासक-मात्र मोड स्थिति**\nहालको: **%1**\n\nसक्षम गर्दा, केवल बट प्रशासकहरूले कुनै पनि आदेशहरू प्रयोग गर्न सक्छन्।\n\n`%2onlyadmin on` सक्षम गर्न वा `%2onlyadmin off` असक्षम गर्न प्रयोग गर्नुहोस्।",
            enableSuccess: "✅ **प्रशासक-मात्र मोड सक्षम गरियो**\nअब केवल बट प्रशासकहरूले बट आदेशहरू प्रयोग गर्न सक्छन्।",
            disableSuccess: "✅ **प्रशासक-मात्र मोड असक्षम गरियो**\nअब सबै प्रयोगकर्ताहरूले बट आदेशहरू प्रयोग गर्न सक्छन् (आदेश-विशिष्ट प्रतिबन्धहरूको अधीनमा)।",
            alreadyEnabled: "⚠️ प्रशासक-मात्र मोड पहिले नै सक्षम छ",
            alreadyDisabled: "⚠️ प्रशासक-मात्र मोड पहिले नै असक्षम छ",
            saveError: "❌ कन्फिगरेसन सेभ गर्दा त्रुटि: %1"
        }
    },

    onStart: async ({ message, interaction, args, getLang, prefix }) => {
        const mode = args?.[0] || interaction?.options?.getString('mode');
        const config = global.RentoBot.config;
        
        if (!config.bot.hasOwnProperty('onlyadmin')) {
            config.bot.onlyadmin = false;
        }

        if (!mode) {
            const currentStatus = config.bot.onlyadmin ? "ON ✅" : "OFF ❌";
            const response = getLang("currentStatus", currentStatus, prefix || "!");
            return message ? ctx.reply(response) : ctx.reply(response);
        }

        const modeLower = mode.toLowerCase();

        if (modeLower === 'on' || modeLower === 'enable' || modeLower === 'true' || modeLower === '1') {
            if (config.bot.onlyadmin === true) {
                const response = getLang("alreadyEnabled");
                return message ? ctx.reply(response) : ctx.reply(response);
            }

            config.bot.onlyadmin = true;
            
            try {
                const configPath = path.join(process.cwd(), 'config.json');
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                const response = getLang("enableSuccess");
                return message ? ctx.reply(response) : ctx.reply(response);
            } catch (error) {
                const response = getLang("saveError", error.message);
                return message ? ctx.reply(response) : ctx.reply(response);
            }
        }
        
        else if (modeLower === 'off' || modeLower === 'disable' || modeLower === 'false' || modeLower === '0') {
            if (config.bot.onlyadmin === false) {
                const response = getLang("alreadyDisabled");
                return message ? ctx.reply(response) : ctx.reply(response);
            }

            config.bot.onlyadmin = false;
            
            try {
                const configPath = path.join(process.cwd(), 'config.json');
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                const response = getLang("disableSuccess");
                return message ? ctx.reply(response) : ctx.reply(response);
            } catch (error) {
                const response = getLang("saveError", error.message);
                return message ? ctx.reply(response) : ctx.reply(response);
            }
        }
        
        else {
            const currentStatus = config.bot.onlyadmin ? "ON ✅" : "OFF ❌";
            const response = getLang("currentStatus", currentStatus, prefix || "!");
            return message ? ctx.reply(response) : ctx.reply(response);
        }
    }
};
