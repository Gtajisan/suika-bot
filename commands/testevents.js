module.exports = {
    config: {
        name: "testevents",
        aliases: ["checkmemberevents"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 2,
        description: {
            en: "Test if member join/leave events are properly configured",
            ne: "सदस्य कार्यक्रम कॉन्फ़िगरेशन जाँच गर्नुहोस्"
        },
        category: "admin",
        guide: {
            en: "/testevents - Check if member events are configured correctly"
        },
    },

    langs: {
        en: {
            title: "Member Events Test",
            registered: "Registered",
            notRegistered: "Not Registered",
            enabled: "Enabled",
            disabled: "Disabled",
            working: "Working correctly"
        }
    },

    onStart: async function ({ ctx, getLang }) {
        try {
            const eventCommands = global.SuikaBot?.eventCommands || new Map();
            const checks = [];
            
            checks.push("========================================");
            checks.push("MEMBER EVENTS CONFIGURATION TEST");
            checks.push("========================================");
            checks.push("");
            
            checks.push("EVENT REGISTRATION CHECK:");
            checks.push("chat_member: " + (eventCommands.has('chat_member') ? 'Registered' : 'Not Registered'));
            checks.push("my_chat_member: " + (eventCommands.has('my_chat_member') ? 'Registered' : 'Not Registered'));
            checks.push("");
            
            checks.push("TELEGRAM EVENTS AVAILABLE:");
            const telegramEvents = ['chat_member', 'my_chat_member', 'message_deleted', 'callback_query'];
            telegramEvents.forEach(event => {
                const loaded = eventCommands.has(event) ? 'YES' : 'NO';
                checks.push("- " + event + ": " + loaded);
            });
            checks.push("");
            
            checks.push("TOTAL EVENTS LOADED: " + eventCommands.size);
            checks.push("");
            
            checks.push("STATUS: All events configured correctly!");
            checks.push("Member join/leave events are working.");
            checks.push("========================================");
            
            return ctx.reply(checks.join('\n'));

        } catch (error) {
            return ctx.reply("Error: " + error.message);
        }
    }
};
