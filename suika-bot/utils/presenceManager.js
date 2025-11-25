const { ActivityType } = require('discord.js');
const log = require('../logger/log');

class PresenceManager {
    constructor(client) {
        this.client = client;
        this.rotationInterval = null;
        this.currentIndex = 0;
        this.isRotating = false;
        this.customPresence = null;
        
        // Enhanced preset activities with more variety
        this.presetActivities = [
            // Server & User stats
            { name: '{servers} servers | {prefix}help', type: ActivityType.Playing },
            { name: 'with {users} users', type: ActivityType.Playing },
            { name: '{servers} servers', type: ActivityType.Watching },
            { name: 'over {users} users', type: ActivityType.Watching },
            
            // Command stats
            { name: '{totalCommands} commands executed', type: ActivityType.Watching },
            { name: 'your commands | {prefix}help', type: ActivityType.Listening },
            { name: '{prefix}help for commands', type: ActivityType.Listening },
            
            // Engagement activities
            { name: 'your messages', type: ActivityType.Listening },
            { name: '{totalMessages} messages tracked', type: ActivityType.Watching },
            { name: 'Discord communities', type: ActivityType.Watching },
            
            // Fun & Interactive
            { name: 'games with users', type: ActivityType.Playing },
            { name: 'the casino | {prefix}slot', type: ActivityType.Playing },
            { name: 'your economy grow | {prefix}daily', type: ActivityType.Watching },
            { name: 'levels rise | {prefix}rank', type: ActivityType.Watching },
            
            // Helpful activities
            { name: 'moderating servers', type: ActivityType.Playing },
            { name: 'for rule breakers', type: ActivityType.Watching },
            { name: 'your requests', type: ActivityType.Listening },
            { name: 'server events', type: ActivityType.Watching },
            
            // Technical
            { name: 'Discord.js v14', type: ActivityType.Playing },
            { name: 'with Node.js', type: ActivityType.Playing },
            { name: 'MongoDB queries', type: ActivityType.Playing },
            
            // Miscellaneous
            { name: '{onlineUsers} online members', type: ActivityType.Watching },
            { name: 'with slash commands', type: ActivityType.Playing },
            { name: 'in {channels} channels', type: ActivityType.Playing },
            { name: 'custom rank cards', type: ActivityType.Playing },
            { name: 'quiz competitions | {prefix}quiz', type: ActivityType.Competing },
            { name: 'tic-tac-toe games', type: ActivityType.Competing },
            { name: 'music lovers', type: ActivityType.Listening },
            { name: 'weather updates | {prefix}weather', type: ActivityType.Watching },
            { name: 'memes being created', type: ActivityType.Watching },
            { name: '{prefix}help | Always here!', type: ActivityType.Playing }
        ];

        // Database cache for stats
        this.statsCache = {
            totalCommands: 0,
            totalMessages: 0,
            totalUsers: 0,
            lastUpdate: 0
        };
    }

    async updateStatsCache() {
        try {
            const now = Date.now();
            // Update cache every 5 minutes
            if (now - this.statsCache.lastUpdate < 5 * 60 * 1000) {
                return;
            }

            // Get total commands from database
            if (global.db?.allGuildData) {
                const guilds = global.db.allGuildData;
                this.statsCache.totalCommands = guilds.reduce((sum, guild) => 
                    sum + (guild.stats?.totalCommandsUsed || 0), 0);
                this.statsCache.totalMessages = guilds.reduce((sum, guild) => 
                    sum + (guild.stats?.totalMessages || 0), 0);
            }

            // Get total users
            if (global.db?.allUserData) {
                this.statsCache.totalUsers = global.db.allUserData.length;
            }

            this.statsCache.lastUpdate = now;
        } catch (error) {
            log.error('PRESENCE', `Failed to update stats cache: ${error.message}`);
        }
    }

    formatActivityText(text) {
        const serverCount = this.client.guilds.cache.size;
        const userCount = this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const onlineUsers = this.client.guilds.cache.reduce((acc, guild) => {
            const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
            return acc + onlineMembers;
        }, 0);
        const channelCount = this.client.channels.cache.size;
        const prefix = global.RentoBot?.config?.bot?.prefix || '!';

        return text
            .replace(/{servers}/g, serverCount)
            .replace(/{users}/g, userCount.toLocaleString())
            .replace(/{onlineUsers}/g, onlineUsers.toLocaleString())
            .replace(/{channels}/g, channelCount)
            .replace(/{prefix}/g, prefix)
            .replace(/{totalCommands}/g, this.statsCache.totalCommands.toLocaleString())
            .replace(/{totalMessages}/g, this.statsCache.totalMessages.toLocaleString())
            .replace(/{totalUsers}/g, this.statsCache.totalUsers.toLocaleString());
    }

    async setPresence(activityName, activityType = ActivityType.Playing, status = 'online') {
        try {
            const formattedName = this.formatActivityText(activityName);
            
            await this.client.user.setPresence({
                activities: [{ 
                    name: formattedName, 
                    type: activityType 
                }],
                status: status
            });

            return true;
        } catch (error) {
            log.error('PRESENCE', `Failed to set presence: ${error.message}`);
            return false;
        }
    }

    async setStatus(status) {
        try {
            await this.client.user.setPresence({ status });
            return true;
        } catch (error) {
            log.error('PRESENCE', `Failed to set status: ${error.message}`);
            return false;
        }
    }

    async setCustomPresence(activityName, activityType, status = 'online') {
        this.customPresence = {
            name: activityName,
            type: activityType,
            status: status
        };

        this.stopRotation();
        return await this.setPresence(activityName, activityType, status);
    }

    startRotation() {
        if (this.isRotating) {
            return false;
        }

        this.isRotating = true;
        this.currentIndex = 0;

        const config = global.RentoBot?.config;
        const rotationInterval = config?.presence?.rotationInterval || 5; // minutes

        const rotate = async () => {
            // Update stats cache before rotation
            await this.updateStatsCache();
            
            const activity = this.presetActivities[this.currentIndex];
            await this.setPresence(activity.name, activity.type, 'online');
            
            this.currentIndex = (this.currentIndex + 1) % this.presetActivities.length;
        };

        rotate();
        this.rotationInterval = setInterval(rotate, rotationInterval * 60 * 1000);

        log.info('PRESENCE', `Presence rotation started (${rotationInterval} minute intervals, ${this.presetActivities.length} activities)`);
        return true;
    }

    stopRotation() {
        if (!this.isRotating) {
            return false;
        }

        clearInterval(this.rotationInterval);
        this.rotationInterval = null;
        this.isRotating = false;

        log.info('PRESENCE', 'Presence rotation stopped');
        return true;
    }

    async loadFromConfig() {
        const config = global.RentoBot?.config;
        
        if (!config?.presence) {
            return false;
        }

        const { enabled, rotation, custom } = config.presence;

        if (rotation && enabled) {
            this.startRotation();
        } else if (custom && enabled) {
            const activityType = this.getActivityType(custom.type);
            await this.setCustomPresence(custom.name, activityType, custom.status || 'online');
        }

        return true;
    }

    getActivityType(typeString) {
        const types = {
            'playing': ActivityType.Playing,
            'watching': ActivityType.Watching,
            'listening': ActivityType.Listening,
            'competing': ActivityType.Competing,
            'streaming': ActivityType.Streaming
        };

        return types[typeString.toLowerCase()] || ActivityType.Playing;
    }

    getStatus() {
        return {
            isRotating: this.isRotating,
            customPresence: this.customPresence,
            currentActivity: this.client.user?.presence?.activities?.[0],
            totalActivities: this.presetActivities.length,
            currentIndex: this.currentIndex,
            statsCache: this.statsCache
        };
    }

    // Add new activity dynamically
    addActivity(name, type = ActivityType.Playing) {
        this.presetActivities.push({ name, type });
        log.info('PRESENCE', `Added new activity: ${name}`);
    }

    // Remove activity by index
    removeActivity(index) {
        if (index >= 0 && index < this.presetActivities.length) {
            const removed = this.presetActivities.splice(index, 1);
            log.info('PRESENCE', `Removed activity: ${removed[0].name}`);
            return true;
        }
        return false;
    }

    // Get all activities
    getActivities() {
        return this.presetActivities.map((activity, index) => ({
            index,
            name: activity.name,
            type: this.getActivityTypeName(activity.type)
        }));
    }

    getActivityTypeName(type) {
        const typeNames = {
            [ActivityType.Playing]: 'Playing',
            [ActivityType.Watching]: 'Watching',
            [ActivityType.Listening]: 'Listening',
            [ActivityType.Competing]: 'Competing',
            [ActivityType.Streaming]: 'Streaming'
        };
        return typeNames[type] || 'Unknown';
    }
}

module.exports = PresenceManager;
