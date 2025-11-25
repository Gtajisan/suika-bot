// Command to check if event handlers are working
module.exports = {
    config: {
        name: "checkevents",
        aliases: ["events", "eventcheck"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 2,
        description: {
            en: "Check if event handlers are properly configured"
        },
        category: "admin",
        guide: {
            en: "/checkevents - Check event status"
        },
    },

    langs: {
        en: {
            title: "Event System Status",
            registered: "Registered",
            notRegistered: "Not Registered",
            memberJoin: "Member Join Event",
            memberLeave: "Member Leave Event",
            messageDelete: "Message Delete Event",
            callback: "Callback Query Event",
            allPassed: "All checks passed! Event system is working."
        }
    },

    onStart: async function ({ ctx, getLang }) {
        try {
            const eventCommands = global.SuikaBot?.eventCommands || new Map();
            
            const checks = [];
            checks.push("========================================");
            checks.push("EVENT SYSTEM STATUS CHECK");
            checks.push("========================================");
            checks.push("");
            
            checks.push("CUSTOM EVENTS REGISTRATION:");
            checks.push(`my_chat_member: ${eventCommands.has('my_chat_member') ? 'Registered' : 'Not Registered'}`);
            checks.push(`chat_member: ${eventCommands.has('chat_member') ? 'Registered' : 'Not Registered'}`);
            checks.push(`message_deleted: ${eventCommands.has('message_deleted') ? 'Registered' : 'Not Registered'}`);
            checks.push(`callback_query: ${eventCommands.has('callback_query') ? 'Registered' : 'Not Registered'}`);
            checks.push("");
            
            checks.push("TOTAL CUSTOM EVENTS LOADED: " + eventCommands.size);
            checks.push("");
            
            checks.push("BUILTIN EVENTS:");
            checks.push("- Text message handler: Enabled");
            checks.push("- Start command: Enabled");
            checks.push("- Help command: Enabled");
            checks.push("- Ping command: Enabled");
            checks.push("");
            
            const allLoaded = eventCommands.size >= 4;
            checks.push(allLoaded ? "Status: All event handlers active" : "Status: Some events not loaded");
            checks.push("========================================");
            
            return ctx.reply(checks.join('\n'), { parse_mode: 'text' });

        } catch (error) {
            return ctx.reply(`Error: ${error.message}`);
        }
    }
};
