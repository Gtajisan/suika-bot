
module.exports = {
    config: {
        name: "myinfo",
        aliases: ["me", "profile"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Get your user information",
            ne: "आफ्नो प्रयोगकर्ता जानकारी प्राप्त गर्नुहोस्"
        },
        category: "info",
        guide: {
            en: "{prefix}myinfo [@user]",
            ne: "{prefix}myinfo [@प्रयोगकर्ता]"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user to get information for",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            title: "User Information",
            username: "**Username:** %1",
            id: "**ID:** `%1`",
            created: "**Account Created:** %1",
            joined: "**Joined Server:** %1",
            roles: "**Roles:** %1",
            status: "**Status:** %1",
            bot: "**Bot:** %1"
        },
        ne: {
            title: "प्रयोगकर्ता जानकारी",
            username: "**प्रयोगकर्ता नाम:** %1",
            id: "**ID:** `%1`",
            created: "**खाता सिर्जना:** %1",
            joined: "**सर्भर सामेल:** %1",
            roles: "**भूमिकाहरू:** %1",
            status: "**स्थिति:** %1",
            bot: "**बट:** %1"
        }
    },

    onStart: async ({ message, interaction, getLang }) => {
        const targetUser = message ? 
            (message.mentions.users.first() || message.author) : 
            (interaction.options.getUser('user') || interaction.user);

        const guild = message ? message.guild : interaction.guild;
        let member = null;
        
        if (guild) {
            try {
                member = await guild.members.fetch(targetUser.id);
            } catch (error) {
                member = null;
            }
        }

        const createdAt = `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`;
        const joinedAt = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : "N/A";
        
        const roles = member ? 
            member.roles.cache
                .filter(role => role.id !== guild.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .slice(0, 10)
                .join(", ") || "None" 
            : "N/A";

        const status = member ? member.presence?.status || "offline" : "N/A";

        const embed = {}
            // Title: getLang("title")
            .setDescription(
                getLang("username", targetUser.tag) + "\n" +
                getLang("id", targetUser.id) + "\n" +
                getLang("bot", targetUser.bot ? "Yes" : "No") + "\n" +
                getLang("status", status) + "\n" +
                getLang("created", createdAt) + "\n" +
                (guild ? getLang("joined", joinedAt) + "\n" : "") +
                (guild ? getLang("roles", roles) : "")
            )
            // Thumbnail: targetUser.displayAvatarURL({ dynamic: true, size: 256 }*/ //(member?.displayHexColor || 0x5865F2)
            .setFooter({ text: `User ID: ${targetUser.id}` })
            .setTimestamp();

        return message ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
    }
};
