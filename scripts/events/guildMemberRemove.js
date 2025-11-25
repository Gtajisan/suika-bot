// Group member remove event
module.exports = {
    eventName: 'chat_member',
    run: async (ctx) => {
        try {
            const update = ctx.update.chat_member;
            if (!update) return;
            
            const oldStatus = update.old_chat_member.status;
            const newStatus = update.new_chat_member.status;
            const user = update.new_chat_member.user;
            
            // User left
            if ((oldStatus === 'member' || oldStatus === 'restricted') && newStatus === 'left') {
                console.log(`[MEMBER_REMOVE] ${user.first_name} left group`);
            }
            
            // User banned
            if ((oldStatus === 'member' || oldStatus === 'restricted') && newStatus === 'kicked') {
                console.log(`[MEMBER_BANNED] ${user.first_name} was banned`);
            }
        } catch (error) {
            console.error(`[ERROR] guildMemberRemove: ${error.message}`);
        }
    }
};
