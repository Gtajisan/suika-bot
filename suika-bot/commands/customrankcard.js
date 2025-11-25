const { AttachmentBuilder } = require('../adapters/discord-to-telegram.js');
const { uploadImgbb } = require('../utils.js');

const checkUrlRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif)/gi;
const regExColor = /#([0-9a-f]{6})|rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)|rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+\.?\d*)\)/gi;

module.exports = {
    config: {
        name: "customrankcard",
        aliases: ["crc", "customrank"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Design your rank card with custom colors and styles",
            ne: "अनुकूलित रङ र शैलीहरूसँग आफ्नो रैंक कार्ड डिजाइन गर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "Usage: {prefix}customrankcard [option] <value>\n\n"
                + "Options:\n"
                + "• maincolor | background <value>: Main background of rank card\n"
                + "• subcolor <value>: Sub background\n"
                + "• linecolor <value>: Color of line between main and sub background\n"
                + "• expbarcolor <value>: Color of exp bar background\n"
                + "• progresscolor <value>: Color of current exp progress\n"
                + "• alphasubcolor <value>: Opacity of sub background (0 to 1)\n"
                + "• textcolor <value>: Color of all text (hex color or rgba)\n"
                + "• namecolor <value>: Color of name\n"
                + "• expcolor <value>: Color of exp text\n"
                + "• rankcolor <value>: Color of rank\n"
                + "• levelcolor <value>: Color of level\n"
                + "• reset: Reset all to default\n\n"
                + "Value can be:\n"
                + "• Hex color: #fff000\n"
                + "• RGB: rgb(255, 136, 86)\n"
                + "• RGBA: rgba(255, 136, 86, 0.4)\n"
                + "• Gradient: Multiple colors separated by space\n"
                + "• Image URL: For maincolor, subcolor, linecolor, expbarcolor, progresscolor\n\n"
                + "Examples:\n"
                + "• {prefix}customrankcard maincolor #fff000\n"
                + "• {prefix}customrankcard subcolor rgba(255,136,86,0.4)\n"
                + "• {prefix}customrankcard namecolor #ff0000 #00ff00\n"
                + "• {prefix}customrankcard alphasubcolor 0.5\n"
                + "• {prefix}customrankcard reset"
        },
        slash: true,
        options: [
            {
                name: "option",
                description: "Customization option",
                type: 3,
                required: true,
                choices: [
                    { name: "maincolor", value: "maincolor" },
                    { name: "subcolor", value: "subcolor" },
                    { name: "linecolor", value: "linecolor" },
                    { name: "expbarcolor", value: "expbarcolor" },
                    { name: "progresscolor", value: "progresscolor" },
                    { name: "alphasubcolor", value: "alphasubcolor" },
                    { name: "textcolor", value: "textcolor" },
                    { name: "namecolor", value: "namecolor" },
                    { name: "expcolor", value: "expcolor" },
                    { name: "rankcolor", value: "rankcolor" },
                    { name: "levelcolor", value: "levelcolor" },
                    { name: "reset", value: "reset" }
                ]
            },
            {
                name: "value",
                description: "Color value (hex, rgb, rgba, or gradient)",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            invalidImage: "❌ Invalid image URL. Please provide a valid URL ending with .jpg, .jpeg, .png, or .gif",
            invalidAttachment: "❌ Invalid attachment. Please provide an image file.",
            invalidColor: "❌ Invalid color code. Please use hex color (#RRGGBB) or rgba format.",
            notSupportImage: "❌ Image URLs are not supported for the \"%1\" option. Please use hex, rgb, or rgba colors.",
            success: "✅ Your rank card settings have been saved! Here's a preview:",
            reseted: "✅ All rank card settings have been reset to default.",
            invalidAlpha: "❌ Please choose a number between 0 and 1 for alpha/opacity.",
            missingValue: "❌ Please provide a value for this option."
        },
        ne: {
            invalidImage: "❌ अमान्य छवि URL। कृपया .jpg, .jpeg, .png, वा .gif सँग समाप्त हुने मान्य URL प्रदान गर्नुहोस्",
            invalidAttachment: "❌ अमान्य संलग्नक। कृपया छवि फाइल प्रदान गर्नुहोस्।",
            invalidColor: "❌ अमान्य रङ कोड। कृपया hex रङ (#RRGGBB) वा rgba ढाँचा प्रयोग गर्नुहोस्।",
            notSupportImage: "❌ छवि URLs \"%1\" विकल्पको लागि समर्थित छैनन्। कृपया hex, rgb, वा rgba रङहरू प्रयोग गर्नुहोस्।",
            success: "✅ तपाईंको रैंक कार्ड सेटिङहरू सेभ गरिएको छ! यहाँ पूर्वावलोकन छ:",
            reseted: "✅ सबै रैंक कार्ड सेटिङहरू पूर्वनिर्धारितमा रिसेट गरियो।",
            invalidAlpha: "❌ कृपया alpha/opacity को लागि ० र १ बीचको संख्या छान्नुहोस्।",
            missingValue: "❌ कृपया यो विकल्पको लागि मान प्रदान गर्नुहोस्।"
        }
    },

    onStart: async ({ message, interaction, args, usersData, getLang }) => {
        try {
            const isSlash = !!interaction;
            const user = isSlash ? interaction.user : message.author;

            // Defer reply for slash commands to prevent timeout
            if (isSlash) {
                await interaction.deferReply();
            }

            const key = isSlash 
                ? interaction.options.getString('option')
                : args[0]?.toLowerCase();

            let value = isSlash 
                ? interaction.options.getString('value') || ''
                : args.slice(1).join(" ");

            if (!key) {
                const guideImageUrl = 'https://i.ibb.co/BZ2Qgs1/image.png';
                
                                const guideEmbed = {}
                    
                    // Title: '📝 Custom Rank Card Guide'
                    // Description: 'Here\'s how to customize your rank card:'
                    // Image: guideImageUrl
                    .setFooter({ text: 'Use the options shown in the image above' });
                
                return isSlash 
                    ? interaction.editReply({ embeds: [guideEmbed] })
                    : ctx.reply({ embeds: [guideEmbed] });
            }

            const userData = await usersData.get(user.id);
            const customRankCard = userData.data?.customRankCard || {};

            const supportImage = ["maincolor", "background", "bg", "subcolor", "expbarcolor", "progresscolor", "linecolor"];
            const notSupportImage = ["textcolor", "namecolor", "expcolor", "rankcolor", "levelcolor", "lvcolor"];

            if ([...notSupportImage, ...supportImage].includes(key)) {
                // Get attachments from current message or replied message
                const attachments = [];
                if (message?.attachments) {
                    attachments.push(...[...message.attachments.values()].filter(att => att.contentType?.startsWith('image/')));
                }
                if (message?.reference) {
                    try {
                        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                        if (repliedMessage?.attachments) {
                            attachments.push(...[...repliedMessage.attachments.values()].filter(att => att.contentType?.startsWith('image/')));
                        }
                    } catch (err) {
                        console.error('Error fetching replied message:', err);
                    }
                }

                if (!value && attachments.length === 0 && key !== 'reset') {
                    return isSlash 
                        ? interaction.editReply(getLang("missingValue"))
                        : ctx.reply(getLang("missingValue"));
                }

                if (value === 'reset') {
                }
                else if (value && value.match(/^https?:\/\//)) {
                    const matchUrl = value.match(checkUrlRegex);
                    if (!matchUrl) {
                        return isSlash 
                            ? interaction.editReply(getLang("invalidImage"))
                            : ctx.reply(getLang("invalidImage"));
                    }
                    if (notSupportImage.includes(key)) {
                        return isSlash 
                            ? interaction.editReply(getLang("notSupportImage", key))
                            : ctx.reply(getLang("notSupportImage", key));
                    }

                    // Send uploading message
                    const uploadMsg = isSlash 
                        ? await interaction.editReply("⏳ Uploading image to ImgBB for permanent storage...")
                        : await ctx.reply("⏳ Uploading image to ImgBB for permanent storage...");

                    try {
                        const axios = require('axios');
                        const response = await axios.get(matchUrl[0], { 
                            responseType: 'arraybuffer',
                            timeout: 15000,
                            maxContentLength: 10 * 1024 * 1024,
                            maxRedirects: 5
                        });
                        const buffer = Buffer.from(response.data);
                        const infoFile = await uploadImgbb(buffer);
                        value = infoFile.image.url;
                    } catch (err) {
                        console.error('Upload error:', err);
                        return isSlash 
                            ? interaction.editReply("❌ Failed to upload image. The URL may be invalid or unreachable. Try using a Discord CDN URL or upload the image directly.")
                            : ctx.reply("❌ Failed to upload image. The URL may be invalid or unreachable. Try using a Discord CDN URL or upload the image directly.");
                    }
                }
                else if (attachments.length > 0) {
                    if (notSupportImage.includes(key)) {
                        return isSlash 
                            ? interaction.editReply(getLang("notSupportImage", key))
                            : ctx.reply(getLang("notSupportImage", key));
                    }

                    // Send uploading message
                    const uploadMsg = isSlash 
                        ? await interaction.editReply("⏳ Uploading image to ImgBB for permanent storage...")
                        : await ctx.reply("⏳ Uploading image to ImgBB for permanent storage...");

                    try {
                        const axios = require('axios');
                        const response = await axios.get(attachments[0].url, { 
                            responseType: 'arraybuffer',
                            timeout: 15000,
                            maxContentLength: 10 * 1024 * 1024,
                            maxRedirects: 5
                        });
                        const buffer = Buffer.from(response.data);
                        const infoFile = await uploadImgbb(buffer);
                        value = infoFile.image.url;
                    } catch (err) {
                        console.error('Upload error:', err);
                        return isSlash 
                            ? interaction.editReply("❌ Failed to upload image. The image may be too large or invalid.")
                            : ctx.reply("❌ Failed to upload image. The image may be too large or invalid.");
                    }
                }
                else {
                    const colors = value.match(regExColor);
                    if (!colors) {
                        return isSlash 
                            ? interaction.editReply(getLang("invalidColor"))
                            : ctx.reply(getLang("invalidColor"));
                    }
                    value = colors.length === 1 ? colors[0] : colors;
                }

                switch (key) {
                    case "maincolor":
                    case "background":
                    case "bg":
                        value === "reset" ? delete customRankCard.main_color : customRankCard.main_color = value;
                        break;
                    case "subcolor":
                        value === "reset" ? delete customRankCard.sub_color : customRankCard.sub_color = value;
                        break;
                    case "linecolor":
                        value === "reset" ? delete customRankCard.line_color : customRankCard.line_color = value;
                        break;
                    case "progresscolor":
                        value === "reset" ? delete customRankCard.exp_color : customRankCard.exp_color = value;
                        break;
                    case "expbarcolor":
                        value === "reset" ? delete customRankCard.expNextLevel_color : customRankCard.expNextLevel_color = value;
                        break;
                    case "textcolor":
                        value === "reset" ? delete customRankCard.text_color : customRankCard.text_color = value;
                        break;
                    case "namecolor":
                        value === "reset" ? delete customRankCard.name_color : customRankCard.name_color = value;
                        break;
                    case "rankcolor":
                        value === "reset" ? delete customRankCard.rank_color : customRankCard.rank_color = value;
                        break;
                    case "levelcolor":
                    case "lvcolor":
                        value === "reset" ? delete customRankCard.level_color : customRankCard.level_color = value;
                        break;
                    case "expcolor":
                        value === "reset" ? delete customRankCard.exp_text_color : customRankCard.exp_text_color = value;
                        break;
                }

                await usersData.set(user.id, {
                    data: {
                        ...userData.data,
                        customRankCard
                    }
                });

                const { RankCard, defaultDesignCard } = require('./rankcard.js');
                const allUsers = await usersData.getAll();

                const sortedUsers = allUsers
                    .filter(u => u.exp > 0)
                    .sort((a, b) => b.exp - a.exp);

                const userRank = sortedUsers.findIndex(u => u.userID === user.id) + 1;
                const currentLevel = global.utils.calculateLevel(userData.exp);
                const expForCurrentLevel = global.utils.getExpForLevel(currentLevel);
                const expInCurrentLevel = userData.exp - expForCurrentLevel;

                const configRankCard = {
                    ...defaultDesignCard,
                    ...customRankCard
                };

                const dataLevel = {
                    exp: expInCurrentLevel,
                    expNextLevel: 100,
                    name: user.username,
                    rank: `#${userRank}/${sortedUsers.length}`,
                    level: currentLevel,
                    avatar: user.displayAvatarURL({ extension: 'png', size: 512 })
                };

                const rankCard = new RankCard({
                    ...configRankCard,
                    ...dataLevel
                });

                const buffer = await rankCard.buildCard();
                const attachment = new AttachmentBuilder(buffer, { name: 'rankcard.png' });

                const response = getLang("success");
                return isSlash 
                    ? interaction.editReply({ content: response, files: [attachment] })
                    : ctx.reply({ content: response, files: [attachment] });

            }
            else if (["alphasubcolor", "alphasubcard"].includes(key)) {
                if (!value) {
                    return isSlash 
                        ? interaction.editReply(getLang("missingValue"))
                        : ctx.reply(getLang("missingValue"));
                }

                const alphaValue = parseFloat(value);
                if (isNaN(alphaValue) || alphaValue < 0 || alphaValue > 1) {
                    return isSlash 
                        ? interaction.editReply(getLang("invalidAlpha"))
                        : ctx.reply(getLang("invalidAlpha"));
                }

                customRankCard.alpha_subcard = alphaValue;

                await usersData.set(user.id, {
                    data: {
                        ...userData.data,
                        customRankCard
                    }
                });

                const { RankCard, defaultDesignCard } = require('./rankcard.js');
                const allUsers = await usersData.getAll();

                const sortedUsers = allUsers
                    .filter(u => u.exp > 0)
                    .sort((a, b) => b.exp - a.exp);

                const userRank = sortedUsers.findIndex(u => u.userID === user.id) + 1;
                const currentLevel = global.utils.calculateLevel(userData.exp);
                const expForCurrentLevel = global.utils.getExpForLevel(currentLevel);
                const expInCurrentLevel = userData.exp - expForCurrentLevel;

                const configRankCard = {
                    ...defaultDesignCard,
                    ...customRankCard
                };

                const dataLevel = {
                    exp: expInCurrentLevel,
                    expNextLevel: 100,
                    name: user.username,
                    rank: `#${userRank}/${sortedUsers.length}`,
                    level: currentLevel,
                    avatar: user.displayAvatarURL({ extension: 'png', size: 512 })
                };

                const rankCard = new RankCard({
                    ...configRankCard,
                    ...dataLevel
                });

                const buffer = await rankCard.buildCard();
                const attachment = new AttachmentBuilder(buffer, { name: 'rankcard.png' });

                const response = getLang("success");
                return isSlash 
                    ? interaction.editReply({ content: response, files: [attachment] })
                    : ctx.reply({ content: response, files: [attachment] });

            }
            else if (key === "reset") {
                await usersData.set(user.id, {
                    data: {
                        ...userData.data,
                        customRankCard: {}
                    }
                });

                const response = getLang("reseted");
                return isSlash 
                    ? interaction.editReply(response)
                    : ctx.reply(response);
            }
            else {
                const guideImageUrl = 'https://i.ibb.co/BZ2Qgs1/image.png';
                
                                const guideEmbed = {}
                    
                    // Title: '📝 Custom Rank Card Guide'
                    // Description: 'Here\'s how to customize your rank card:'
                    // Image: guideImageUrl
                    .setFooter({ text: 'Use the options shown in the image above' });
                
                return isSlash 
                    ? interaction.editReply({ embeds: [guideEmbed] })
                    : ctx.reply({ embeds: [guideEmbed] });
            }

        } catch (error) {
            console.error('Customrankcard error:', error);
            const response = "❌ An error occurred while customizing your rank card.";
            return interaction 
                ? (interaction.deferred ? interaction.editReply(response) : ctx.reply(response))
                : ctx.reply(response);
        }
    }
};