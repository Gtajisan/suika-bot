const axios = require("axios");
const { AttachmentBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "emojimix",
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Mix two emojis together using the EmojiK API",
            ne: "EmojiK API प्रयोग गरेर दुई इमोजीहरू मिलाउनुहोस्"
        },
        category: "fun",
        guide: {
            en: "{prefix}emojimix <emoji1> <emoji2>\nExample: {prefix}emojimix 🤣 🥰",
            ne: "{prefix}emojimix <emoji1> <emoji2>\nउदाहरण: {prefix}emojimix 🤣 🥰"
        },
        slash: true,
        options: [
            {
                name: "emoji1",
                description: "First emoji to mix",
                type: 3,
                required: true
            },
            {
                name: "emoji2",
                description: "Second emoji to mix",
                type: 3,
                required: true
            },
            {
                name: "size",
                description: "Output image size (16–512)",
                type: 4,
                required: false
            }
        ]
    },

    langs: {
        en: {
            error: "❌ Sorry, emoji %1 and %2 couldn't be mixed.",
            success: "✨ Emoji %1 and %2 mixed successfully!",
            noEmoji: "❌ Please provide two emojis to mix.",
            invalid: "❌ Please provide valid emojis (no text or symbols)."
        },
        ne: {
            error: "❌ माफ गर्नुहोस्, emoji %1 र %2 मिलाउन सकिएन।",
            success: "✨ Emoji %1 र %2 सफलतापूर्वक मिलाइयो!",
            noEmoji: "❌ कृपया मिलाउन दुई emojis प्रदान गर्नुहोस्।",
            invalid: "❌ कृपया मान्य emojis प्रदान गर्नुहोस् (पाठ वा प्रतीकहरू होइन)।"
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        try {
            let emoji1, emoji2, size;
            const isSlash = !!interaction;

            if (isSlash) {
                emoji1 = interaction.options.getString("emoji1");
                emoji2 = interaction.options.getString("emoji2");
                size = interaction.options.getInteger("size") || 128;
            } else {
                emoji1 = args[0];
                emoji2 = args[1];
                size = parseInt(args[2]) || 128;
            }

            if (!emoji1 || !emoji2) {
                const response = getLang("noEmoji");
                return isSlash 
                    ? ctx.reply({ content: response, ephemeral: true })
                    : ctx.reply(response);
            }

            // Clamp size
            if (size < 16) size = 16;
            if (size > 512) size = 512;

            // Convert emojis to codepoints
            const cp1 = toCodePoint(emoji1);
            const cp2 = toCodePoint(emoji2);

            if (!cp1 || !cp2) {
                const response = getLang("invalid");
                return isSlash
                    ? ctx.reply({ content: response, ephemeral: true })
                    : ctx.reply(response);
            }

            const imageUrl = `https://emojik.vercel.app/s/${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}?size=${size}`;

            // Fetch the image
            const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });

            const attachment = new AttachmentBuilder(Buffer.from(data), {
                name: `emojimix_${Date.now()}.png`
            });

            const responseText = getLang("success", emoji1, emoji2);

            return isSlash
                ? ctx.reply({ content: responseText, files: [attachment] })
                : ctx.reply({ content: responseText, files: [attachment] });

        } catch (error) {
            console.error("❌ EmojiMix Error:", error.message);
            const errMsg = `❌ An error occurred: ${error.message}`;
            return interaction
                ? ctx.reply({ content: errMsg, ephemeral: true })
                : ctx.reply(errMsg);
        }
    }
};

// Convert emoji to codepoint string
function toCodePoint(emoji) {
    try {
        const codepoints = [];
        for (const symbol of [...emoji]) {
            const cp = symbol.codePointAt(0).toString(16);
            codepoints.push(cp);
        }
        return codepoints.join("-");
    } catch {
        return null;
    }
}
