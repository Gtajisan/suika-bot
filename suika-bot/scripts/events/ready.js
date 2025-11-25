// Ready event - fires when bot connects to Telegram
module.exports = {
    eventName: 'start',
    run: async (ctx) => {
        try {
            console.log('[READY] Suika Bot is ready and listening for messages');
            console.log(`[READY] Bot username: ${ctx.botInfo?.username}`);
        } catch (error) {
            console.error(`[ERROR] Ready event: ${error.message}`);
        }
    }
};
