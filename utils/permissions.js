const log = require('../logger/log.js');

/**
 * Check if a user is a bot administrator
 * @param {string} userID - The Discord user ID
 * @param {object} config - The bot configuration object
 * @returns {boolean} True if user is a bot admin
 */
function isBotAdmin(userID, config) {
    if (!config?.bot?.adminBot || !Array.isArray(config.bot.adminBot)) {
        return false;
    }
    return config.bot.adminBot.includes(userID);
}

/**
 * Check if a channel is an admin channel
 * @param {string} guildID - The Discord guild ID
 * @param {string} channelID - The Discord channel ID
 * @param {object} config - The bot configuration object
 * @returns {boolean} True if channel is an admin channel
 */
function isAdminChannel(guildID, channelID, config) {
    if (!config?.bot?.adminChannels || !Array.isArray(config.bot.adminChannels)) {
        return false;
    }
    
    return config.bot.adminChannels.some(
        ac => ac.guildId === guildID && ac.channelId === channelID
    );
}

/**
 * Check if a command can be executed based on access restrictions
 * @param {object} params - Parameters object
 * @param {string} params.userID - The Discord user ID
 * @param {string|null} params.guildID - The Discord guild ID (null for DMs)
 * @param {string} params.channelID - The Discord channel ID
 * @param {object} params.config - The bot configuration object
 * @param {boolean} params.isDM - Whether this is a DM
 * @returns {object} { allowed: boolean, reason: string|null }
 */
function canExecuteCommand({ userID, guildID, channelID, config, isDM = false }) {
    const onlyAdmin = config?.bot?.onlyadmin || false;
    const onlyAdminChannel = config?.bot?.onlyadminchannel || false;
    
    if (onlyAdmin) {
        const isAdmin = isBotAdmin(userID, config);
        if (!isAdmin) {
            return {
                allowed: false,
                reason: "🔒 **Bot is in admin-only mode.**\nOnly bot administrators can use commands right now."
            };
        }
    }
    
    if (onlyAdminChannel && !isDM) {
        // Check if the current guild is in the admin guilds list
        const adminChannels = config?.bot?.adminChannels || [];
        
        if (adminChannels.length === 0) {
            log.warn("PERMISSIONS", "Admin-guild mode is enabled but no admin guilds are configured");
            return {
                allowed: false,
                reason: "🔒 **Bot is in admin-guild mode.**\nNo admin guilds are configured. Please contact the bot administrator."
            };
        }
        
        const isInAdminGuild = adminChannels.some(ac => {
            const matches = ac.guildId === guildID;
            if (matches) {
                log.info("PERMISSIONS", `Guild ${guildID} matched admin guild ${ac.guildId}`);
            }
            return matches;
        });
        
        if (!isInAdminGuild) {
            log.warn("PERMISSIONS", `Guild ${guildID} is not in admin guilds list. Admin guilds: ${adminChannels.map(ac => ac.guildId).join(', ')}`);
            return {
                allowed: false,
                reason: "🔒 **Bot is in admin-guild mode.**\nCommands can only be used in designated admin guilds (any channel within those guilds)."
            };
        }
    }
    
    return { allowed: true, reason: null };
}

/**
 * Get all admin channels that the bot can access
 * @param {object} client - The Discord client
 * @param {object} config - The bot configuration object
 * @returns {Array} Array of text channel objects
 */
async function getAccessibleAdminChannels(client, config) {
    const channels = [];
    
    if (!config?.bot?.adminChannels || !Array.isArray(config.bot.adminChannels)) {
        return channels;
    }
    
    for (const adminChannel of config.bot.adminChannels) {
        try {
            const guild = client.guilds.cache.get(adminChannel.guildId);
            if (!guild) {
                log.warn("PERMISSIONS", `Guild ${adminChannel.guildId} not found or bot is not a member`);
                continue;
            }
            
            const channel = guild.channels.cache.get(adminChannel.channelId);
            if (!channel) {
                log.warn("PERMISSIONS", `Channel ${adminChannel.channelId} not found in guild ${guild.name}`);
                continue;
            }
            
            if (!channel.isTextBased()) {
                log.warn("PERMISSIONS", `Channel ${channel.name} in ${guild.name} is not a text channel`);
                continue;
            }
            
            const permissions = channel.permissionsFor(client.user);
            if (!permissions?.has(['ViewChannel', 'SendMessages'])) {
                log.warn("PERMISSIONS", `Missing permissions in channel ${channel.name} (${guild.name})`);
                continue;
            }
            
            channels.push(channel);
        } catch (error) {
            log.error("PERMISSIONS", `Error accessing admin channel: ${error.message}`);
        }
    }
    
    return channels;
}

/**
 * Format a response message for permission denied
 * @param {string} reason - The reason for denial
 * @param {boolean} isEphemeral - Whether the message should be ephemeral (for interactions)
 * @returns {object} Formatted response object
 */
function formatDenialResponse(reason, isEphemeral = false) {
    if (isEphemeral) {
        return {
            content: reason,
            ephemeral: true
        };
    }
    return reason;
}

module.exports = {
    isBotAdmin,
    isAdminChannel,
    canExecuteCommand,
    getAccessibleAdminChannels,
    formatDenialResponse
};
