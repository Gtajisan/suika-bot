const moment = require('moment-timezone');
const log = require('./log.js');

class ErrorNotifier {
    constructor() {
        this.recentErrors = new Map();
        this.rateLimitWindow = 60000;
        this.maxSameErrorsPerWindow = 3;
        this.initialized = false;
        this.bot = null;
        this.config = null;
    }

    initialize(bot, config) {
        this.bot = bot;
        this.config = config;
        this.initialized = true;
        log.info("Error notification system initialized");
    }

    isEnabled() {
        return this.config?.bot?.logErrors !== false;
    }

    shouldNotify(errorSignature) {
        if (!this.isEnabled()) return false;

        const now = Date.now();
        const errorData = this.recentErrors.get(errorSignature);

        if (!errorData) {
            this.recentErrors.set(errorSignature, {
                count: 1,
                firstOccurrence: now,
                lastOccurrence: now
            });
            return true;
        }

        if (now - errorData.firstOccurrence > this.rateLimitWindow) {
            this.recentErrors.set(errorSignature, {
                count: 1,
                firstOccurrence: now,
                lastOccurrence: now
            });
            return true;
        }

        errorData.count++;
        errorData.lastOccurrence = now;

        return errorData.count <= this.maxSameErrorsPerWindow;
    }

    formatError(error, context = {}) {
        const timezone = this.config?.bot?.timezone || "Asia/Kathmandu";
        const timestamp = moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss");
        
        const errorType = error.name || "Error";
        const errorMessage = error.message || "Unknown error";
        const location = context.location || "Unknown";
        const command = context.command || "Unknown";

        return {
            type: errorType,
            message: errorMessage,
            location,
            timestamp,
            command
        };
    }

    async notifyError(error, context = {}) {
        if (!this.initialized || !this.bot) return;
        if (!this.isEnabled()) return;

        try {
            const errorSignature = `${error.name}:${error.message}`;
            
            if (!this.shouldNotify(errorSignature)) return;

            const formattedError = this.formatError(error, context);
            const adminIds = this.config?.bot?.adminBot || [];

            if (adminIds.length === 0) return;

            const message = `
🚨 *Error: ${formattedError.type}*

${formattedError.message}

📍 Location: ${formattedError.location}
⏰ Time: ${formattedError.timestamp}
🔧 Command: ${formattedError.command}`;

            for (const adminId of adminIds) {
                try {
                    await this.bot.telegram.sendMessage(adminId, message, { parse_mode: 'Markdown' });
                } catch (err) {
                    log.error(`Failed to notify admin: ${err.message}`);
                }
            }
        } catch (notifyError) {
            log.error(`Error notifier failed: ${notifyError.message}`);
        }
    }

    clearOldErrors() {
        const now = Date.now();
        for (const [signature, data] of this.recentErrors.entries()) {
            if (now - data.firstOccurrence > this.rateLimitWindow * 2) {
                this.recentErrors.delete(signature);
            }
        }
    }

    startCleanupInterval() {
        setInterval(() => this.clearOldErrors(), this.rateLimitWindow);
    }
}

module.exports = new ErrorNotifier();
