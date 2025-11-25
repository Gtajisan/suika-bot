const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "capcut",
        aliases: ["capcutdl", "ccdl"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Download CapCut video templates or clips",
            ne: "CapCut भिडियो टेम्पलेटहरू वा क्लिपहरू डाउनलोड गर्नुहोस्"
        },
        category: "downloader",
        guide: {
            en: "{prefix}capcut <capcut url>\nExample: {prefix}capcut https://www.capcut.com/tv2/ZSy6GYGEP/",
            ne: "{prefix}capcut <capcut url>\nउदाहरण: {prefix}capcut https://www.capcut.com/tv2/ZSy6GYGEP/"
        },
        slash: true,
        options: [
            {
                name: "url",
                description: "CapCut video URL",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noUrl: "❌ Please provide a CapCut video URL!",
            invalidUrl: "❌ Invalid URL! Please provide a valid CapCut video URL.",
            loading: "⏳ Fetching video data, please wait...",
            noVideoFound: "❌ No video found at the provided URL.",
            selectQuality: "🎬 **Select video quality:**\n\nChoose from the dropdown below:",
            downloading: "⏳ Downloading video, please wait...",
            success: "✅ Video downloaded successfully!",
            fileTooLarge: "❌ File too large to send (Discord limit 25MB).",
            apiError: "❌ API Error: %1",
            timeout: "⏰ Time's up! Selection cancelled.",
            invalidChoice: "❌ This is not your selection!"
        },
        ne: {
            noUrl: "❌ कृपया CapCut भिडियो URL प्रदान गर्नुहोस्!",
            invalidUrl: "❌ अवैध URL! कृपया मान्य CapCut भिडियो URL प्रदान गर्नुहोस्।",
            loading: "⏳ भिडियो जानकारी लिँदैछ, कृपया पर्खनुहोस्...",
            noVideoFound: "❌ प्रदान गरिएको URL मा कुनै भिडियो फेला परेन।",
            selectQuality: "🎬 **भिडियो गुणस्तर चयन गर्नुहोस्:**\n\nतलको ड्रपडाउनबाट चयन गर्नुहोस्:",
            downloading: "⏳ भिडियो डाउनलोड गर्दै, कृपया पर्खनुहोस्...",
            success: "✅ भिडियो सफलतापूर्वक डाउनलोड भयो!",
            fileTooLarge: "❌ फाइल पठाउन धेरै ठूलो छ (Discord को लागि अधिकतम 25MB)।",
            apiError: "❌ API त्रुटि: %1",
            timeout: "⏰ समय सकियो! चयन रद्द गरियो।",
            invalidChoice: "❌ यो तपाईंको छनोट होइन!"
        }
    },

    onChat: async function ({ message, guildData, getLang }) {
        // Check if auto download is enabled
        if (!guildData?.settings?.autoDownload) return;

        // Check for CapCut URLs in the message
        const capcutUrlRegex = /(https?:\/\/)?(www\.)?capcut\.com\/[^\s]+/gi;
        const matches = message.content.match(capcutUrlRegex);
        
        if (!matches || matches.length === 0) return;

        // Process the first URL found
        const url = matches[0];
        await this.processDownload({ message, url, getLang, user: message.author, isSlash: false });
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;
        let url = isSlash ? interaction.options.getString('url') : args.join(" ");

        await this.processDownload({ message, interaction, url, getLang, user, isSlash });
    },

    processDownload: async function ({ message, interaction, url, getLang, user, isSlash }) {

        try {
            if (!url) {
                const msg = getLang("noUrl");
                return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
            }

            if (!url.includes("capcut.com")) {
                const msg = getLang("invalidUrl");
                return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
            }

            const loadingEmbed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle("🎬 CapCut Downloader")
                .setDescription(getLang("loading"))
                .setFooter({ text: `Requested by ${user.username}` })
                .setTimestamp();

            let sentMessage;
            if (isSlash) {
                await interaction.reply({ embeds: [loadingEmbed] });
                sentMessage = await interaction.fetchReply();
                sentMessage.isSlash = true;
                sentMessage.interaction = interaction;
            } else {
                sentMessage = await message.reply({ embeds: [loadingEmbed] });
                sentMessage.isSlash = false;
            }

            // Fetch data from API
            const apiUrl = `https://universaldownloaderapi.vercel.app/api/capcut/download?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.success || !data.data || !data.data.medias?.length) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xED4245)
                    .setDescription(getLang("noVideoFound"));
                
                if (sentMessage.isSlash) {
                    return sentMessage.interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    return sentMessage.edit({ embeds: [errorEmbed] });
                }
            }

            const info = data.data;
            const medias = info.medias;

            // Create select menu options
            const options = medias.map((media, index) => {
                const emoji = media.quality?.includes("HD") ? "⭐" : 
                             media.quality?.includes("No Watermark") ? "🎬" : "📹";
                
                return new StringSelectMenuOptionBuilder()
                    .setLabel(media.quality || `Quality ${index + 1}`)
                    .setDescription("Select to download")
                    .setValue(`${index}`)
                    .setEmoji(emoji);
            });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`capcut_select_${sentMessage.id}`)
                .setPlaceholder('Select quality to download')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const qualityList = medias
                .map((m, i) => `**${i + 1}.** ${m.quality || `Quality ${i + 1}`}`)
                .join('\n');

            const selectEmbed = new EmbedBuilder()
                .setTitle("🎬 CapCut Video")
                .setDescription(`${getLang("selectQuality")}\n\n**Title:** ${info.title || "CapCut Video"}\n**Author:** ${info.author || "Unknown"}\n\n**Available qualities:**\n${qualityList}`)
                .setThumbnail(info.thumbnail)
                .setColor(0x3498db)
                .setFooter({ text: `${user.username} | Timeout: 60s` })
                .setTimestamp();

            if (sentMessage.isSlash) {
                await sentMessage.interaction.editReply({ embeds: [selectEmbed], components: [row] });
            } else {
                await sentMessage.edit({ embeds: [selectEmbed], components: [row] });
            }

            // Set up select menu handler
            const selectMenuId = `capcut_select_${sentMessage.id}`;
            global.RentoBot.onSelectMenu.set(selectMenuId, async (selectInteraction) => {
                if (selectInteraction.user.id !== user.id) {
                    return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
                }

                const selectedIndex = parseInt(selectInteraction.values[0]);
                const selectedMedia = medias[selectedIndex];
                
                await selectInteraction.deferUpdate();
                await downloadVideo(selectedMedia, info, sentMessage, getLang, user);
                global.RentoBot.onSelectMenu.delete(selectMenuId);
            });

            // Timeout cleanup
            setTimeout(() => {
                if (global.RentoBot.onSelectMenu.has(selectMenuId)) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setDescription(getLang("timeout"))
                        .setColor(0x95A5A6);

                    if (sentMessage.isSlash) {
                        sentMessage.interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
                    } else {
                        sentMessage.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
                    }
                    global.RentoBot.onSelectMenu.delete(selectMenuId);
                }
            }, 60000);

        } catch (error) {
            console.error("CapCut Error:", error);
            let errMsg = getLang("downloadFailed");
            if (error.response?.data?.message) errMsg = getLang("apiError", error.response.data.message);
            else if (error.message) errMsg = getLang("apiError", error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle("❌ CapCut Download Failed")
                .setDescription(errMsg)
                .setFooter({ text: `Requested by ${user.username}` });

            if (isSlash) {
                if (interaction.replied || interaction.deferred)
                    await interaction.editReply({ embeds: [errorEmbed] });
                else
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await message.reply({ embeds: [errorEmbed] });
            }
        }
    }
};



async function downloadVideo(media, info, sentMessage, getLang, user) {
    try {
        const downloadingEmbed = new EmbedBuilder()
            .setColor(0x3498db)
            .setDescription(getLang("downloading"))
            .setFooter({ text: `Requested by ${user.username}` });

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [downloadingEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [downloadingEmbed], components: [] });
        }

        const videoResponse = await axios({
            method: "get",
            url: media.url,
            responseType: "arraybuffer"
        });

        if (videoResponse.data.length > 25 * 1024 * 1024) {
            const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setDescription(getLang("fileTooLarge") + "\n\n**Download directly:**");
            
            const button = new ButtonBuilder()
                .setLabel('Click Here to Download')
                .setURL(media.url)
                .setStyle(ButtonStyle.Link)
                .setEmoji('⬇️');
            
            const row = new ActionRowBuilder().addComponents(button);
            
            if (sentMessage.isSlash) {
                return sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [row] });
            } else {
                return sentMessage.edit({ embeds: [errorEmbed], components: [row] });
            }
        }

        const tmpDir = path.join(__dirname, "tmp");
        await fs.ensureDir(tmpDir);
        const videoPath = path.join(tmpDir, `capcut_${Date.now()}.mp4`);
        await fs.writeFile(videoPath, videoResponse.data);

        const attachment = { attachment: videoPath, name: "capcut_video.mp4" };

        const successEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("✅ CapCut Video Downloaded")
            .setDescription(`**Title:** ${info.title || "CapCut Video"}\n**Author:** ${info.author || "Unknown"}\n**Quality:** ${media.quality}`)
            .setThumbnail(info.thumbnail)
            .setURL(info.url)
            .setFooter({ text: `Requested by ${user.username}` })
            .setTimestamp();

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({
                embeds: [successEmbed],
                files: [attachment]
            });
        } else {
            await sentMessage.edit({
                embeds: [successEmbed],
                files: [attachment]
            });
        }

        setTimeout(() => fs.unlink(videoPath).catch(() => {}), 8000);

    } catch (error) {
        console.error("Download Error:", error);
        const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
        
        const errorEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setDescription(getLang("apiError", error.message || "Unknown error") + "\n\n**Download directly:**");
        
        const button = new ButtonBuilder()
            .setLabel('Click Here to Download')
            .setURL(media.url)
            .setStyle(ButtonStyle.Link)
            .setEmoji('⬇️');
        
        const row = new ActionRowBuilder().addComponents(button);
        
        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [row] });
        } else {
            await sentMessage.edit({ embeds: [errorEmbed], components: [row] });
        }
    }
}
