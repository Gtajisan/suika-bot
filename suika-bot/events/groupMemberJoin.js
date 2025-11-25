// Group member join event handler
module.exports = {
    eventName: 'chat_member',
    
    run: async (ctx) => {
        try {
            const update = ctx.update.chat_member;
            if (!update) return;
            
            const oldStatus = update.old_chat_member.status;
            const newStatus = update.new_chat_member.status;
            const user = update.new_chat_member.user;
            const chat = update.chat;
            
            // User joined group
            if (oldStatus === 'left' && (newStatus === 'member' || newStatus === 'restricted')) {
                const userId = user.id;
                const userName = user.first_name || user.username || 'User';
                const chatTitle = chat.title || 'Group';
                
                console.log(`[GROUP_MEMBER_JOIN] ${userName} joined ${chatTitle}`);
                
                // Store user data
                if (global.db && global.db.usersData) {
                    try {
                        const userData = await global.db.usersData.get(userId);
                        if (!userData) {
                            await global.db.usersData.set(userId, {
                                firstName: user.first_name,
                                lastName: user.last_name,
                                username: user.username,
                                money: 0,
                                bank: 0,
                                level: 1,
                                experience: 0,
                                createdAt: new Date().toISOString()
                            });
                            console.log(`[DATABASE] New user profile created for ${userId}`);
                        }
                    } catch (error) {
                        console.log(`[WARNING] Could not store user data: ${error.message}`);
                    }
                }
            }
            
            // User left group
            if ((oldStatus === 'member' || oldStatus === 'restricted') && newStatus === 'left') {
                const userId = user.id;
                const userName = user.first_name || user.username || 'User';
                const chatTitle = chat.title || 'Group';
                
                console.log(`[GROUP_MEMBER_LEAVE] ${userName} left ${chatTitle}`);
            }
            
            // User was banned
            if ((oldStatus === 'member' || oldStatus === 'restricted') && newStatus === 'kicked') {
                const userId = user.id;
                const userName = user.first_name || user.username || 'User';
                const chatTitle = chat.title || 'Group';
                
                console.log(`[GROUP_MEMBER_BAN] ${userName} was banned from ${chatTitle}`);
            }
            
        } catch (error) {
            console.error(`[ERROR] groupMemberJoin event: ${error.message}`);
        }
    }
};
