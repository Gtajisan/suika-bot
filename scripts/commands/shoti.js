
const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "shoti",
        aliases: ["randomgirl", "tiktokvideo"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Get random TikTok videos of girls",
            ne: "केटीहरूको अनियमित TikTok भिडियोहरू प्राप्त गर्नुहोस्"
        },
        category: "entertainment",
        guide: {
            en: "{prefix}shoti - Get a random TikTok video",
            ne: "{prefix}shoti - अनियमित TikTok भिडियो प्राप्त गर्नुहोस्"
        },
        slash: true
    },

    langs: {
        en: {
            loading: "⏳ Fetching random video...",
            downloading: "⏳ Downloading video...",
            success: "✅ Here's your random video!",
            noVideoFound: "❌ No video found. Please try again.",
            apiError: "❌ API Error: Unable to fetch video at this moment.",
            fileTooLarge: "⚠️ File Too Large",
            fileTooLargeDesc: "Video exceeds 25MB Discord limit.\n\n**Use direct download:**",
            downloadFailed: "❌ Download Failed",
            region: "Region",
            duration: "Duration",
            totalVideos: "Total Videos",
            directDownload: "Direct Download",
            requestedBy: "Requested by",
            seconds: "seconds"
        },
        ne: {
            loading: "⏳ अनियमित भिडियो लिँदै...",
            downloading: "⏳ भिडियो डाउनलोड गर्दै...",
            success: "✅ यहाँ तपाईंको अनियमित भिडियो छ!",
            noVideoFound: "❌ कुनै भिडियो फेला परेन। कृपया फेरि प्रयास गर्नुहोस्।",
            apiError: "❌ API त्रुटि: यस समयमा भिडियो लिन असमर्थ।",
            fileTooLarge: "⚠️ फाइल धेरै ठूलो",
            fileTooLargeDesc: "भिडियो Discord को 25MB सीमा भन्दा बढी छ।\n\n**प्रत्यक्ष डाउनलोड प्रयोग गर्नुहोस्:**",
            downloadFailed: "❌ डाउनलोड असफल भयो",
            region: "क्षेत्र",
            duration: "अवधि",
            totalVideos: "कुल भिडियोहरू",
            directDownload: "प्रत्यक्ष डाउनलोड",
            requestedBy: "द्वारा अनुरोध गरिएको",
            seconds: "सेकेन्ड"
        }
    },

    onStart: async function ({ message, interaction, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        try {
            // Send loading message
            const loadingEmbed = new EmbedBuilder()
                .setColor(0x000000)
                .setDescription(getLang("loading"))
                .setFooter({ text: user.username, iconURL: user.displayAvatarURL() });

            let sentMessage;
            if (isSlash) {
                await interaction.deferReply();
                sentMessage = {
                    interaction,
                    isSlash: true,
                    edit: (data) => interaction.editReply(data)
                };
            } else {
                sentMessage = await message.reply({ embeds: [loadingEmbed] });
            }

            // Fetch video from API
            const apiUrl = 'https://smsbomber-by-kalamansi.vercel.app/api/shoti';
            const { data } = await axios.get(apiUrl, {
                timeout: 30000
            });

            if (!data || !data.link) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xED4245)
                    .setDescription(getLang("noVideoFound"));
                return sentMessage.edit({ embeds: [errorEmbed] });
            }

            // Update to downloading status
            const downloadingEmbed = new EmbedBuilder()
                .setColor(0x000000)
                .setDescription(getLang("downloading"))
                .setFooter({ text: user.username, iconURL: user.displayAvatarURL() });

            await sentMessage.edit({ embeds: [downloadingEmbed] });

            // Download video
            const videoResponse = await axios({
                method: 'get',
                url: data.link,
                responseType: 'arraybuffer',
                timeout: 60000
            });

            const videoBuffer = videoResponse.data;
            const fileSize = videoBuffer.length;

            // Check if file is too large (25MB Discord limit)
            if (fileSize > 25 * 1024 * 1024) {
                const tooLargeEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle(getLang("fileTooLarge"))
                    .setDescription(getLang("fileTooLargeDesc"))
                    .addFields(
                        { name: getLang("region"), value: data.region || 'Unknown', inline: true },
                        { name: getLang("duration"), value: `${data.duration || 'Unknown'} ${getLang("seconds")}`, inline: true }
                    )
                    .setFooter({ text: user.username, iconURL: user.displayAvatarURL() });

                const components = data.link.length <= 512 ? 
                    [new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel(getLang("directDownload"))
                            .setStyle(ButtonStyle.Link)
                            .setURL(data.link)
                            .setEmoji('⬇️')
                    )] : [];

                return sentMessage.edit({ embeds: [tooLargeEmbed], components });
            }

            // Save video temporarily
            const tmpDir = path.join(__dirname, 'tmp');
            await fs.ensureDir(tmpDir);
            const filePath = path.join(tmpDir, `shoti_${Date.now()}.mp4`);
            await fs.writeFile(filePath, videoBuffer);

            // Create success embed
            const successEmbed = new EmbedBuilder()
                .setColor(0x2ECC71)
                .setTitle('🎬 Shoti Video')
                .setDescription(getLang("success"))
                .addFields(
                    { name: '👤 Creator', value: data.nickname || 'Unknown', inline: true },
                    { name: getLang("region"), value: data.region || 'Unknown', inline: true },
                    { name: getLang("duration"), value: `${data.duration || 'Unknown'} ${getLang("seconds")}`, inline: true }
                );

            if (data.title && data.title !== 'No title') {
                successEmbed.addFields({ name: '📝 Title', value: data.title });
            }

            if (data.total_video) {
                successEmbed.addFields({ 
                    name: getLang("totalVideos"), 
                    value: data.total_video.toString(), 
                    inline: true 
                });
            }

            successEmbed.setFooter({ 
                text: `${getLang("requestedBy")} ${user.username}`, 
                iconURL: user.displayAvatarURL() 
            });
            successEmbed.setTimestamp();

            // Create download button
            const components = data.link.length <= 512 ? 
                [new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel(getLang("directDownload"))
                        .setStyle(ButtonStyle.Link)
                        .setURL(data.link)
                        .setEmoji('📥')
                )] : [];

            // Send video
            await sentMessage.edit({
                embeds: [successEmbed],
                components,
                files: [{
                    attachment: filePath,
                    name: 'shoti.mp4'
                }]
            });

            // Clean up temporary file after 8 seconds
            setTimeout(() => {
                fs.unlink(filePath).catch(() => {});
            }, 8000);

        } catch (error) {
            console.error('Shoti Error:', error);

            const isTooBig = error.code === 40005 || error.message?.includes('entity too large');
            const errorEmbed = new EmbedBuilder()
                .setColor(isTooBig ? 0xFFA500 : 0xED4245)
                .setTitle(isTooBig ? getLang("fileTooLarge") : getLang("downloadFailed"))
                .setDescription(isTooBig ? getLang("fileTooLargeDesc") : getLang("apiError"))
                .setFooter({ text: user.username, iconURL: user.displayAvatarURL() });

            if (isSlash) {
                return interaction.deferred ? 
                    interaction.editReply({ embeds: [errorEmbed] }) : 
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            } else {
                return message.reply({ embeds: [errorEmbed] });
            }
        }
    }
};
