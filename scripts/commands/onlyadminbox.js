const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "onlyadminbox",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Toggle admin-channel mode for the bot",
            ne: "बटको लागि प्रशासक-च्यानल मोड टगल गर्नुहोस्"
        },
        category: "owner",
        guide: {
            en: "{prefix}onlyadminbox [on/off]\n{prefix}onlyadminbox - Shows current status and admin channels",
            ne: "{prefix}onlyadminbox [on/off]\n{prefix}onlyadminbox - हालको स्थिति र प्रशासक च्यानलहरू देखाउँछ"
        },
        slash: true,
        options: [
            {
                name: "mode",
                description: "Turn admin-channel mode on or off",
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
            currentStatus: "📦 **Admin-Guild Mode Status**\nCurrent: **%1**\n\n**Admin Guilds:**\n%2\n\nWhen enabled, commands can only be used in any channel of designated admin guilds.\nDMs are always allowed regardless of this setting.\n\nUse `%3onlyadminbox on` to enable or `%3onlyadminbox off` to disable.",
            enableSuccess: "✅ **Admin-guild mode enabled**\nCommands can now only be used in any channel of designated admin guilds.\n\n**Active Admin Guilds:**\n%1",
            disableSuccess: "✅ **Admin-guild mode disabled**\nCommands can now be used in any guild (subject to command-specific restrictions).",
            alreadyEnabled: "⚠️ Admin-guild mode is already enabled",
            alreadyDisabled: "⚠️ Admin-guild mode is already disabled",
            noAdminChannels: "⚠️ No admin guilds configured!\nPlease configure admin guilds in config.json under `bot.adminChannels` (with guildId) before enabling this mode.",
            saveError: "❌ Error saving configuration: %1"
        },
        ne: {
            currentStatus: "📦 **प्रशासक-गिल्ड मोड स्थिति**\nहालको: **%1**\n\n**प्रशासक गिल्डहरू:**\n%2\n\nसक्षम गर्दा, आदेशहरू केवल निर्धारित प्रशासक गिल्डहरूको कुनै पनि च्यानलमा प्रयोग गर्न सकिन्छ।\nDMs यो सेटिङको बावजुद सधैं अनुमति दिइन्छ।\n\n`%3onlyadminbox on` सक्षम गर्न वा `%3onlyadminbox off` असक्षम गर्न प्रयोग गर्नुहोस्।",
            enableSuccess: "✅ **प्रशासक-गिल्ड मोड सक्षम गरियो**\nआदेशहरू अब केवल निर्धारित प्रशासक गिल्डहरूको कुनै पनि च्यानलमा प्रयोग गर्न सकिन्छ।\n\n**सक्रिय प्रशासक गिल्डहरू:**\n%1",
            disableSuccess: "✅ **प्रशासक-गिल्ड मोड असक्षम गरियो**\nआदेशहरू अब कुनै पनि गिल्डमा प्रयोग गर्न सकिन्छ (आदेश-विशिष्ट प्रतिबन्धहरूको अधीनमा)।",
            alreadyEnabled: "⚠️ प्रशासक-गिल्ड मोड पहिले नै सक्षम छ",
            alreadyDisabled: "⚠️ प्रशासक-गिल्ड मोड पहिले नै असक्षम छ",
            noAdminChannels: "⚠️ कुनै प्रशासक गिल्डहरू कन्फिगर गरिएको छैन!\nयो मोड सक्षम गर्नु अघि कृपया config.json मा `bot.adminChannels` (guildId सहित) अन्तर्गत प्रशासक गिल्डहरू कन्फिगर गर्नुहोस्।",
            saveError: "❌ कन्फिगरेसन सेभ गर्दा त्रुटि: %1"
        }
    },

    onStart: async ({ message, interaction, args, getLang, prefix, client }) => {
        const mode = args?.[0] || interaction?.options?.getString('mode');
        const config = global.RentoBot.config;
        
        if (!config.bot.hasOwnProperty('onlyadminchannel')) {
            config.bot.onlyadminchannel = false;
        }

        if (!config.bot.adminChannels || !Array.isArray(config.bot.adminChannels)) {
            config.bot.adminChannels = [];
        }

        const formatAdminChannels = async () => {
            if (config.bot.adminChannels.length === 0) {
                return "None configured";
            }

            const channelList = await Promise.all(
                config.bot.adminChannels.map(async (ac, idx) => {
                    try {
                        const guild = await client.guilds.fetch(ac.guildId).catch(() => null);
                        if (!guild) return `${idx + 1}. Unknown Server (${ac.guildId})`;
                        
                        return `${idx + 1}. ${guild.name} (ID: ${ac.guildId})`;
                    } catch {
                        return `${idx + 1}. Unknown Server (${ac.guildId})`;
                    }
                })
            );

            return channelList.join("\n");
        };

        if (!mode) {
            const currentStatus = config.bot.onlyadminchannel ? "ON ✅" : "OFF ❌";
            const channelsList = await formatAdminChannels();
            const response = getLang("currentStatus", currentStatus, channelsList, prefix || "!");
            return message ? message.reply(response) : interaction.reply(response);
        }

        const modeLower = mode.toLowerCase();

        if (modeLower === 'on' || modeLower === 'enable' || modeLower === 'true' || modeLower === '1') {
            if (config.bot.adminChannels.length === 0) {
                const response = getLang("noAdminChannels");
                return message ? message.reply(response) : interaction.reply(response);
            }

            if (config.bot.onlyadminchannel === true) {
                const response = getLang("alreadyEnabled");
                return message ? message.reply(response) : interaction.reply(response);
            }

            config.bot.onlyadminchannel = true;
            
            try {
                const configPath = path.join(process.cwd(), 'config.json');
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                const channelsList = await formatAdminChannels();
                const response = getLang("enableSuccess", channelsList);
                return message ? message.reply(response) : interaction.reply(response);
            } catch (error) {
                const response = getLang("saveError", error.message);
                return message ? message.reply(response) : interaction.reply(response);
            }
        }
        
        else if (modeLower === 'off' || modeLower === 'disable' || modeLower === 'false' || modeLower === '0') {
            if (config.bot.onlyadminchannel === false) {
                const response = getLang("alreadyDisabled");
                return message ? message.reply(response) : interaction.reply(response);
            }

            config.bot.onlyadminchannel = false;
            
            try {
                const configPath = path.join(process.cwd(), 'config.json');
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                const response = getLang("disableSuccess");
                return message ? message.reply(response) : interaction.reply(response);
            } catch (error) {
                const response = getLang("saveError", error.message);
                return message ? message.reply(response) : interaction.reply(response);
            }
        }
        
        else {
            const currentStatus = config.bot.onlyadminchannel ? "ON ✅" : "OFF ❌";
            const channelsList = await formatAdminChannels();
            const response = getLang("currentStatus", currentStatus, channelsList, prefix || "!");
            return message ? message.reply(response) : interaction.reply(response);
        }
    }
};
