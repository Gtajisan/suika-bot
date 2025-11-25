// Edit event - handles edited messages
module.exports = {
    eventName: 'edited_message',
    run: async (ctx) => {
        try {
            if (!ctx.editedMessage) return;
            
            const msg = ctx.editedMessage;
            const user = ctx.from;
            
            console.log(`[MESSAGE_EDIT] ${user.first_name} edited message`);
            
        } catch (error) {
            console.error(`[ERROR] edit event: ${error.message}`);
        }
    }
};
