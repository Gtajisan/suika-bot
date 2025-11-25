
const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "setrankup",
        aliases: ["levelupmsg", "setlvl"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Configure level up messages",
            ne: "स्तर वृद्धि सन्देशहरू कन्फिगर गर्नुहोस्"
        },
        category: "admin",
        guide: {
            en: "{prefix}setrankup message <text> - Set level up message\n"
                + "{prefix}setrankup channel <#channel> - Set level up channel\n"
                + "{prefix}setrankup on/off - Enable/disable level up messages\n"
                + "{prefix}setrankup show - Show current settings\n\n"
                + "Placeholders:\n"
                + "{user} - Member mention\n"
                + "{level} - New level\n"
                + "{xp} - Total XP",
            ne: "{prefix}setrankup message <पाठ> - स्तर वृद्धि सन्देश सेट गर्नुहोस्\n"
                + "{prefix}setrankup channel <#च्यानल> - स्तर वृद्धि च्यानल सेट गर्नुहोस्\n"
                + "{prefix}setrankup on/off - स्तर वृद्धि सन्देशहरू सक्षम/अक्षम गर्नुहोस्\n"
                + "{prefix}setrankup show - वर्तमान सेटिङहरू देखाउनुहोस्\n\n"
                + "प्लेसहोल्डरहरू:\n"
                + "{user} - सदस्य उल्लेख\n"
                + "{level} - नयाँ स्तर\n"
                + "{xp} - कुल XP"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform",
                type: 3,
                required: true,
                choices: [
                    { name: "message", value: "message" },
                    { name: "channel", value: "channel" },
                    { name: "enable", value: "on" },
                    { name: "disable", value: "off" },
                    { name: "show", value: "show" }
                ]
            },
            {
                name: "value",
                description: "Message text",
                type: 3,
                required: false
            },
            {
                name: "channel",
                description: "Channel for level up messages",
                type: 7,
                required: false
            }
        ]
    },

    langs: {
        en: {
            messageSet: "✅ Level up message set to:\n%1",
            channelSet: "✅ Level up channel set to: %1",
            enabled: "✅ Level up messages enabled",
            disabled: "✅ Level up messages disabled",
            noChannel: "❌ Please mention a channel (e.g., #general)",
            noMessage: "❌ Please provide a level up message",
            currentSettings: "📋 **Current Level Up Settings**\n\n"
                + "**Status:** %1\n"
                + "**Channel:** %2\n"
                + "**Message:** %3\n\n"
                + "**Available placeholders:**\n"
                + "`{user}` - Member mention\n"
                + "`{level}` - New level\n"
                + "`{xp}` - Total XP"
        },
        ne: {
            messageSet: "✅ स्तर वृद्धि सन्देश सेट गरियो:\n%1",
            channelSet: "✅ स्तर वृद्धि च्यानल सेट गरियो: %1",
            enabled: "✅ स्तर वृद्धि सन्देशहरू सक्षम गरियो",
            disabled: "✅ स्तर वृद्धि सन्देशहरू अक्षम गरियो",
            noChannel: "❌ कृपया च्यानल उल्लेख गर्नुहोस् (उदाहरण: #general)",
            noMessage: "❌ कृपया स्तर वृद्धि सन्देश प्रदान गर्नुहोस्",
            currentSettings: "📋 **वर्तमान स्तर वृद्धि सेटिङहरू**\n\n"
                + "**स्थिति:** %1\n"
                + "**च्यानल:** %2\n"
                + "**सन्देश:** %3\n\n"
                + "**उपलब्ध प्लेसहोल्डरहरू:**\n"
                + "`{user}` - सदस्य उल्लेख\n"
                + "`{level}` - नयाँ स्तर\n"
                + "`{xp}` - कुल XP"
        }
    },

    onStart: async ({ message, interaction, args, guildsData, guildData, getLang }) => {
        const isInteraction = !!interaction;
        const subCommand = isInteraction ? 
            interaction.options.getString('action') : 
            (args[0]?.toLowerCase() || 'show');

        if (!subCommand || subCommand === "show") {
            const status = guildData.settings.levelUpEnabled ? "✅ Enabled" : "❌ Disabled";
            const channel = guildData.settings.levelUpChannel 
                ? `<#${guildData.settings.levelUpChannel}>` 
                : "Not set";
            const msg = guildData.data.levelUpMessage || "Not set";

            const response = getLang("currentSettings", status, channel, msg);
            return isInteraction ? interaction.reply(response) : message.reply(response);
        }

        switch (subCommand) {
            case "message":
            case "msg":
            case "text": {
                const messageText = isInteraction ? 
                    interaction.options.getString('value') : 
                    args.slice(1).join(" ");
                    
                if (!messageText) {
                    const response = getLang("noMessage");
                    return isInteraction ? interaction.reply({ content: response, flags: 64 }) : message.reply(response);
                }

                await guildsData.set(message?.guildId || interaction.guildId, {
                    data: {
                        ...guildData.data,
                        levelUpMessage: messageText
                    }
                });

                const response = getLang("messageSet", messageText);
                return isInteraction ? interaction.reply(response) : message.reply(response);
            }

            case "channel":
            case "ch": {
                const channel = isInteraction ? 
                    interaction.options.getChannel('channel') : 
                    (message.mentions.channels.first() || message.guild.channels.cache.get(args[1]));
                    
                if (!channel) {
                    const response = getLang("noChannel");
                    return isInteraction ? interaction.reply({ content: response, flags: 64 }) : message.reply(response);
                }

                await guildsData.set(message?.guildId || interaction.guildId, {
                    settings: {
                        ...guildData.settings,
                        levelUpChannel: channel.id
                    }
                });

                const response = getLang("channelSet", channel.toString());
                return isInteraction ? interaction.reply(response) : message.reply(response);
            }

            case "on":
            case "enable": {
                await guildsData.set(message?.guildId || interaction.guildId, {
                    settings: {
                        ...guildData.settings,
                        levelUpEnabled: true
                    }
                });

                const response = getLang("enabled");
                return isInteraction ? interaction.reply(response) : message.reply(response);
            }

            case "off":
            case "disable": {
                await guildsData.set(message?.guildId || interaction.guildId, {
                    settings: {
                        ...guildData.settings,
                        levelUpEnabled: false
                    }
                });

                const response = getLang("disabled");
                return isInteraction ? interaction.reply(response) : message.reply(response);
            }

            default: {
                const response = "Invalid subcommand. Use `message`, `channel`, `on`, `off`, or `show`";
                return isInteraction ? interaction.reply({ content: response, flags: 64 }) : message.reply(response);
            }
        }
    }
};
