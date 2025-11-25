// Mention event handler
module.exports = {
    eventName: 'message',
    run: async (ctx) => {
        try {
            if (!ctx.message || !ctx.message.text) return;
            
            const text = ctx.message.text;
            const user = ctx.from;
            
            // Check if bot is mentioned
            if (text.includes('@') || text.includes(ctx.botInfo?.username)) {
                console.log(`[MENTION] ${user.first_name} mentioned bot`);
                
                // Respond to mention
                const response = 'Hi there! Use /help to see my commands.';
                try {
                    await ctx.reply(response);
                } catch (error) {
                    console.log(`[WARNING] Could not respond to mention: ${error.message}`);
                }
            }
        } catch (error) {
            console.error(`[ERROR] mention: ${error.message}`);
        }
    }
};
