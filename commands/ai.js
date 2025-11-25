const axios = require('axios');

module.exports = {
    config: {
        name: "ai",
        aliases: ["ai4", "aichat"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        category: "ai",
        description: { en: "Chat with an AI", ne: "AI सँग च्याट गर्नुहोस्" },
        guide: { en: "/ai <question>", ne: "/ai <प्रश्न>" }
    },
    langs: {
        en: { noQuery: "❌ /ai Tell me a joke", thinking: "🤔 Thinking...", error: "⚠️ Error: %1", response: "🤖 %1" },
        ne: { noQuery: "❌ कृपया प्रश्न दिनुहोस्", thinking: "🤔 सोच्दै", error: "⚠️ त्रुटि: %1", response: "🤖 %1" }
    },
    onStart: async ({ ctx, args, getLang }) => {
        const query = args.join(' ').trim();
        if (!query) return ctx.reply(getLang("noQuery"));
        try {
            const msg = await ctx.reply(getLang("thinking"));
            const res = await axios.get(`https://hridoy-apis.onrender.com/ai/ai4chat?text=${encodeURIComponent(query)}`, { timeout: 15000 });
            if (res.data.status && res.data.result) {
                await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, undefined, getLang("response", res.data.result.substring(0, 4000)));
            } else throw new Error('Invalid response');
        } catch (err) { ctx.reply(getLang("error", err.message.substring(0, 80))); }
    }
};
