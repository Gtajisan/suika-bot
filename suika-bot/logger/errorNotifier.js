const log = require('./log.js');

class ErrorNotifier {
    async notifyError(error, context = {}) {
        try {
            const errorMessage = `
❌ ERROR OCCURRED
\`\`\`
${error.stack || error.message}
\`\`\`

Context:
- Location: ${context.location || 'Unknown'}
- Command: ${context.command || 'N/A'}
- User ID: ${context.userId || 'N/A'}
- Chat ID: ${context.chatId || 'N/A'}
            `.trim();

            log.error(errorMessage);

            if (global.SuikaBot && global.SuikaBot.bot && global.SuikaBot.config.bot.adminBot.length > 0) {
                for (const adminId of global.SuikaBot.config.bot.adminBot) {
                    try {
                        await global.SuikaBot.bot.telegram.sendMessage(adminId, errorMessage, { 
                            parse_mode: 'Markdown' 
                        });
                    } catch (err) {
                        log.error(`Failed to notify admin ${adminId}: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            log.error(`Error in errorNotifier: ${err.message}`);
        }
    }
}

module.exports = new ErrorNotifier();
