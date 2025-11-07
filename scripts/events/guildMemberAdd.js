const { Events, EmbedBuilder } = require('discord.js');
const log = require('../../logger/log');

module.exports = {
    config: {
        name: "guildMemberAdd",
        version: "1.0",
        author: "Samir"
    },

    onStart: async ({ client }) => {
        client.on(Events.GuildMemberAdd, async (member) => {
            try {
                if (member.partial) {
                    try {
                        await member.fetch();
                    } catch (fetchError) {
                        log.warn("EVENT", `Failed to fetch partial member data: ${fetchError.message}`);
                        return;
                    }
                }

                log.info("EVENT", `Member joined: ${member.user.tag} joined ${member.guild.name}`);
                const guildData = await global.db.guildsData.get(member.guild.id);
                
                if (!guildData) {
                    log.warn("EVENT", `Missing guild data for ${member.guild.name}, skipping welcome message`);
                    return;
                }

                const data = guildData.data || {};
                const settings = guildData.settings || {};

                const welcomeMessage = data.welcomeMessage || 
                    `Welcome {userName} to **{guildName}**! You are member #{memberCount}!`;

                const message = welcomeMessage
                    .replace(/{userName}/g, member.user.username)
                    .replace(/{userMention}/g, `<@${member.user.id}>`)
                    .replace(/{guildName}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount);

                const dmEmbed = new EmbedBuilder()
                    .setTitle(`👋 Welcome to ${member.guild.name}!`)
                    .setDescription(message)
                    .setThumbnail(member.guild.iconURL())
                    .setColor(0x00AE86)
                    .setFooter({ text: `Server: ${member.guild.name}` })
                    .setTimestamp();

                await member.send({ embeds: [dmEmbed] }).catch((error) => {
                    log.warn("EVENT", `Failed to DM ${member.user.tag} on join: ${error.message}`);
                });

                if (settings.welcomeChannel) {
                    const channel = member.guild.channels.cache.get(settings.welcomeChannel);
                    if (channel) {
                        const channelEmbed = new EmbedBuilder()
                            .setTitle("👋 Welcome!")
                            .setDescription(message)
                            .setThumbnail(member.user.displayAvatarURL())
                            .setColor(0x00AE86)
                            .setTimestamp();

                        channel.send({ embeds: [channelEmbed] }).catch(() => {});
                    }
                }
            } catch (error) {
                console.error('[GUILD_MEMBER_ADD] Error handling member join:', error.message);
            }
        });
    }
};
