const axios = require("axios");

module.exports = {
    config: {
        name: "pet",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Pet someone with a cute animated GIF",
            ne: "एनिमेटेड GIF संग कसैलाई प्यारा हेडपट दिनुहोस्"
        },
        category: "anime",
        guide: {
            en: "{pn} [@user] - Pet someone with a fun animation",
            ne: "{pn} [@user] - एनिमेसन मार्फत कसैलाई हेडपट दिनुहोस्"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user you want to pet",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            petting: "🐾 %1 is petting %2!",
            pettingSelf: "🐾 %1 is petting themselves... adorable!",
            noMention: "🐾 %1 is giving a gentle pet!",
            loading: "Getting a pet animation ready... 🐕",
            error: "Sorry, I couldn't fetch the pet animation. Please try again later."
        },
        ne: {
            petting: "🐾 %1 ले %2 लाई हेडपट दिइरहेको छ!",
            pettingSelf: "🐾 %1 ले आफैलाई हेडपट दिइरहेको छ... क्यूट!",
            noMention: "🐾 %1 ले कोमल हेडपट दिइरहेको छ!",
            loading: "हेडपट एनिमेसन तयार गर्दैछु... 🐕",
            error: "माफ गर्नुहोस्, म हेडपट एनिमेसन प्राप्त गर्न सकिन। फेरि प्रयास गर्नुहोस्।"
        }
    },

    onStart: async function ({ message, interaction, getLang }) {
        const isSlash = !!interaction;
        const sender = isSlash ? interaction.user : message.author;

        try {
            const loadingMsg = getLang("loading");

            if (isSlash) {
                await interaction.reply(loadingMsg);
            } else {
                await message.reply(loadingMsg);
            }

            // Determine target user
            let targetUser;
            if (isSlash) {
                targetUser = interaction.options.getUser("user");
            } else if (message.mentions && message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            }

            // Generate avatar URL
            const avatarURL = (targetUser || sender).displayAvatarURL({ extension: "png", size: 512 });

            // Fetch pet image from API
            const { data } = await axios.get(`https://api.popcat.xyz/v2/pet?image=${encodeURIComponent(avatarURL)}`, {
                responseType: "arraybuffer"
            });

            // Convert buffer to attachment
            const buffer = Buffer.from(data, "binary");

            let msg;
            if (targetUser) {
                if (targetUser.id === sender.id) {
                    msg = getLang("pettingSelf", `<@${sender.id}>`);
                } else {
                    msg = getLang("petting", `<@${sender.id}>`, `<@${targetUser.id}>`);
                }
            } else {
                msg = getLang("noMention", `<@${sender.id}>`);
            }

            if (isSlash) {
                await interaction.editReply({
                    content: msg,
                    files: [{ attachment: buffer, name: "pet.gif" }]
                });
            } else {
                await message.channel.send({
                    content: msg,
                    files: [{ attachment: buffer, name: "pet.gif" }]
                });
            }
        } catch (error) {
            console.error("Pet command error:", error);
            const errorMsg = getLang("error");
            return isSlash ? interaction.editReply(errorMsg) : message.reply(errorMsg);
        }
    }
};
