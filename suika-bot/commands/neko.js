
const neko = require("nekos.life");
const { neko: nekoImg } = new neko();

module.exports = {
    config: {
        name: "neko",
        version: "1.1",
        author: "milancodess",
        countDown: 5,
        role: 0,
        description: {
            en: "Get a random neko image",
            ne: "अनियमित नेको छवि प्राप्त गर्नुहोस्"
        },
        category: "anime",
        guide: {
            en: "{pn} - Get a random cute neko (cat girl) image",
            ne: "{pn} - अनियमित प्यारो नेको (बिरालो केटी) छवि प्राप्त गर्नुहोस्"
        },
        slash: true
    },

    langs: {
        en: {
            neko: "Here's a cute neko for you! 🐱",
            loading: "Fetching a neko for you... 🐾",
            error: "Sorry, I couldn't fetch a neko image. Please try again later."
        },
        ne: {
            neko: "तपाईंको लागि एउटा प्यारो नेको! 🐱",
            loading: "तपाईंको लागि नेको ल्याउँदैछु... 🐾",
            error: "माफ गर्नुहोस्, म नेको छवि प्राप्त गर्न सकिन। फेरि प्रयास गर्नुहोस्।"
        }
    },

    onStart: async function ({ message, interaction, getLang }) {
        const isSlash = !!interaction;

        try {
            const loadingMsg = getLang("loading");
            
            if (isSlash) {
                await interaction.reply(loadingMsg);
            } else {
                await message.reply(loadingMsg);
            }

            const result = await nekoImg();

            if (isSlash) {
                await interaction.editReply({
                    content: getLang("neko"),
                    files: [result.url]
                });
            } else {
                await message.channel.send({
                    content: getLang("neko"),
                    files: [result.url]
                });
            }
        } catch (error) {
            console.error("Neko command error:", error);
            const errorMsg = getLang("error");
            if (isSlash) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply(errorMsg);
                } else {
                    await interaction.reply(errorMsg);
                }
            } else {
                await message.reply(errorMsg);
            }
        }
    }
};
