const log = require('./log.js');

class ErrorNotifier {
    constructor() {
        this.bot = null;
        this.config = null;
    }

    initialize(bot, config) {
        this.bot = bot;
        this.config = config;
        log.info("Error notifier ready");
    }

    async notifyError(error, context = {}) {
        log.error(`Error: ${error.message}`);
    }
}

module.exports = new ErrorNotifier();
