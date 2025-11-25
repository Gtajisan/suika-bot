// Message logger event
module.exports = {
    eventName: 'message',
    run: async (ctx) => {
        try {
            if (!ctx.message) return;
            
            const msg = ctx.message;
            const user = ctx.from;
            const chat = ctx.chat;
            
            // Log message details
            console.log(`[MESSAGE] ${user.first_name}: "${msg.text?.substring(0, 50)}..." in ${chat.title || 'DM'}`);
            
        } catch (error) {
            console.error(`[ERROR] messageLogger: ${error.message}`);
        }
    }
};
