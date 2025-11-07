const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "autodl",
        aliases: ["autodownload", "autodownloader"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 1,
        description: {
            en: "Toggle auto-download for TikTok, CapCut, Spotify, Instagram, and Facebook links",
            ne: "TikTok, CapCut, Spotify, Instagram र Facebook लिङ्कहरूको स्वतः डाउनलोड टगल गर्नुहोस्"
        },
        category: "admin",
        guide: {
            en: "{prefix}autodl on - Enable auto download\n{prefix}autodl off - Disable auto download\n{prefix}autodl - Check current status",
            ne: "{prefix}autodl on - स्वतः डाउनलोड सक्षम गर्नुहोस्\n{prefix}autodl off - स्वतः डाउनलोड असक्षम गर्नुहोस्\n{prefix}autodl - हालको स्थिति जाँच गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Enable or disable auto download",
                type: 3,
                required: false,
                choices: [
                    { name: "on", value: "on" },
                    { name: "off", value: "off" },
                    { name: "status", value: "status" }
                ]
            }
        ]
    },

    langs: {
        en: {
            enabled: "✅ **Auto Download Enabled**\n\nThe bot will now automatically detect and download:\n• TikTok videos (tiktok.com)\n• CapCut videos (capcut.com)\n• Spotify tracks (spotify.com)\n• Instagram videos (instagram.com)\n• Facebook videos (facebook.com, fb.watch)",
            disabled: "❌ **Auto Download Disabled**\n\nThe bot will no longer automatically download media from links.\nUse specific commands to download manually.",
            status: "📊 **Auto Download Status**\n\nCurrent Status: %1\n\nSupported Platforms:\n• TikTok (tiktok.com)\n• CapCut (capcut.com)\n• Spotify (spotify.com)\n• Instagram (instagram.com)\n• Facebook (facebook.com, fb.watch)",
            statusEnabled: "✅ Enabled",
            statusDisabled: "❌ Disabled",
            noChange: "ℹ️ Auto download is already %1.",
            invalidAction: "❌ Invalid action! Use `on`, `off`, or leave empty to check status."
        },
        ne: {
            enabled: "✅ **स्वतः डाउनलोड सक्षम गरियो**\n\nबटले अब स्वचालित रूपमा पत्ता लगाउनेछ र डाउनलोड गर्नेछ:\n• TikTok भिडियोहरू (tiktok.com)\n• CapCut भिडियोहरू (capcut.com)\n• Spotify ट्र्याकहरू (spotify.com)\n• Instagram भिडियोहरू (instagram.com)\n• Facebook भिडियोहरू (facebook.com, fb.watch)",
            disabled: "❌ **स्वतः डाउनलोड असक्षम गरियो**\n\nबटले अब लिङ्कबाट मिडिया स्वचालित रूपमा डाउनलोड गर्ने छैन।\nम्यानुअल रूपमा डाउनलोड गर्न विशिष्ट आदेशहरू प्रयोग गर्नुहोस्।",
            status: "📊 **स्वतः डाउनलोड स्थिति**\n\nहालको स्थिति: %1\n\nसमर्थित प्लेटफर्महरू:\n• TikTok (tiktok.com)\n• CapCut (capcut.com)\n• Spotify (spotify.com)\n• Instagram (instagram.com)\n• Facebook (facebook.com, fb.watch)",
            statusEnabled: "✅ सक्षम",
            statusDisabled: "❌ असक्षम",
            noChange: "ℹ️ स्वतः डाउनलोड पहिले नै %1 छ।",
            invalidAction: "❌ अवैध कार्य! `on`, `off` प्रयोग गर्नुहोस्, वा स्थिति जाँच गर्न खाली छोड्नुहोस्।"
        }
    },

    onStart: async ({ message, interaction, args, guildsData, guildData, getLang }) => {
        const isInteraction = !!interaction;
        
        // Get action from interaction or args
        let action = isInteraction ? 
            (interaction.options.getString('action') || 'status') : 
            (args[0]?.toLowerCase() || 'status');

        const currentStatus = guildData.settings?.autoDownload || false;

        if (action === 'status' || (!['on', 'off'].includes(action))) {
            const statusText = currentStatus ? getLang("statusEnabled") : getLang("statusDisabled");
            const response = getLang("status", statusText);
            
            const embed = new EmbedBuilder()
                .setColor(currentStatus ? 0x00FF00 : 0xED4245)
                .setTitle("🔄 Auto Download Settings")
                .setDescription(response)
                .setFooter({ text: "Use 'autodl on' or 'autodl off' to toggle" })
                .setTimestamp();

            return isInteraction ? 
                interaction.reply({ embeds: [embed] }) : 
                message.reply({ embeds: [embed] });
        }

        const newStatus = action === 'on';

        // Check if status is already the same
        if (currentStatus === newStatus) {
            const statusWord = newStatus ? "enabled" : "disabled";
            const response = getLang("noChange", statusWord);
            
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setDescription(response)
                .setTimestamp();

            return isInteraction ? 
                interaction.reply({ embeds: [embed], ephemeral: true }) : 
                message.reply({ embeds: [embed] });
        }

        // Update the setting
        await guildsData.set(guildData.guildID, newStatus, 'settings.autoDownload');

        const response = newStatus ? getLang("enabled") : getLang("disabled");
        
        const embed = new EmbedBuilder()
            .setColor(newStatus ? 0x00FF00 : 0xED4245)
            .setTitle(newStatus ? "✅ Auto Download Enabled" : "❌ Auto Download Disabled")
            .setDescription(response)
            .setFooter({ text: "Setting saved successfully" })
            .setTimestamp();

        return isInteraction ? 
            interaction.reply({ embeds: [embed] }) : 
            message.reply({ embeds: [embed] });
    }
};
