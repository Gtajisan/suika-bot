
const neko = require("nekos.life");
const { slap } = new neko();

module.exports = {
    config: {
        name: "slap",
        version: "1.0",
        author: "milancodess",
        countDown: 5,
        role: 0,
        description: {
            en: "Send an anime slap",
            ne: "एनिमे स्लाप पठाउनुहोस्"
        },
        category: "anime",
        guide: {
            en: "{pn} [@user] - Slap someone with an anime GIF",
            ne: "{pn} [@user] - एनिमे GIF संग कसैलाई स्लाप गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user you want to slap",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            slapping: "👋 %1 just slapped %2!",
            slappingSelf: "👋 %1 is slapping themselves!",
            noMention: "👋 %1 wants to slap someone!",
            error: "Sorry, I couldn't fetch a slap gif. Please try again later.",
            loading: "Getting a slap ready for you... 👋"
        },
        ne: {
            slapping: "👋 %1 ले %2 लाई स्लाप गर्यो!",
            slappingSelf: "👋 %1 ले आफैलाई स्लाप गर्दैछ!",
            noMention: "👋 %1 ले कसैलाई स्लाप गर्न चाहन्छ!",
            error: "माफ गर्नुहोस्, म स्लाप gif प्राप्त गर्न सकिन। फेरि प्रयास गर्नुहोस्।",
            loading: "तपाईंको लागि स्लाप तयार गर्दै... 👋"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const sender = isSlash ? interaction.user : message.author;

        try {
            const loadingMsg = getLang("loading");
            
            if (isSlash) {
                await interaction.reply(loadingMsg);
            } else {
                await message.reply(loadingMsg);
            }

            const result = await slap();
            let targetUser;
            let msg;

            if (isSlash) {
                targetUser = interaction.options.getUser('user');
            } else if (message.mentions && message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            }

            if (targetUser) {
                if (targetUser.id === sender.id) {
                    msg = getLang("slappingSelf", `<@${sender.id}>`);
                } else {
                    msg = getLang("slapping", `<@${sender.id}>`, `<@${targetUser.id}>`);
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
            console.error("Slap command error:", error);
            const errorMsg = getLang("error");
            return isSlash ? interaction.editReply(errorMsg) : message.reply(errorMsg);
        }
    }
};
