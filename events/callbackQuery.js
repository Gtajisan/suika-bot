// Callback query handler for inline buttons
module.exports = {
    eventName: 'callback_query',
    
    run: async (ctx) => {
        try {
            const callbackData = ctx.callbackQuery?.data;
            const fromId = ctx.from?.id;
            const fromName = ctx.from?.first_name;
            
            if (!callbackData) return;
            
            console.log(`[CALLBACK_QUERY] User ${fromName} (${fromId}) clicked: ${callbackData}`);
            
            // Answer callback query (show notification)
            try {
                await ctx.answerCbQuery();
            } catch (error) {
                console.log(`[WARNING] Could not answer callback query: ${error.message}`);
            }
            
        } catch (error) {
            console.error(`[ERROR] callbackQuery event: ${error.message}`);
        }
    }
};
