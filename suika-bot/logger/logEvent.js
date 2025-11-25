const { colors } = require('../func/colors');
const moment = require('moment-timezone');
const config = require('../loadConfig');

function getTime() {
    const timezone = config.bot.timezone || "Asia/Kathmandu";
    return colors.cyan + moment().tz(timezone).format("HH:mm:ss") + colors.reset;
}

function logEvent(eventType, details, guild = null, user = null) {
    try {
        const time = getTime();
        let logMessage = `${time} ${colors.yellow}[${eventType.toUpperCase()}]${colors.reset}`;
        
        if (guild) {
            logMessage += ` ${colors.magenta}[${guild.name}]${colors.reset}`;
        }
        
        if (user) {
            const userName = user.username || user.tag || "Unknown User";
            logMessage += ` ${colors.green}${userName}${colors.reset}`;
        }
        
        if (details) {
            logMessage += ` ${colors.white}${details}${colors.reset}`;
        }
        
        console.log(logMessage);
    } catch (error) {
        console.error(`${colors.red}[ERROR]${colors.reset} Failed to log event:`, error.message);
    }
}

function logMessageDelete(message) {
    const guild = message.guild;
    const author = message.author;
    const content = message.content ? 
        (message.content.length > 50 ? message.content.substring(0, 50) + "..." : message.content) 
        : "[attachment/embed]";
    
    logEvent("MESSAGE_DELETE", `Content: "${content}"`, guild, author);
}

function logMessageUpdate(oldMessage, newMessage) {
    const guild = newMessage.guild;
    const author = newMessage.author;
    const oldContent = oldMessage.content ? 
        (oldMessage.content.length > 40 ? oldMessage.content.substring(0, 40) + "..." : oldMessage.content) 
        : "[no content]";
    const newContent = newMessage.content ? 
        (newMessage.content.length > 40 ? newMessage.content.substring(0, 40) + "..." : newMessage.content) 
        : "[no content]";
    
    logEvent("MESSAGE_UPDATE", `"${oldContent}" → "${newContent}"`, guild, author);
}

function logChannelCreate(channel) {
    const guild = channel.guild;
    logEvent("CHANNEL_CREATE", `#${channel.name} (${channel.type})`, guild);
}

function logChannelDelete(channel) {
    const guild = channel.guild;
    logEvent("CHANNEL_DELETE", `#${channel.name} (${channel.type})`, guild);
}

function logRoleCreate(role) {
    const guild = role.guild;
    logEvent("ROLE_CREATE", `@${role.name}`, guild);
}

function logRoleDelete(role) {
    const guild = role.guild;
    logEvent("ROLE_DELETE", `@${role.name}`, guild);
}

function logGuildMemberAdd(member) {
    const guild = member.guild;
    const user = member.user;
    logEvent("MEMBER_JOIN", `Member count: ${guild.memberCount}`, guild, user);
}

function logGuildMemberRemove(member) {
    const guild = member.guild;
    const user = member.user;
    logEvent("MEMBER_LEAVE", `Member count: ${guild.memberCount}`, guild, user);
}

function logGuildBanAdd(ban) {
    const guild = ban.guild;
    const user = ban.user;
    logEvent("MEMBER_BAN", `Banned from server`, guild, user);
}

function logGuildBanRemove(ban) {
    const guild = ban.guild;
    const user = ban.user;
    logEvent("MEMBER_UNBAN", `Unbanned from server`, guild, user);
}

function logChannelUpdate(oldChannel, newChannel) {
    const guild = newChannel.guild;
    const changes = [];
    
    if (oldChannel.name !== newChannel.name) {
        changes.push(`name: "${oldChannel.name}" → "${newChannel.name}"`);
    }
    if (oldChannel.topic !== newChannel.topic) {
        changes.push(`topic updated`);
    }
    if (oldChannel.nsfw !== newChannel.nsfw) {
        changes.push(`NSFW: ${oldChannel.nsfw} → ${newChannel.nsfw}`);
    }
    
    const details = changes.length > 0 ? changes.join(", ") : "channel updated";
    logEvent("CHANNEL_UPDATE", `#${newChannel.name} - ${details}`, guild);
}

function logRoleUpdate(oldRole, newRole) {
    const guild = newRole.guild;
    const changes = [];
    
    if (oldRole.name !== newRole.name) {
        changes.push(`name: "${oldRole.name}" → "${newRole.name}"`);
    }
    if (oldRole.color !== newRole.color) {
        changes.push(`color changed`);
    }
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        changes.push(`permissions updated`);
    }
    
    const details = changes.length > 0 ? changes.join(", ") : "role updated";
    logEvent("ROLE_UPDATE", `@${newRole.name} - ${details}`, guild);
}

function logGuildMemberUpdate(oldMember, newMember) {
    const guild = newMember.guild;
    const user = newMember.user;
    const changes = [];
    
    if (oldMember.nickname !== newMember.nickname) {
        const oldNick = oldMember.nickname || "none";
        const newNick = newMember.nickname || "none";
        changes.push(`nickname: "${oldNick}" → "${newNick}"`);
    }
    
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    
    if (addedRoles.size > 0) {
        changes.push(`added roles: ${addedRoles.map(r => `@${r.name}`).join(", ")}`);
    }
    if (removedRoles.size > 0) {
        changes.push(`removed roles: ${removedRoles.map(r => `@${r.name}`).join(", ")}`);
    }
    
    if (changes.length > 0) {
        logEvent("MEMBER_UPDATE", changes.join(" | "), guild, user);
    }
}

function logVoiceStateUpdate(oldState, newState) {
    const guild = newState.guild;
    const user = newState.member.user;
    
    if (!oldState.channel && newState.channel) {
        logEvent("VOICE_JOIN", `Joined voice channel: ${newState.channel.name}`, guild, user);
    } else if (oldState.channel && !newState.channel) {
        logEvent("VOICE_LEAVE", `Left voice channel: ${oldState.channel.name}`, guild, user);
    } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        logEvent("VOICE_MOVE", `Moved: ${oldState.channel.name} → ${newState.channel.name}`, guild, user);
    } else if (oldState.serverMute !== newState.serverMute) {
        const action = newState.serverMute ? "Server muted" : "Server unmuted";
        logEvent("VOICE_UPDATE", `${action} in ${newState.channel.name}`, guild, user);
    } else if (oldState.serverDeaf !== newState.serverDeaf) {
        const action = newState.serverDeaf ? "Server deafened" : "Server undeafened";
        logEvent("VOICE_UPDATE", `${action} in ${newState.channel.name}`, guild, user);
    }
}

module.exports = {
    logEvent,
    logMessageDelete,
    logMessageUpdate,
    logChannelCreate,
    logChannelDelete,
    logChannelUpdate,
    logRoleCreate,
    logRoleDelete,
    logRoleUpdate,
    logGuildMemberAdd,
    logGuildMemberRemove,
    logGuildMemberUpdate,
    logGuildBanAdd,
    logGuildBanRemove,
    logVoiceStateUpdate
};
