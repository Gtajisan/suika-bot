// Group member add event
module.exports = {
    eventName: 'chat_member',
    run: async (ctx) => {
        try {
            const update = ctx.update.chat_member;
            if (!update) return;
            
            const oldStatus = update.old_chat_member.status;
            const newStatus = update.new_chat_member.status;
            const user = update.new_chat_member.user;
            
            // User joined
            if (oldStatus === 'left' && (newStatus === 'member' || newStatus === 'restricted')) {
                console.log(`[MEMBER_ADD] ${user.first_name} joined group`);
                
                // Create user profile
                if (global.db && global.db.usersData) {
                    try {
                        const existing = await global.db.usersData.get(user.id);
                        if (!existing) {
                            await global.db.usersData.set(user.id, {
                                firstName: user.first_name,
                                lastName: user.last_name,
                                username: user.username,
                                money: 0,
                                bank: 0,
                                level: 1,
                                experience: 0,
                                createdAt: new Date().toISOString()
                            });
                        }
                    } catch (error) {
                        console.log(`[WARNING] Could not create user profile: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            console.error(`[ERROR] guildMemberAdd: ${error.message}`);
        }
    }
};
