const { Events, EmbedBuilder } = require('discord.js');
const { logGuildMemberRemove } = require('../../logger/logEvent');
const log = require('../../logger/log');

module.exports = {
    config: {
        name: "guildMemberRemove",
        version: "1.0",
        author: "Samir"
    },

    onStart: async ({ client }) => {
        client.on(Events.GuildMemberRemove, async (member) => {
            try {
                if (member.partial) {
                    try {
                        await member.fetch();
                    } catch (fetchError) {
                        log.warn("EVENT", `Failed to fetch partial member data: ${fetchError.message}`);
                        return;
                    }
                }

                log.info("EVENT", `Member left: ${member.user.tag} left ${member.guild.name}`);
                logGuildMemberRemove(member);

                const guildData = await global.db.guildsData.get(member.guild.id);
                
                if (!guildData) {
                    log.warn("EVENT", `Missing guild data for ${member.guild.name}, skipping leave message`);
                    return;
                }

                const data = guildData.data || {};
                const settings = guildData.settings || {};

                const leaveMessage = data.leaveMessage || 
                    `Goodbye {userName}! You have left **{guildName}**. We hope to see you again soon!`;

                const message = leaveMessage
                    .replace(/{userName}/g, member.user.username)
                    .replace(/{userMention}/g, `<@${member.user.id}>`)
                    .replace(/{userTag}/g, member.user.tag)
                    .replace(/{guildName}/g, member.guild.name)
                    .replace(/{serverName}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount);

                const dmEmbed = new EmbedBuilder()
                    .setTitle(`👋 Goodbye from ${member.guild.name}`)
                    .setDescription(message)
                    .setThumbnail(member.guild.iconURL())
                    .setColor(0xFF6B6B)
                    .setFooter({ text: `You're always welcome back!` })
                    .setTimestamp();

                await member.send({ embeds: [dmEmbed] }).catch((error) => {
                    log.warn("EVENT", `Failed to DM ${member.user.tag} on leave: ${error.message}`);
                });

                if (settings.leaveEnabled && settings.leaveChannel) {
                    const channel = member.guild.channels.cache.get(settings.leaveChannel);
                    if (channel) {
                        const channelEmbed = new EmbedBuilder()
                            .setTitle("👋 Goodbye!")
                            .setDescription(message)
                            .setThumbnail(member.user.displayAvatarURL())
                            .setColor(0xFF0000)
                            .setTimestamp();

                        channel.send({ embeds: [channelEmbed] }).catch(() => {});
                    }
                }
            } catch (error) {
                console.error('[GUILD_MEMBER_REMOVE] Error handling member remove:', error.message);
            }
        });
    }
};
