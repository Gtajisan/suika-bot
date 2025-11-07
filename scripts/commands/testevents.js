const { PermissionsBitField, Options } = require('discord.js');

module.exports = {
    config: {
        name: "testevents",
        aliases: ["checkmemberevents"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Test if member join/leave events are properly configured"
        },
        category: "admin",
        slash: true,
        guide: {
            en: "{pn} - Check if member events are configured correctly"
        },
    },

    onStart: async function ({ message, interaction, api, event, args, getLang }) {
        const client = global.RentoBot.client;
        const isSlash = !!interaction;
        
        const checks = [];
        
        checks.push("**Event Registration Check:**");
        checks.push(`✅ GuildMemberAdd event: ${global.RentoBot.eventCommands.has('guildMemberAdd') ? 'Registered' : '❌ Not Registered'}`);
        checks.push(`✅ GuildMemberRemove event: ${global.RentoBot.eventCommands.has('guildMemberRemove') ? 'Registered' : '❌ Not Registered'}`);
        checks.push("");
        
        checks.push("**Bot Intents Check:**");
        const hasGuildMembers = client.options.intents.has('GuildMembers');
        checks.push(`${hasGuildMembers ? '✅' : '❌'} GuildMembers Intent: ${hasGuildMembers ? 'Enabled' : 'DISABLED - Events will NOT work!'}`);
        checks.push("");
        
        checks.push("**Partials Check:**");
        const hasPartials = client.options.partials.includes('GuildMember');
        checks.push(`${hasPartials ? '✅' : '⚠️'} GuildMember Partial: ${hasPartials ? 'Enabled' : 'Not enabled'}`);
        checks.push("");
        
        checks.push("**Guild Member Cache:**");
        const guild = isSlash ? interaction.guild : message.guild;
        if (guild) {
            checks.push(`📊 Current server: ${guild.name}`);
            checks.push(`👥 Cached members: ${guild.members.cache.size}/${guild.memberCount}`);
            checks.push(`📝 Bot can see member events: ${hasGuildMembers ? 'Yes' : 'NO - Fix required!'}`);
        }
        checks.push("");
        
        if (!hasGuildMembers) {
            checks.push("**⚠️ CRITICAL ERROR DETECTED:**");
            checks.push("The bot's intents are configured in code, but you MUST enable");
            checks.push("'Server Members Intent' in Discord Developer Portal!");
            checks.push("");
            checks.push("**How to fix:**");
            checks.push("1. Go to: https://discord.com/developers/applications");
            checks.push(`2. Select your bot application`);
            checks.push("3. Click 'Bot' in the left sidebar");
            checks.push("4. Scroll to 'Privileged Gateway Intents'");
            checks.push("5. Enable 'SERVER MEMBERS INTENT' ✅");
            checks.push("6. Click 'Save Changes'");
            checks.push("7. Restart this bot");
            checks.push("");
            checks.push("Without this, join/leave events will NEVER fire!");
        } else {
            checks.push("**✅ All checks passed!**");
            checks.push("Member events should be working correctly.");
            checks.push("If they're still not working, try:");
            checks.push("1. Kicking and re-inviting the bot to your server");
            checks.push("2. Making sure the bot has proper permissions");
            checks.push("3. Testing by having someone join/leave the server");
        }

        if (isSlash) {
            return interaction.reply(checks.join('\n'));
        } else {
            return message.reply(checks.join('\n'));
        }
    }
};
