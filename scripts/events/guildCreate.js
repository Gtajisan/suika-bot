const { Events, EmbedBuilder } = require('discord.js');
const log = require('../../logger/log');

module.exports = {
    config: {
        name: "guildCreate",
        version: "1.0",
        author: "Samir"
    },

    onStart: async ({ client }) => {
        client.on(Events.GuildCreate, async (guild) => {
            log.success("GUILD", `Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
            
            await global.db.guildsData.create(guild.id, guild.name);
            
            const guildData = await global.db.guildsData.get(guild.id);
            const updatedStats = {
                ...(guildData.stats || {}),
                totalMembers: guild.memberCount || 0,
                totalMessages: guildData.stats?.totalMessages || 0,
                totalCommandsUsed: guildData.stats?.totalCommandsUsed || 0,
                joinedAt: guildData.stats?.joinedAt || new Date().toISOString()
            };
            await global.db.guildsData.set(guild.id, updatedStats, 'stats');

            const channel = guild.systemChannel || 
                           guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'));

            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle("👋 Hello! Thanks for inviting me!")
                    .setDescription(`I'm a powerful Discord bot with many features!\n\n**Prefix:** \`${global.RentoBot.config.bot.prefix}\`\n**Commands:** Use \`${global.RentoBot.config.bot.prefix}help\` to see all commands\n\nI include:\n✨ Economy system\n📊 Leveling system\n🎮 Fun commands\n🛠️ Utility commands\n\nAnd much more!`)
                    .setColor(0x00AE86)
                    .setTimestamp();

                channel.send({ embeds: [embed] }).catch(() => {});
            }
        });
    }
};
