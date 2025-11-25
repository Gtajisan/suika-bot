const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "config",
        aliases: ["settings", "serverconfig"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Display all server configuration settings",
            ne: "सबै सर्भर कन्फिगरेसन सेटिङहरू प्रदर्शन गर्नुहोस्"
        },
        category: "info",
        guide: {
            en: "{prefix}config - Show all server settings",
            ne: "{prefix}config - सबै सर्भर सेटिङहरू देखाउनुहोस्"
        },
        slash: true,
        options: []
    },

    langs: {
        en: {
            title: "⚙️ Server Configuration",
            prefix: "Prefix",
            language: "Language",
            welcomeSettings: "Welcome Settings",
            leaveSettings: "Leave Settings",
            levelUpSettings: "Level Up Settings",
            aliases: "Custom Aliases",
            enabled: "✅ Enabled",
            disabled: "❌ Disabled",
            notSet: "Not set",
            channel: "Channel",
            message: "Message",
            noAliases: "None",
            footer: "Use individual commands to modify settings"
        },
        ne: {
            title: "⚙️ सर्भर कन्फिगरेसन",
            prefix: "उपसर्ग",
            language: "भाषा",
            welcomeSettings: "स्वागत सेटिङहरू",
            leaveSettings: "बिदाई सेटिङहरू",
            levelUpSettings: "स्तर वृद्धि सेटिङहरू",
            aliases: "अनुकूलित उपनामहरू",
            enabled: "✅ सक्षम",
            disabled: "❌ अक्षम",
            notSet: "सेट गरिएको छैन",
            channel: "च्यानल",
            message: "सन्देश",
            noAliases: "कुनै पनि छैन",
            footer: "सेटिङहरू परिमार्जन गर्न व्यक्तिगत आदेशहरू प्रयोग गर्नुहोस्"
        }
    },

    onStart: async ({ message, interaction, guildData, getLang }) => {
        const isInteraction = !!interaction;
        const settings = guildData.settings || {};
        const data = guildData.data || {};

        const embed = new EmbedBuilder()
            .setTitle(getLang("title"))
            .setColor(0x3498db)
            .setTimestamp()
            .setFooter({ text: getLang("footer") });

        embed.addFields(
            {
                name: `📝 ${getLang("prefix")}`,
                value: `\`${guildData.prefix || "!"}\``,
                inline: true
            },
            {
                name: `🌍 ${getLang("language")}`,
                value: `\`${settings.language || "en"}\``,
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: true
            },
            {
                name: `👋 ${getLang("welcomeSettings")}`,
                value: `**Status:** ${settings.welcomeEnabled ? getLang("enabled") : getLang("disabled")}\n`
                    + `**${getLang("channel")}:** ${settings.welcomeChannel ? `<#${settings.welcomeChannel}>` : getLang("notSet")}\n`
                    + `**${getLang("message")}:** ${data.welcomeMessage ? `\`${data.welcomeMessage.substring(0, 50)}${data.welcomeMessage.length > 50 ? "..." : ""}\`` : getLang("notSet")}`,
                inline: false
            },
            {
                name: `👋 ${getLang("leaveSettings")}`,
                value: `**Status:** ${settings.leaveEnabled ? getLang("enabled") : getLang("disabled")}\n`
                    + `**${getLang("channel")}:** ${settings.leaveChannel ? `<#${settings.leaveChannel}>` : getLang("notSet")}\n`
                    + `**${getLang("message")}:** ${data.leaveMessage ? `\`${data.leaveMessage.substring(0, 50)}${data.leaveMessage.length > 50 ? "..." : ""}\`` : getLang("notSet")}`,
                inline: false
            },
            {
                name: `📈 ${getLang("levelUpSettings")}`,
                value: `**Status:** ${settings.levelUpEnabled ? getLang("enabled") : getLang("disabled")}\n`
                    + `**${getLang("channel")}:** ${settings.levelUpChannel ? `<#${settings.levelUpChannel}>` : getLang("notSet")}\n`
                    + `**${getLang("message")}:** ${data.levelUpMessage ? `\`${data.levelUpMessage.substring(0, 50)}${data.levelUpMessage.length > 50 ? "..." : ""}\`` : getLang("notSet")}`,
                inline: false
            }
        );

        if (data.aliases && Object.keys(data.aliases).length > 0) {
            const aliasCount = Object.keys(data.aliases).length;
            const aliasPreview = Object.entries(data.aliases)
                .slice(0, 3)
                .map(([alias, cmd]) => `\`${alias}\` → \`${cmd}\``)
                .join("\n");
            const moreText = aliasCount > 3 ? `\n*...and ${aliasCount - 3} more*` : "";

            embed.addFields({
                name: `🔗 ${getLang("aliases")}`,
                value: aliasPreview + moreText,
                inline: false
            });
        } else {
            embed.addFields({
                name: `🔗 ${getLang("aliases")}`,
                value: getLang("noAliases"),
                inline: false
            });
        }

        return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};
