const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "mention",
        version: "2.0",
        author: "Samir",
        description: "Automatically responds when the bot is mentioned",
    },

    langs: {
        en: {
            mentionResponse: "👋 Hey {userMention}!\nI'm **{botName}**, your friendly assistant 🤖\n\n💡 Try `{prefix}help` to explore all my commands!\n📊 Use `{prefix}botinfo` to learn more about me!",
            dmResponse: "👋 Hello! I'm **{botName}**.\n\n💬 Send me a message starting with `{prefix}` to use commands!\n📚 Try `{prefix}help` to see what I can do!"
        }
    },

    onChat: async ({ message, getLang, prefix, client }) => {
        try {
            const botMention = `<@${client.user.id}>`;
            const botMentionWithNickname = `<@!${client.user.id}>`;
            const content = message.content.trim();

            // Ignore prefix commands
            if (message.content.startsWith(prefix)) return;

            const isMentionOnly = content === botMention || content === botMentionWithNickname;
            const startsWithMention = content.startsWith(botMention) || content.startsWith(botMentionWithNickname);

            if (isMentionOnly || startsWithMention) {
                const langKey = message.channel.type === 1 ? "dmResponse" : "mentionResponse"; // DMChannel = type 1
                const response = getLang(langKey)
                    .replace(/{userMention}/g, `<@${message.author.id}>`)
                    .replace(/{prefix}/g, prefix)
                    .replace(/{botName}/g, client.user.username);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user.username} • Bot Assistant`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    })
                    .setColor("#5865F2")
                    .setDescription(response)
                    .addFields(
                        { name: "✨ Quick Tips", value: `Use \`${prefix}help\` to browse commands.\nTry \`${prefix}invite\` to add me elsewhere!`, inline: false }
                    )
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({
                        text: `Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                    .setTimestamp();

                // Add a bit of natural delay for polish
                await message.channel.sendTyping();
                await new Promise(r => setTimeout(r, 800));

                await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }
        } catch (err) {
            console.error("Error in mention command:", err);
        }
    }
};
