// Guild/Group create event
module.exports = {
    eventName: 'my_chat_member',
    run: async (ctx) => {
        try {
            const update = ctx.update.my_chat_member;
            if (!update) return;
            
            const newStatus = update.new_chat_member.status;
            const chatTitle = ctx.chat.title || 'Private Chat';
            
            if (newStatus === 'member' || newStatus === 'administrator') {
                console.log(`[BOT_ADDED] Bot added to: ${chatTitle}`);
            }
        } catch (error) {
            console.error(`[ERROR] guildCreate: ${error.message}`);
        }
    }
};
