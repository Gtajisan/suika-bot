
const neko = require("nekos.life");
const { kiss } = new neko();

module.exports = {
    config: {
        name: "kiss",
        version: "1.2",
        author: "milancodess",
        countDown: 5,
        role: 0,
        description: {
            en: "Send an anime kiss",
            ne: "एनिमे किस पठाउनुहोस्"
        },
        category: "anime",
        guide: {
            en: "{pn} [@user] - Kiss someone with a cute anime GIF",
            ne: "{pn} [@user] - प्यारो एनिमे GIF संग कसैलाई किस गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user you want to kiss",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            kissing: "😘 %1 is kissing %2!",
            kissingSelf: "😘 %1 is kissing themselves!",
            noMention: "😘 %1 is sending kisses!",
            error: "Sorry, I couldn't fetch a kiss gif. Please try again later.",
            loading: "Getting a kiss ready for you... 😘"
        },
        ne: {
            kissing: "😘 %1 ले %2 लाई किस गर्दैछ!",
            kissingSelf: "😘 %1 ले आफैलाई किस गर्दैछ!",
            noMention: "😘 %1 ले किसहरू पठाउँदैछ!",
            error: "माफ गर्नुहोस्, म किस gif प्राप्त गर्न सकिन। फेरि प्रयास गर्नुहोस्।",
            loading: "तपाईंको लागि किस तयार गर्दै... 😘"
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

            const result = await kiss();
            let targetUser;
            let msg;

            if (isSlash) {
                targetUser = interaction.options.getUser('user');
            } else if (message.mentions && message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            }

            if (targetUser) {
                if (targetUser.id === sender.id) {
                    msg = getLang("kissingSelf", `<@${sender.id}>`);
                } else {
                    msg = getLang("kissing", `<@${sender.id}>`, `<@${targetUser.id}>`);
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
                await message.channel.send({
                    content: msg,
                    files: [result.url]
                });
            }
        } catch (error) {
            console.error("Kiss command error:", error);
            const errorMsg = getLang("error");
            return isSlash ? interaction.editReply(errorMsg) : ctx.reply(errorMsg);
        }
    }
};
