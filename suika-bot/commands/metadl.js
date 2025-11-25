
const axios = require('axios');
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "metadl",
        aliases: ["igdl", "fbdl", "insta", "facebook"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Download Instagram and Facebook videos",
            ne: "इन्स्टाग्राम र फेसबुक भिडियोहरू डाउनलोड गर्नुहोस्"
        },
        category: "downloader",
        guide: {
            en: "{prefix}metadl <instagram/facebook url>\nExample: {prefix}metadl https://www.instagram.com/reel/...",
            ne: "{prefix}metadl <instagram/facebook url>\nउदाहरण: {prefix}metadl https://www.instagram.com/reel/..."
        },
        slash: true,
        options: [
            {
                name: "url",
                description: "Instagram or Facebook video URL",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noUrl: "❌ Please provide an Instagram or Facebook video URL!",
            invalidUrl: "❌ Invalid URL! Please provide a valid Instagram or Facebook video URL.",
            loading: "⏳ Downloading video, please wait...",
            downloadFailed: "❌ Failed to download video. Please check the URL and try again.",
            success: "✅ Video downloaded successfully!",
            apiError: "❌ API Error: %1",
            fileTooLarge: "❌ File is too large to send (max 25MB for Discord)",
            noVideoFound: "❌ No video found at the provided URL."
        },
        ne: {
            noUrl: "❌ कृपया इन्स्टाग्राम वा फेसबुक भिडियो URL प्रदान गर्नुहोस्!",
            invalidUrl: "❌ अवैध URL! कृपया मान्य इन्स्टाग्राम वा फेसबुक भिडियो URL प्रदान गर्नुहोस्।",
            loading: "⏳ भिडियो डाउनलोड गर्दै, कृपया पर्खनुहोस्...",
            downloadFailed: "❌ भिडियो डाउनलोड गर्न असफल भयो। कृपया URL जाँच गर्नुहोस् र पुन: प्रयास गर्नुहोस्।",
            success: "✅ भिडियो सफलतापूर्वक डाउनलोड भयो!",
            apiError: "❌ API त्रुटि: %1",
            fileTooLarge: "❌ फाइल पठाउन धेरै ठूलो छ (Discord को लागि अधिकतम 25MB)",
            noVideoFound: "❌ प्रदान गरिएको URL मा कुनै भिडियो फेला परेन।"
        }
    },

    onChat: async function ({ message, guildData, getLang }) {
        // Check if auto download is enabled
        if (!guildData?.settings?.autoDownload) return;

        // Check for Instagram or Facebook URLs
        const urlRegex = /(https?:\/\/)?(www\.)?(instagram\.com|facebook\.com|fb\.watch)\/[^\s]+/gi;
        const matches = message.content.match(urlRegex);
        
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
                const response = getLang("noUrl");
                return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }

            // Validate URL
            const isInstagram = url.includes('instagram.com');
            const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');

            if (!isInstagram && !isFacebook) {
                const response = getLang("invalidUrl");
                return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }

            const loadingEmbed = new EmbedBuilder()
                .setDescription(getLang("loading"))
                .setColor(0x1DB954)
                .setFooter({ text: user.username });

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

            // Fetch video data from API
            const apiUrl = `https://universaldownloaderapi.vercel.app/api/meta/download?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);

            if (!response.data.success || !response.data.data.status || !response.data.data.data || response.data.data.data.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(getLang("noVideoFound"))
                    .setColor(0xED4245);
                
                if (sentMessage.isSlash) {
                    return sentMessage.interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    return sentMessage.edit({ embeds: [errorEmbed] });
                }
            }

            const videoData = response.data.data.data[0];
            const videoUrl = videoData.url;
            const thumbnail = videoData.thumbnail;

            // Download video
            const videoResponse = await axios({
                method: 'get',
                url: videoUrl,
                responseType: 'arraybuffer',
                maxContentLength: 25 * 1024 * 1024, // 25MB limit
                maxBodyLength: 25 * 1024 * 1024
            });

            // Check file size
            if (videoResponse.data.length > 25 * 1024 * 1024) {
                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('../adapters/discord-to-telegram.js');
                const errorEmbed = new EmbedBuilder()
                    .setDescription(getLang("fileTooLarge") + "\n\n**Download directly:**")
                    .setColor(0xED4245);
                
                const button = new ButtonBuilder()
                    .setLabel('Click Here to Download')
                    .setURL(videoUrl)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('⬇️');
                
                const row = new ActionRowBuilder().addComponents(button);
                
                if (sentMessage.isSlash) {
                    return sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [row] });
                } else {
                    return sentMessage.edit({ embeds: [errorEmbed], components: [row] });
                }
            }

            // Save video temporarily
            const tmpDir = path.join(__dirname, 'tmp');
            await fs.ensureDir(tmpDir);
            
            const platform = isInstagram ? 'instagram' : 'facebook';
            const timestamp = Date.now();
            const videoPath = path.join(tmpDir, `${platform}_${timestamp}.mp4`);
            
            await fs.writeFile(videoPath, videoResponse.data);

            // Create attachment
            const attachment = new AttachmentBuilder(videoPath, { 
                name: `${platform}_video.mp4` 
            });

            const successEmbed = new EmbedBuilder()
                .setDescription(getLang("success"))
                .setColor(0x00FF00)
                .setFooter({ text: user.username })
                .setTimestamp();

            if (thumbnail) {
                successEmbed.setThumbnail(thumbnail);
            }

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

            // Clean up temporary file
            setTimeout(() => {
                fs.unlink(videoPath).catch(() => {});
            }, 5000);

        } catch (error) {
            console.error('MetaDL Error:', error);
            
            let errorMessage = getLang("downloadFailed");
            if (error.response?.data?.message) {
                errorMessage = getLang("apiError", error.response.data.message);
            } else if (error.message) {
                errorMessage = getLang("apiError", error.message);
            }

            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('../adapters/discord-to-telegram.js');
            const errorEmbed = new EmbedBuilder()
                .setDescription(errorMessage + "\n\n**Try downloading directly:**")
                .setColor(0xED4245);

            let components = [];
            // Try to get download URL if available
            try {
                if (typeof videoUrl !== 'undefined' && videoUrl) {
                    const button = new ButtonBuilder()
                        .setLabel('Click Here to Download')
                        .setURL(videoUrl)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('⬇️');
                    
                    const row = new ActionRowBuilder().addComponents(button);
                    components = [row];
                } else if (url) {
                    const button = new ButtonBuilder()
                        .setLabel('Open Original Post')
                        .setURL(url)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🔗');
                    
                    const row = new ActionRowBuilder().addComponents(button);
                    components = [row];
                }
            } catch (btnError) {
                console.error('Button creation error:', btnError);
            }

            if (isSlash) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ embeds: [errorEmbed], components });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], components, ephemeral: true });
                }
            } else {
                await message.reply({ embeds: [errorEmbed], components });
            }
        }
    }
};
