const log = require('../../logger/log');

async function resolveInteractionContext(interaction) {
    const { RentoBot, db, utils } = global;
    const userID = interaction.user.id;
    const guildID = interaction.guildId || interaction.channelId;
    
    let guildData;
    let userData;
    
    if (!interaction.guildId) {
        guildData = {
            guildID: guildID,
            guildName: "Direct Message",
            prefix: RentoBot.config.bot.prefix,
            adminIDs: [],
            settings: { language: 'en' },
            data: {},
            stats: {}
        };
        
        try {
            userData = await db.usersData.get(userID);
        } catch (userError) {
            userData = {
                userID: userID,
                name: interaction.user.username,
                banned: { status: false },
                settings: { language: 'en' },
                stats: { totalCommandsUsed: 0 },
                data: {}
            };
        }
    } else {
        try {
            guildData = await db.guildsData.get(guildID);
        } catch (error) {
            log.info("GUILD", `Guild ${guildID} not in database, using in-memory defaults (${error.message})`);
            
            guildData = {
                guildID: guildID,
                guildName: interaction.guild?.name || "Unknown Server",
                prefix: RentoBot.config.bot.prefix,
                adminIDs: [],
                settings: { 
                    language: 'en',
                    welcomeChannel: null,
                    welcomeEnabled: false,
                    leaveChannel: null,
                    leaveEnabled: false,
                    levelUpChannel: null,
                    levelUpEnabled: false
                },
                data: {
                    aliases: {},
                    welcomeMessage: "🎉 Welcome {userMention} to **{guildName}**! You are our **#{memberCount}** member. We're glad to have you here!",
                    leaveMessage: "👋 **{userName}** has left **{guildName}**. We now have **{memberCount}** members. We'll miss you!",
                    levelUpMessage: "🎊 Congratulations {userMention}! You've reached **Level {level}**! 🎉\n💎 Total XP: **{xp}**"
                },
                stats: {
                    totalMembers: interaction.guild?.memberCount || 0,
                    totalMessages: 0,
                    totalCommandsUsed: 0,
                    joinedAt: new Date().toISOString()
                },
                banned: {
                    status: false,
                    reason: "",
                    date: ""
                }
            };
        }
        
        try {
            userData = await db.usersData.get(userID);
        } catch (userError) {
            userData = {
                userID: userID,
                name: interaction.user.username,
                banned: { status: false },
                settings: { language: 'en', sortHelp: 'name' },
                stats: { totalCommandsUsed: 0, totalMessages: 0 },
                data: {},
                money: 0,
                exp: 0,
                level: 1
            };
        }
        
        if (interaction.guild && db.guildsData.updateGuildInfo) {
            db.guildsData.updateGuildInfo(guildID).catch(() => {});
        }
    }
    
    const { config } = RentoBot;
    let role = 0;
    if (config.bot.adminBot.includes(userID)) {
        role = 2;
    } else if (interaction.guild) {
        const member = interaction.guild.members.cache.get(userID);
        if (member && (member.permissions.has('Administrator') || guildData.adminIDs.includes(userID))) {
            role = 1;
        }
    }
    
    const prefix = guildData.prefix || config.bot.prefix;
    
    const getLang = (command, key, ...args) => {
        const userLang = userData.settings?.language || guildData.settings?.language || 'en';
        const lang = command.langs?.[userLang]?.[key] || command.langs?.['en']?.[key] || key;
        return utils.getText({ [key]: lang }, key, ...args);
    };
    
    return {
        guildData,
        userData,
        role,
        prefix,
        guildID,
        userID,
        getLang
    };
}

module.exports = { resolveInteractionContext };
