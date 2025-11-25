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
        description: {
            en: "Chat with an AI",
            ne: "AI सँग च्याट गर्नुहोस्"
        },
        guide: {
            en: "/ai <your question>",
            ne: "/ai <तपाईको प्रश्न>"
        }
    },

    langs: {
        en: {
            noQuery: "❌ Please provide a question. Example: /ai Tell me a story",
            thinking: "🤔 Thinking...",
            error: "⚠️ Error: %1"
        },
        ne: {
            noQuery: "❌ कृपया प्रश्न प्रदान गर्नुहोस्। उदाहरण: /ai मलाई एक कहानी बताउनुहोस्",
            thinking: "🤔 सोच्दै छु...",
            error: "⚠️ त्रुटि: %1"
        }
    },

    onStart: async ({ ctx, args, getLang }) => {
        const query = args.join(' ').trim();

        if (!query) {
            return ctx.reply(getLang("noQuery"));
        }

        try {
            const processing = await ctx.reply(getLang("thinking"));

            const response = await axios.get(
                `https://hridoy-apis.onrender.com/ai/ai4chat?text=${encodeURIComponent(query)}`,
                { timeout: 15000 }
            );

            if (response.data.status && response.data.result) {
                await ctx.telegram.editMessageText(
                    processing.chat.id,
                    processing.message_id,
                    undefined,
                    `🤖 AI Response:\n\n${response.data.result}`
                );
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            ctx.reply(getLang("error", error.message.substring(0, 100)));
        }
    }
};
