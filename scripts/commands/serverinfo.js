const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "serverinfo",
        aliases: ["server", "guildinfo"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Get detailed information about the server",
            ne: "सर्भरको विस्तृत जानकारी प्राप्त गर्नुहोस्"
        },
        category: "info",
        guide: {
            en: "{prefix}serverinfo",
            ne: "{prefix}serverinfo"
        },
        slash: true
    },

    langs: {
        en: {
            title: "Server Information",
            name: "**Server Name:** %1",
            id: "**Server ID:** `%1`",
            owner: "**Owner:** %1",
            created: "**Created:** %1",
            members: "**Members:** %1",
            channels: "**Channels:** %1",
            roles: "**Roles:** %1",
            boosts: "**Boost Level:** %1",
            boostCount: "**Boosts:** %1",
            verificationLevel: "**Verification Level:** %1",
            noServer: "This command can only be used in a server!"
        },
        ne: {
            title: "सर्भर जानकारी",
            name: "**सर्भर नाम:** %1",
            id: "**सर्भर ID:** `%1`",
            owner: "**मालिक:** %1",
            created: "**सिर्जना:** %1",
            members: "**सदस्यहरू:** %1",
            channels: "**च्यानलहरू:** %1",
            roles: "**भूमिकाहरू:** %1",
            boosts: "**बूस्ट स्तर:** %1",
            boostCount: "**बूस्टहरू:** %1",
            verificationLevel: "**प्रमाणीकरण स्तर:** %1",
            noServer: "यो आदेश सर्भरमा मात्र प्रयोग गर्न सकिन्छ!"
        }
    },

    onStart: async ({ message, interaction, getLang }) => {
        const guild = message ? message.guild : interaction.guild;

        if (!guild) {
            const errorMsg = getLang("noServer");
            return message ? message.reply(errorMsg) : interaction.reply(errorMsg);
        }

        const owner = await guild.fetchOwner();
        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
        
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;
        const totalChannels = `${guild.channels.cache.size} (Text: ${textChannels}, Voice: ${voiceChannels}, Categories: ${categories})`;

        const verificationLevels = {
            0: "None",
            1: "Low",
            2: "Medium",
            3: "High",
            4: "Very High"
        };

        const embed = new EmbedBuilder()
            .setTitle(getLang("title"))
            .setDescription(
                getLang("name", guild.name) + "\n" +
                getLang("id", guild.id) + "\n" +
                getLang("owner", owner.user.tag) + "\n" +
                getLang("created", createdAt) + "\n" +
                getLang("members", guild.memberCount.toLocaleString()) + "\n" +
                getLang("channels", totalChannels) + "\n" +
                getLang("roles", guild.roles.cache.size) + "\n" +
                getLang("boosts", guild.premiumSubscriptionCount || 0) + "\n" +
                getLang("boostLevel", guild.premiumTier) + "\n" +
                getLang("verificationLevel", verificationLevels[guild.verificationLevel])
            )
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .setColor(0x5865F2)
            .setFooter({ text: `Server ID: ${guild.id}` })
            .setTimestamp();

        return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
    }
};
