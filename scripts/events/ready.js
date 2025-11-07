const { Events, ActivityType } = require('discord.js');
const log = require('../../logger/log');
const fs = require('fs-extra');
const path = require('path');
const CronJobManager = require('../../handlers/cronJobManager');
const errorNotifier = require('../../logger/errorNotifier');

module.exports = {
    config: {
        name: "ready",
        version: "1.0",
        author: "Samir"
    },

    onStart: async ({ client }) => {
        client.on(Events.ClientReady, async () => {
            log.success("READY", `Logged in as ${client.user.tag}`);
            log.info("STATS", `Serving ${client.guilds.cache.size} guilds`);
            
            // Initialize error notifier for production-ready error logging
            const botConfig = global.RentoBot?.config;
            errorNotifier.initialize(client, botConfig);
            errorNotifier.startCleanupInterval();
            
            // Initialize cron job manager for auto-restart and cache clearing
            if (botConfig) {
                const cronJobManager = new CronJobManager(botConfig);
                cronJobManager.start();
                global.RentoBot.cronJobManager = cronJobManager;
            }
            
            const restartFilePath = path.join(__dirname, '../../restart.txt');
            if (await fs.pathExists(restartFilePath)) {
                try {
                    const restartData = JSON.parse(await fs.readFile(restartFilePath, 'utf-8'));
                    const timeTaken = Date.now() - restartData.timestamp;
                    const seconds = (timeTaken / 1000).toFixed(2);

                    const channel = await client.channels.fetch(restartData.channelId).catch(() => null);
                    if (channel) {
                        const message = await channel.messages.fetch(restartData.messageId).catch(() => null);
                        if (message) {
                            await message.edit(`✅ Bot restarted successfully!\n⏱️ Time taken: **${seconds}s**`);
                        }
                    }

                    await fs.remove(restartFilePath);
                    log.success("RESTART", `Restart completed in ${seconds}s`);
                } catch (error) {
                    log.error("RESTART", `Failed to process restart file: ${error.message}`);
                    await fs.remove(restartFilePath).catch(() => {});
                }
            }

            const config = botConfig;
            const presenceManager = global.RentoBot?.presenceManager;

            if (!config?.presence || (!config.presence.rotation && !config.presence.custom)) {
                client.user.setPresence({
                    activities: [{ 
                        name: `${global.utils.getPrefix()} | ${client.guilds.cache.size} servers`, 
                        type: ActivityType.Playing 
                    }],
                    status: 'online'
                });

                setInterval(() => {
                    if (!config?.presence?.rotation && !config?.presence?.custom && presenceManager && !presenceManager.isRotating) {
                        client.user.setPresence({
                            activities: [{ 
                                name: `${global.utils.getPrefix()} | ${client.guilds.cache.size} servers`, 
                                type: ActivityType.Playing 
                            }],
                            status: 'online'
                        });
                    }
                }, 60000);
            }
        });
    }
};
