const fs = require('fs');
const path = require('path');
const log = require('../logger/log');

class CronJobManager {
    constructor(config) {
        this.config = config;
        this.jobs = new Map();
    }

    start() {
        // Auto restart functionality
        if (this.config.autoRestart?.enabled && this.config.autoRestart?.time) {
            const interval = parseInt(this.config.autoRestart.time);
            if (interval > 0) {
                log.info('AUTO-RESTART', `Scheduled to restart every ${(interval / 3600000).toFixed(2)} hours`);
                this.jobs.set('autoRestart', setInterval(() => {
                    log.info('AUTO-RESTART', 'Restarting bot...');
                    process.exit(2); // Exit with code 2 to trigger restart
                }, interval));
            }
        }

        // Cache clearing cron job
        if (this.config.cronJobs?.clearCache?.enabled) {
            const schedule = this.config.cronJobs.clearCache.schedule;
            const interval = this.parseCronToInterval(schedule);
            
            if (interval) {
                log.info('CRON-JOB', `Cache clearing scheduled: ${this.config.cronJobs.clearCache.description || 'Every 6 hours'}`);
                this.jobs.set('clearCache', setInterval(() => {
                    this.clearCommandCache();
                }, interval));
            }
        }
    }

    parseCronToInterval(cronExpression) {
        // Simple cron parser for common patterns
        // Format: "0 */6 * * *" means every 6 hours
        const parts = cronExpression.split(' ');
        
        if (parts.length !== 5) {
            log.error('CRON-JOB', 'Invalid cron expression format');
            return null;
        }

        const [minute, hour, day, month, weekday] = parts;

        // Parse hour field for */X pattern
        if (hour.startsWith('*/')) {
            const hours = parseInt(hour.substring(2));
            if (!isNaN(hours)) {
                return hours * 60 * 60 * 1000; // Convert to milliseconds
            }
        }

        // Default to 6 hours if parsing fails
        log.warn('CRON-JOB', 'Using default interval of 6 hours');
        return 6 * 60 * 60 * 1000;
    }

    clearCommandCache() {
        try {
            const cacheDir = path.join(__dirname, '../scripts/commands/tmp');
            
            if (!fs.existsSync(cacheDir)) {
                log.warn('CACHE-CLEAR', 'Cache directory does not exist');
                return;
            }

            const files = fs.readdirSync(cacheDir);
            let deletedCount = 0;
            let totalSize = 0;

            for (const file of files) {
                // Skip .gitkeep file
                if (file === '.gitkeep') {
                    continue;
                }

                const filePath = path.join(cacheDir, file);
                try {
                    const stats = fs.statSync(filePath);
                    totalSize += stats.size;
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (err) {
                    log.error('CACHE-CLEAR', `Failed to delete ${file}: ${err.message}`);
                }
            }

            const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
            log.success('CACHE-CLEAR', `Cleared ${deletedCount} cached images (${sizeMB} MB freed)`);
        } catch (error) {
            log.error('CACHE-CLEAR', `Failed to clear cache: ${error.message}`);
        }
    }

    stop() {
        for (const [name, job] of this.jobs) {
            clearInterval(job);
            log.info('CRON-JOB', `Stopped job: ${name}`);
        }
        this.jobs.clear();
    }
}

module.exports = CronJobManager;
