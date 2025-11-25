const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "greeting",
        aliases: ["greet", "welcomeleave"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Manage welcome and leave messages for your server",
            ne: "आफ्नो सर्भरको लागि स्वागत र विदाई सन्देशहरू व्यवस्थापन गर्नुहोस्"
        },
        category: "admin",
        guide: {
            en: "**Welcome Settings:**\n"
                + "{prefix}greeting welcome message <text> - Set welcome message\n"
                + "{prefix}greeting welcome channel <#channel> - Set welcome channel\n"
                + "{prefix}greeting welcome on/off - Enable/disable welcome\n"
                + "{prefix}greeting welcome show - Show welcome settings\n\n"
                + "**Leave Settings:**\n"
                + "{prefix}greeting leave message <text> - Set leave message\n"
                + "{prefix}greeting leave channel <#channel> - Set leave channel\n"
                + "{prefix}greeting leave on/off - Enable/disable leave\n"
                + "{prefix}greeting leave show - Show leave settings\n\n"
                + "**Show All:**\n"
                + "{prefix}greeting show - Show all greeting settings\n\n"
                + "**Available Placeholders:**\n"
                + "{userName} - Member's username\n"
                + "{userMention} - Mention the member\n"
                + "{guildName} - Server name\n"
                + "{memberCount} - Total member count",
            ne: "**स्वागत सेटिङहरू:**\n"
                + "{prefix}greeting welcome message <पाठ> - स्वागत सन्देश सेट गर्नुहोस्\n"
                + "{prefix}greeting welcome channel <#च्यानल> - स्वागत च्यानल सेट गर्नुहोस्\n"
                + "{prefix}greeting welcome on/off - स्वागत सक्षम/अक्षम गर्नुहोस्\n"
                + "{prefix}greeting welcome show - स्वागत सेटिङहरू देखाउनुहोस्\n\n"
                + "**विदाई सेटिङहरू:**\n"
                + "{prefix}greeting leave message <पाठ> - विदाई सन्देश सेट गर्नुहोस्\n"
                + "{prefix}greeting leave channel <#च्यानल> - विदाई च्यानल सेट गर्नुहोस्\n"
                + "{prefix}greeting leave on/off - विदाई सक्षम/अक्षम गर्नुहोस्\n"
                + "{prefix}greeting leave show - विदाई सेटिङहरू देखाउनुहोस्\n\n"
                + "**सबै देखाउनुहोस्:**\n"
                + "{prefix}greeting show - सबै ग्रीटिंग सेटिङहरू देखाउनुहोस्"
        },
        slash: true,
        options: [
            {
                name: "type",
                description: "Welcome or Leave settings",
                type: 3,
                required: true,
                choices: [
                    { name: "welcome", value: "welcome" },
                    { name: "leave", value: "leave" },
                    { name: "show", value: "show" }
                ]
            },
            {
                name: "action",
                description: "Action to perform",
                type: 3,
                required: false,
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
                description: "Message text or setting value",
                type: 3,
                required: false
            },
            {
                name: "channel",
                description: "Channel for messages",
                type: 7,
                required: false
            }
        ]
    },

    langs: {
        en: {
            welcomeMessageSet: "✅ Welcome message set to:\n%1",
            leaveMessageSet: "✅ Leave message set to:\n%1",
            welcomeChannelSet: "✅ Welcome channel set to: %1",
            leaveChannelSet: "✅ Leave channel set to: %1",
            welcomeEnabled: "✅ Welcome messages enabled",
            welcomeDisabled: "✅ Welcome messages disabled",
            leaveEnabled: "✅ Leave messages enabled",
            leaveDisabled: "✅ Leave messages disabled",
            noChannel: "❌ Please mention a channel (e.g., #general)",
            noMessage: "❌ Please provide a message",
            invalidType: "❌ Invalid type. Use `welcome` or `leave`",
            invalidAction: "❌ Invalid action. Use `message`, `channel`, `on`, `off`, or `show`",
            allSettings: "📋 **Server Greeting Settings**\n\n"
                + "**🎉 Welcome Messages:**\n"
                + "Status: %1\n"
                + "Channel: %2\n"
                + "Message: %3\n\n"
                + "**👋 Leave Messages:**\n"
                + "Status: %4\n"
                + "Channel: %5\n"
                + "Message: %6\n\n"
                + "**Available Placeholders:**\n"
                + "`{userName}` - Member's username\n"
                + "`{userMention}` - Mention the member\n"
                + "`{guildName}` - Server name\n"
                + "`{memberCount}` - Total member count",
            welcomeSettings: "📋 **Welcome Settings**\n\n"
                + "**Status:** %1\n"
                + "**Channel:** %2\n"
                + "**Message:** %3\n\n"
                + "**Available Placeholders:**\n"
                + "`{userName}` - Member's username\n"
                + "`{userMention}` - Mention the member\n"
                + "`{guildName}` - Server name\n"
                + "`{memberCount}` - Total member count",
            leaveSettings: "📋 **Leave Settings**\n\n"
                + "**Status:** %1\n"
                + "**Channel:** %2\n"
                + "**Message:** %3\n\n"
                + "**Available Placeholders:**\n"
                + "`{userName}` - Member's username\n"
                + "`{userMention}` - Mention the member\n"
                + "`{guildName}` - Server name\n"
                + "`{memberCount}` - Total member count"
        },
        ne: {
            welcomeMessageSet: "✅ स्वागत सन्देश सेट गरियो:\n%1",
            leaveMessageSet: "✅ विदाई सन्देश सेट गरियो:\n%1",
            welcomeChannelSet: "✅ स्वागत च्यानल सेट गरियो: %1",
            leaveChannelSet: "✅ विदाई च्यानल सेट गरियो: %1",
            welcomeEnabled: "✅ स्वागत सन्देशहरू सक्षम गरियो",
            welcomeDisabled: "✅ स्वागत सन्देशहरू अक्षम गरियो",
            leaveEnabled: "✅ विदाई सन्देशहरू सक्षम गरियो",
            leaveDisabled: "✅ विदाई सन्देशहरू अक्षम गरियो",
            noChannel: "❌ कृपया च्यानल उल्लेख गर्नुहोस् (उदाहरण: #general)",
            noMessage: "❌ कृपया सन्देश प्रदान गर्नुहोस्",
            invalidType: "❌ अवैध प्रकार। `welcome` वा `leave` प्रयोग गर्नुहोस्",
            invalidAction: "❌ अवैध कार्य। `message`, `channel`, `on`, `off`, वा `show` प्रयोग गर्नुहोस्",
            allSettings: "📋 **सर्भर ग्रीटिंग सेटिङहरू**\n\n"
                + "**🎉 स्वागत सन्देशहरू:**\n"
                + "स्थिति: %1\n"
                + "च्यानल: %2\n"
                + "सन्देश: %3\n\n"
                + "**👋 विदाई सन्देशहरू:**\n"
                + "स्थिति: %4\n"
                + "च्यानल: %5\n"
                + "सन्देश: %6"
        }
    },

    onStart: async ({ message, interaction, args, guildsData, guildData, getLang }) => {
        const isSlash = !message;
        
        const reply = (content) => {
            if (isSlash) {
                return interaction.reply({ 
                    content, 
                    flags: 64
                });
            }
            return message.reply(content);
        };

        const type = isSlash 
            ? interaction.options.getString("type") 
            : args[0]?.toLowerCase();

        if (!type || type === "show") {
            const wStatus = guildData.settings?.welcomeEnabled ? "✅ Enabled" : "❌ Disabled";
            const wChannel = guildData.settings?.welcomeChannel 
                ? `<#${guildData.settings.welcomeChannel}>` 
                : "Not set";
            const wMsg = guildData.data?.welcomeMessage || "Default message";

            const lStatus = guildData.settings?.leaveEnabled ? "✅ Enabled" : "❌ Disabled";
            const lChannel = guildData.settings?.leaveChannel 
                ? `<#${guildData.settings.leaveChannel}>` 
                : "Not set";
            const lMsg = guildData.data?.leaveMessage || "Default message";

            return reply(getLang("allSettings", wStatus, wChannel, wMsg, lStatus, lChannel, lMsg));
        }

        if (type !== "welcome" && type !== "leave") {
            return reply(getLang("invalidType"));
        }

        const action = isSlash 
            ? interaction.options.getString("action") 
            : args[1]?.toLowerCase();

        if (!action || action === "show") {
            if (type === "welcome") {
                const status = guildData.settings?.welcomeEnabled ? "✅ Enabled" : "❌ Disabled";
                const channel = guildData.settings?.welcomeChannel 
                    ? `<#${guildData.settings.welcomeChannel}>` 
                    : "Not set";
                const msg = guildData.data?.welcomeMessage || "Default message";
                return reply(getLang("welcomeSettings", status, channel, msg));
            } else {
                const status = guildData.settings?.leaveEnabled ? "✅ Enabled" : "❌ Disabled";
                const channel = guildData.settings?.leaveChannel 
                    ? `<#${guildData.settings.leaveChannel}>` 
                    : "Not set";
                const msg = guildData.data?.leaveMessage || "Default message";
                return reply(getLang("leaveSettings", status, channel, msg));
            }
        }

        const guildId = isSlash ? interaction.guildId : message.guildId;

        switch (action) {
            case "message":
            case "msg":
            case "text": {
                const messageText = isSlash 
                    ? interaction.options.getString("value") 
                    : args.slice(2).join(" ");
                
                if (!messageText) {
                    return reply(getLang("noMessage"));
                }

                const dataKey = type === "welcome" ? "welcomeMessage" : "leaveMessage";
                await guildsData.set(guildId, {
                    data: {
                        ...guildData.data,
                        [dataKey]: messageText
                    }
                });

                return reply(getLang(type === "welcome" ? "welcomeMessageSet" : "leaveMessageSet", messageText));
            }

            case "channel":
            case "ch": {
                const channel = isSlash 
                    ? interaction.options.getChannel("channel") 
                    : message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
                
                if (!channel) {
                    return reply(getLang("noChannel"));
                }

                const settingKey = type === "welcome" ? "welcomeChannel" : "leaveChannel";
                await guildsData.set(guildId, {
                    settings: {
                        ...guildData.settings,
                        [settingKey]: channel.id
                    }
                });

                return reply(getLang(type === "welcome" ? "welcomeChannelSet" : "leaveChannelSet", channel.toString()));
            }

            case "on":
            case "enable": {
                const settingKey = type === "welcome" ? "welcomeEnabled" : "leaveEnabled";
                await guildsData.set(guildId, {
                    settings: {
                        ...guildData.settings,
                        [settingKey]: true
                    }
                });

                return reply(getLang(type === "welcome" ? "welcomeEnabled" : "leaveEnabled"));
            }

            case "off":
            case "disable": {
                const settingKey = type === "welcome" ? "welcomeEnabled" : "leaveEnabled";
                await guildsData.set(guildId, {
                    settings: {
                        ...guildData.settings,
                        [settingKey]: false
                    }
                });

                return reply(getLang(type === "welcome" ? "welcomeDisabled" : "leaveDisabled"));
            }

            default:
                return reply(getLang("invalidAction"));
        }
    }
};
