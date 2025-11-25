// Member join event for Telegram groups
module.exports = {
    eventName: 'my_chat_member',
    
    run: async (ctx) => {
        try {
            const update = ctx.update.my_chat_member;
            if (!update) return;
            
            const botUser = update.new_chat_member.user;
            const botStatus = update.new_chat_member.status;
            
            // Check if bot was added to group
            if (botStatus === 'member' || botStatus === 'administrator') {
                const chatId = ctx.chat.id;
                const chatTitle = ctx.chat.title || 'Private Chat';
                
                console.log(`[MEMBER_JOIN] Bot added to ${chatTitle} (${chatId})`);
                
                // Initialize group in database if needed
                if (global.db && global.db.usersData) {
                    // Log group join event
                }
                
                // Send welcome message
                try {
                    await ctx.reply(
                        `Welcome! I'm Suika Bot.\n\n` +
                        `Use /help to see available commands.\n` +
                        `Type /ping to check my status.`
                    );
                } catch (error) {
                    console.log(`[WARNING] Could not send welcome message: ${error.message}`);
                }
            }
            
            // Check if bot was removed
            if (botStatus === 'left' || botStatus === 'kicked') {
                const chatId = ctx.chat.id;
                const chatTitle = ctx.chat.title || 'Private Chat';
                
                console.log(`[MEMBER_LEAVE] Bot removed from ${chatTitle} (${chatId})`);
            }
            
        } catch (error) {
            console.error(`[ERROR] newMember event: ${error.message}`);
        }
    }
};
