
const neko = require("nekos.life");
const { hug } = new neko();

module.exports = {
    config: {
        name: "hug",
        version: "1.1",
        author: "milancodess",
        countDown: 5,
        role: 0,
        description: {
            en: "Send an anime hug",
            ne: "एनिमे हग पठाउनुहोस्"
        },
        category: "anime",
        guide: {
            en: "{pn} [@user] - Hug someone with a cute anime GIF",
            ne: "{pn} [@user] - प्यारो एनिमे GIF संग कसैलाई हग गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user you want to hug",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            hugging: "🤗 %1 is hugging %2!",
            huggingSelf: "🤗 %1 is hugging themselves!",
            noMention: "🤗 %1 is giving a warm hug!",
            error: "Sorry, I couldn't fetch a hug gif. Please try again later.",
            loading: "Getting a hug ready for you... 🤗"
        },
        ne: {
            hugging: "🤗 %1 ले %2 लाई हग गर्दैछ!",
            huggingSelf: "🤗 %1 ले आफैलाई हग गर्दैछ!",
            noMention: "🤗 %1 ले न्यानो हग दिँदैछ!",
            error: "माफ गर्नुहोस्, म हग gif प्राप्त गर्न सकिन। फेरि प्रयास गर्नुहोस्।",
            loading: "तपाईंको लागि हग तयार गर्दै... 🤗"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const sender = isSlash ? interaction.user : message.author;

        try {
            const loadingMsg = getLang("loading");
            
            if (isSlash) {
                await ctx.reply(loadingMsg);
            } else {
                await ctx.reply(loadingMsg);
            }

            const result = await hug();
            let targetUser;
            let msg;

            if (isSlash) {
                targetUser = interaction.options.getUser('user');
            } else if (message.mentions && message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            }

            if (targetUser) {
                if (targetUser.id === sender.id) {
                    msg = getLang("huggingSelf", `<@${sender.id}>`);
                } else {
                    msg = getLang("hugging", `<@${sender.id}>`, `<@${targetUser.id}>`);
                }
            } else {
                msg = getLang("noMention", `<@${sender.id}>`);
            }

            if (isSlash) {
                await interaction.editReply({
                    content: msg,
                    files: [result.url]
                });
            } else {
                const sentMessage = await message.channel.messages.fetch(message.id).then(() => message).catch(() => null);
                if (sentMessage) {
                    await message.channel.send({
                        content: msg,
                        files: [result.url]
                    });
                }
            }
        } catch (error) {
            console.error("Hug command error:", error);
            const errorMsg = getLang("error");
            return isSlash ? interaction.editReply(errorMsg) : ctx.reply(errorMsg);
        }
    }
};
