// Message delete event handler
module.exports = {
    eventName: 'message_deleted',
    
    run: async (ctx) => {
        try {
            const chatId = ctx.chat?.id;
            const messageId = ctx.message?.message_id;
            const fromId = ctx.from?.id;
            
            console.log(`[MESSAGE_DELETE] Message ${messageId} deleted in chat ${chatId} by user ${fromId}`);
            
        } catch (error) {
            console.error(`[ERROR] messageDelete event: ${error.message}`);
        }
    }
};
