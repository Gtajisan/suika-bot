const { PermissionFlagsBits } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "slowmode",
        aliases: ["slow"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Set or disable slowmode in a channel",
            ne: "च्यानलमा स्लोमोड सेट वा अक्षम गर्नुहोस्"
        },
        category: "moderation",
        guide: {
            en: "{prefix}slowmode <duration>\n{prefix}slowmode off\nDuration format: 5s, 1m, 1h (seconds, minutes, hours)\nMax: 6 hours",
            ne: "{prefix}slowmode <अवधि>\n{prefix}slowmode off\nअवधि ढाँचा: 5s, 1m, 1h (सेकेन्ड, मिनेट, घण्टा)\nअधिकतम: ६ घण्टा"
        },
        slash: true,
        options: [
            {
                name: "duration",
                description: "Slowmode duration (e.g., 5s, 1m, 1h) or 'off' to disable",
                type: 3,
                required: true
            },
            {
                name: "channel",
                description: "Channel to set slowmode in (defaults to current)",
                type: 7,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noPermission: "❌ You need **Manage Channels** permission to use this command!",
            botNoPermission: "❌ I need **Manage Channels** permission to set slowmode!",
            noDuration: "❌ Please specify a duration or 'off' to disable!\nFormat: 5s, 1m, 1h (max 6 hours)",
            invalidDuration: "❌ Invalid duration format! Use: 5s, 1m, 1h (max 6 hours)",
            slowmodeSet: "⏱️ Slowmode set to **%1** in %2!",
            slowmodeDisabled: "✅ Slowmode disabled in %1!",
            slowmodeError: "❌ Failed to set slowmode: %1",
            currentSlowmode: "📌 Current slowmode: **%1**"
        },
        ne: {
            noPermission: "❌ तपाईंलाई यो आदेश प्रयोग गर्न **च्यानल व्यवस्थापन** अनुमति चाहिन्छ!",
            botNoPermission: "❌ मलाई स्लोमोड सेट गर्न **च्यानल व्यवस्थापन** अनुमति चाहिन्छ!",
            noDuration: "❌ कृपया अवधि निर्दिष्ट गर्नुहोस् वा अक्षम गर्न 'off' प्रयोग गर्नुहोस्!\nढाँचा: 5s, 1m, 1h (अधिकतम ६ घण्टा)",
            invalidDuration: "❌ अमान्य अवधि ढाँचा! प्रयोग गर्नुहोस्: 5s, 1m, 1h (अधिकतम ६ घण्टा)",
            slowmodeSet: "⏱️ %2 मा स्लोमोड **%1** मा सेट गरियो!",
            slowmodeDisabled: "✅ %1 मा स्लोमोड अक्षम गरियो!",
            slowmodeError: "❌ स्लोमोड सेट गर्न असफल: %1",
            currentSlowmode: "📌 वर्तमान स्लोमोड: **%1**"
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        const parseDuration = (duration) => {
            if (duration.toLowerCase() === 'off' || duration === '0') {
                return 0;
            }

            const regex = /^(\d+)([smh])$/;
            const match = duration.toLowerCase().match(regex);
            
            if (!match) return null;
            
            const value = parseInt(match[1]);
            const unit = match[2];
            
            let seconds = 0;
            switch (unit) {
                case 's':
                    seconds = value;
                    break;
                case 'm':
                    seconds = value * 60;
                    break;
                case 'h':
                    seconds = value * 60 * 60;
                    break;
            }
            
            const maxSeconds = 6 * 60 * 60;
            if (seconds > maxSeconds || seconds < 0) {
                return null;
            }
            
            return seconds;
        };

        const formatDuration = (seconds) => {
            if (seconds === 0) return 'Off';
            
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            const parts = [];
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            if (secs > 0) parts.push(`${secs}s`);
            
            return parts.join(' ') || '0s';
        };

        const isInteraction = !!interaction;
        const member = isInteraction ? interaction.member : message.member;
        const guild = isInteraction ? interaction.guild : message.guild;
        
        const targetChannel = isInteraction ? 
            (interaction.options.getChannel('channel') || interaction.channel) : 
            (message.mentions.channels.first() || message.channel);

        if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const response = getLang("noPermission");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const response = getLang("botNoPermission");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        const durationStr = isInteraction ? 
            interaction.options.getString('duration') : 
            args[0];

        if (!durationStr) {
            const currentSlowmode = targetChannel.rateLimitPerUser;
            const response = getLang("currentSlowmode", formatDuration(currentSlowmode));
            return isInteraction ? interaction.reply(response) : message.reply(response);
        }

        const duration = parseDuration(durationStr);
        
        if (duration === null) {
            const response = getLang("invalidDuration");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        try {
            await targetChannel.setRateLimitPerUser(duration);

            if (duration === 0) {
                const response = getLang("slowmodeDisabled", targetChannel.toString());
                return isInteraction ? interaction.reply(response) : message.reply(response);
            } else {
                const response = getLang("slowmodeSet", formatDuration(duration), targetChannel.toString());
                return isInteraction ? interaction.reply(response) : message.reply(response);
            }
        } catch (error) {
            const response = getLang("slowmodeError", error.message);
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }
    }
};
