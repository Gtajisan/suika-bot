const { ActivityType } = require('../adapters/discord-to-telegram.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "setpresence",
        aliases: ["presence", "setactivity"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Set bot presence and activity status",
            ne: "बट उपस्थिति र गतिविधि स्थिति सेट गर्नुहोस्"
        },
        category: "owner",
        guide: {
            en: "{prefix}setpresence playing <text> - Set playing status\n" +
                "{prefix}setpresence watching <text> - Set watching status\n" +
                "{prefix}setpresence listening <text> - Set listening status\n" +
                "{prefix}setpresence competing <text> - Set competing status\n" +
                "{prefix}setpresence status <online|idle|dnd|invisible> - Set bot status\n" +
                "{prefix}setpresence rotate - Start auto-rotation\n" +
                "{prefix}setpresence stop - Stop auto-rotation\n" +
                "Use {servers}, {users}, {prefix} in text for dynamic values",
            ne: "{prefix}setpresence playing <पाठ> - खेल्दै स्थिति सेट गर्नुहोस्\n" +
                "{prefix}setpresence watching <पाठ> - हेर्दै स्थिति सेट गर्नुहोस्\n" +
                "{prefix}setpresence listening <पाठ> - सुन्दै स्थिति सेट गर्नुहोस्\n" +
                "{prefix}setpresence competing <पाठ> - प्रतिस्पर्धा स्थिति सेट गर्नुहोस्\n" +
                "{prefix}setpresence status <online|idle|dnd|invisible> - बट स्थिति सेट गर्नुहोस्\n" +
                "{prefix}setpresence rotate - स्वत: रोटेशन सुरु गर्नुहोस्\n" +
                "{prefix}setpresence stop - स्वत: रोटेशन रोक्नुहोस्\n" +
                "गतिशील मानहरूको लागि पाठमा {servers}, {users}, {prefix} प्रयोग गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform",
                type: 3,
                required: true,
                choices: [
                    { name: "playing", value: "playing" },
                    { name: "watching", value: "watching" },
                    { name: "listening", value: "listening" },
                    { name: "competing", value: "competing" },
                    { name: "status", value: "status" },
                    { name: "rotate", value: "rotate" },
                    { name: "stop", value: "stop" },
                    { name: "list", value: "list" },
                    { name: "stats", value: "stats" }
                ]
            },
            {
                name: "text",
                description: "Activity text or status type",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noText: "❌ Please provide text for the activity!",
            invalidStatus: "❌ Invalid status! Use: online, idle, dnd, or invisible",
            successActivity: "✅ Bot activity set to **%1**: %2",
            successStatus: "✅ Bot status set to: **%1**",
            rotateStart: "✅ Presence rotation started! Bot will rotate through %1 activities every %2 minutes.",
            rotateStop: "✅ Presence rotation stopped!",
            rotateAlready: "⚠️ Presence rotation is already running!",
            rotateNotRunning: "⚠️ Presence rotation is not running!",
            saveError: "❌ Failed to save config: %1",
            invalidAction: "❌ Invalid action! Use: playing, watching, listening, competing, status, rotate, stop, list, or stats",
            listTitle: "📋 **Available Presence Activities** (%1 total)\n\n",
            listItem: "`%1.` **%2** - %3\n",
            statsTitle: "📊 **Presence Manager Statistics**\n\n",
            statsContent: "**Status**: %1\n**Current Activity**: %2\n**Total Activities**: %3\n**Current Index**: %4/%3\n**Rotation Interval**: %5 minutes\n\n**Database Stats**:\n• Total Commands: %6\n• Total Messages: %7\n• Total Users: %8"
        },
        ne: {
            noText: "❌ कृपया गतिविधिको लागि पाठ प्रदान गर्नुहोस्!",
            invalidStatus: "❌ अमान्य स्थिति! प्रयोग गर्नुहोस्: online, idle, dnd, वा invisible",
            successActivity: "✅ बट गतिविधि **%1** मा सेट गरियो: %2",
            successStatus: "✅ बट स्थिति सेट गरियो: **%1**",
            rotateStart: "✅ उपस्थिति रोटेशन सुरु भयो! बटले प्रत्येक %2 मिनेटमा %1 गतिविधिहरू घुमाउनेछ।",
            rotateStop: "✅ उपस्थिति रोटेशन रोकियो!",
            rotateAlready: "⚠️ उपस्थिति रोटेशन पहिले नै चलिरहेको छ!",
            rotateNotRunning: "⚠️ उपस्थिति रोटेशन चलिरहेको छैन!",
            saveError: "❌ कन्फिग बचत गर्न असफल: %1",
            invalidAction: "❌ अमान्य कार्य! प्रयोग गर्नुहोस्: playing, watching, listening, competing, status, rotate, stop, list, वा stats",
            listTitle: "📋 **उपलब्ध उपस्थिति गतिविधिहरू** (%1 कुल)\n\n",
            listItem: "`%1.` **%2** - %3\n",
            statsTitle: "📊 **उपस्थिति प्रबन्धक तथ्याङ्क**\n\n",
            statsContent: "**स्थिति**: %1\n**वर्तमान गतिविधि**: %2\n**कुल गतिविधिहरू**: %3\n**वर्तमान अनुक्रमणिका**: %4/%3\n**रोटेशन अन्तराल**: %5 मिनेट\n\n**डाटाबेस तथ्याङ्क**:\n• कुल आदेशहरू: %6\n• कुल सन्देशहरू: %7\n• कुल प्रयोगकर्ताहरू: %8"
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        const action = (args?.[0] || interaction?.options?.getString('action'))?.toLowerCase();
        const text = args?.slice(1).join(' ') || interaction?.options?.getString('text');

        if (!action) {
            const response = getLang("invalidAction");
            return message ? message.reply(response) : interaction.reply(response);
        }

        const presenceManager = global.RentoBot.presenceManager;
        const config = global.RentoBot.config;

        if (!config.presence) {
            config.presence = {
                enabled: true,
                rotation: false,
                custom: null
            };
        }

        const activityTypes = {
            'playing': ActivityType.Playing,
            'watching': ActivityType.Watching,
            'listening': ActivityType.Listening,
            'competing': ActivityType.Competing
        };

        const validStatuses = ['online', 'idle', 'dnd', 'invisible'];

        switch (action) {
            case 'playing':
            case 'watching':
            case 'listening':
            case 'competing': {
                if (!text) {
                    const response = getLang("noText");
                    return message ? message.reply(response) : interaction.reply(response);
                }

                const activityType = activityTypes[action];
                await presenceManager.setCustomPresence(text, activityType, 'online');

                config.presence = {
                    enabled: true,
                    rotation: false,
                    custom: {
                        name: text,
                        type: action,
                        status: 'online'
                    }
                };

                try {
                    const configPath = path.join(process.cwd(), 'config.json');
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    
                    const response = getLang("successActivity", action, text);
                    return message ? message.reply(response) : interaction.reply(response);
                } catch (error) {
                    const response = getLang("saveError", error.message);
                    return message ? message.reply(response) : interaction.reply(response);
                }
            }

            case 'status': {
                if (!text || !validStatuses.includes(text.toLowerCase())) {
                    const response = getLang("invalidStatus");
                    return message ? message.reply(response) : interaction.reply(response);
                }

                await presenceManager.setStatus(text.toLowerCase());

                if (config.presence.custom) {
                    config.presence.custom.status = text.toLowerCase();
                } else {
                    config.presence.custom = {
                        name: `${global.RentoBot.config.bot.prefix}help`,
                        type: 'playing',
                        status: text.toLowerCase()
                    };
                }

                try {
                    const configPath = path.join(process.cwd(), 'config.json');
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    
                    const response = getLang("successStatus", text);
                    return message ? message.reply(response) : interaction.reply(response);
                } catch (error) {
                    const response = getLang("saveError", error.message);
                    return message ? message.reply(response) : interaction.reply(response);
                }
            }

            case 'rotate': {
                if (presenceManager.isRotating) {
                    const response = getLang("rotateAlready");
                    return message ? message.reply(response) : interaction.reply(response);
                }

                presenceManager.startRotation();
                
                config.presence = {
                    enabled: true,
                    rotation: true,
                    rotationInterval: config.presence.rotationInterval || 3,
                    custom: null
                };

                try {
                    const configPath = path.join(process.cwd(), 'config.json');
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    
                    const totalActivities = presenceManager.presetActivities.length;
                    const interval = config.presence.rotationInterval;
                    const response = getLang("rotateStart", totalActivities, interval);
                    return message ? message.reply(response) : interaction.reply(response);
                } catch (error) {
                    const response = getLang("saveError", error.message);
                    return message ? message.reply(response) : interaction.reply(response);
                }
            }

            case 'list': {
                const activities = presenceManager.getActivities();
                let listMessage = getLang("listTitle", activities.length);

                activities.forEach((activity, index) => {
                    if (index < 20) { // Show first 20
                        listMessage += getLang("listItem", index + 1, activity.type, activity.name);
                    }
                });

                if (activities.length > 20) {
                    listMessage += `\n... and ${activities.length - 20} more activities`;
                }

                return message ? message.reply(listMessage) : interaction.reply(listMessage);
            }

            case 'stats': {
                const status = presenceManager.getStatus();
                const config = global.RentoBot.config;
                const rotatingStatus = status.isRotating ? '🟢 Rotating' : '🔴 Stopped';
                const currentActivity = status.currentActivity?.name || 'None';
                const totalActivities = status.totalActivities;
                const currentIndex = status.currentIndex + 1;
                const interval = config.presence.rotationInterval || 3;
                const totalCommands = status.statsCache.totalCommands.toLocaleString();
                const totalMessages = status.statsCache.totalMessages.toLocaleString();
                const totalUsers = status.statsCache.totalUsers.toLocaleString();

                const response = getLang("statsTitle") + getLang("statsContent", 
                    rotatingStatus, currentActivity, totalActivities, currentIndex, interval,
                    totalCommands, totalMessages, totalUsers
                );

                return message ? message.reply(response) : interaction.reply(response);
            }

            case 'stop': {
                if (!presenceManager.isRotating) {
                    const response = getLang("rotateNotRunning");
                    return message ? message.reply(response) : interaction.reply(response);
                }

                presenceManager.stopRotation();
                
                config.presence.rotation = false;

                try {
                    const configPath = path.join(process.cwd(), 'config.json');
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                    
                    const response = getLang("rotateStop");
                    return message ? message.reply(response) : interaction.reply(response);
                } catch (error) {
                    const response = getLang("saveError", error.message);
                    return message ? message.reply(response) : interaction.reply(response);
                }
            }

            default: {
                const response = getLang("invalidAction");
                return message ? message.reply(response) : interaction.reply(response);
            }
        }
    }
};
