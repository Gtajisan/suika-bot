const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    config: {
        name: "ytb",
        aliases: ["youtube", "yt"],
        version: "3.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Advanced YouTube downloader with rich metadata, channel info, and quality selection",
            ne: "उन्नत YouTube डाउनलोडर विस्तृत मेटाडेटा, च्यानल जानकारी र गुणस्तर चयन सहित"
        },
        category: "downloader",
        guide: {
            en: "{prefix}ytb [a/audio|v/video] [url|query]\n\nExamples:\n• {prefix}ytb a fallen kingdom\n• {prefix}ytb v phonk music\n• {prefix}ytb https://youtu.be/xxx\n• {prefix}ytb fallen kingdom (defaults to audio)",
            ne: "{prefix}ytb [a/audio|v/video] [url|query]\n\nउदाहरणहरू:\n• {prefix}ytb a fallen kingdom\n• {prefix}ytb v phonk music\n• {prefix}ytb https://youtu.be/xxx\n• {prefix}ytb fallen kingdom (defaults to audio)"
        },
        slash: true,
        options: [
            {
                name: "type",
                description: "Audio or Video",
                type: 3,
                required: true,
                choices: [
                    { name: "Audio 🎵", value: "audio" },
                    { name: "Video 🎬", value: "video" }
                ]
            },
            {
                name: "query",
                description: "YouTube URL or search query",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noQuery: "❌ Please provide a YouTube URL or search query!",
            loading: "🔍 Searching YouTube...",
            noResults: "❌ No videos found for your query.",
            selectVideo: "🎬 **Found videos! Select one from the dropdown:**",
            selectQuality: "📹 **Select video quality:**",
            processing: "⏳ Processing your request...",
            downloadSuccess: "✅ **Ready to download!**",
            downloadFailed: "❌ Download failed: %1",
            timeout: "⏰ Selection timeout! Command cancelled.",
            invalidChoice: "❌ This is not your selection!",
            fetchingInfo: "⏳ Fetching detailed video information..."
        },
        ne: {
            noQuery: "❌ कृपया YouTube URL वा खोजी प्रदान गर्नुहोस्!",
            loading: "🔍 YouTube मा खोज्दै...",
            noResults: "❌ कुनै भिडियो फेला परेन।",
            selectVideo: "🎬 **भिडियोहरू फेला पर्यो! ड्रपडाउनबाट चयन गर्नुहोस्:**",
            selectQuality: "📹 **भिडियो गुणस्तर चयन गर्नुहोस्:**",
            processing: "⏳ तपाईंको अनुरोध प्रक्रिया गर्दै...",
            downloadSuccess: "✅ **डाउनलोड गर्न तयार!**",
            downloadFailed: "❌ डाउनलोड असफल भयो: %1",
            timeout: "⏰ चयन समय समाप्त! आदेश रद्द गरियो।",
            invalidChoice: "❌ यो तपाईंको छनोट होइन!",
            fetchingInfo: "⏳ विस्तृत भिडियो जानकारी लिँदै..."
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        let type = 'audio';
        let query = '';
        
        if (isSlash) {
            type = interaction.options.getString('type');
            query = interaction.options.getString('query');
        } else {
            if (args.length < 1) {
                return message.reply(getLang("noQuery"));
            }
            
            const firstArg = args[0].toLowerCase();
            if (['a', 'audio'].includes(firstArg)) {
                type = 'audio';
                query = args.slice(1).join(' ');
            } else if (['v', 'video'].includes(firstArg)) {
                type = 'video';
                query = args.slice(1).join(' ');
            } else {
                query = args.join(' ');
            }
        }

        if (!query) {
            const msg = getLang("noQuery");
            return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
        }

        await this.processDownload({ message, interaction, type, query, getLang, user, isSlash });
    },

    processDownload: async function ({ message, interaction, type, query, getLang, user, isSlash }) {
        try {
            const loadingEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setAuthor({ 
                    name: `YouTube ${type === 'audio' ? 'Audio' : 'Video'} Downloader`,
                    iconURL: 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png'
                })
                .setDescription(`${isYouTubeUrl(query) ? '⏳' : '🔍'} ${isYouTubeUrl(query) ? getLang("fetchingInfo") : getLang("loading")}`)
                .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            let sentMessage;
            if (isSlash) {
                await interaction.reply({ embeds: [loadingEmbed] });
                sentMessage = { interaction, isSlash: true };
            } else {
                sentMessage = await message.reply({ embeds: [loadingEmbed] });
                sentMessage.isSlash = false;
            }

            let videoUrl, selectedVideo;

            if (isYouTubeUrl(query)) {
                videoUrl = normalizeYouTubeUrl(query);
                const videoId = extractVideoId(videoUrl);
                selectedVideo = await getVideoMetadata(videoId);
            } else {
                const searchResults = await searchYouTube(query);
                
                if (!searchResults || searchResults.length === 0) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor(0xED4245)
                        .setDescription(getLang("noResults"));
                    if (sentMessage.isSlash) {
                        return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
                    } else {
                        return await sentMessage.edit({ embeds: [errorEmbed] });
                    }
                }

                const options = searchResults.slice(0, 10).map((video, index) => 
                    new StringSelectMenuOptionBuilder()
                        .setLabel(video.title.substring(0, 90) + (video.title.length > 90 ? '...' : ''))
                        .setDescription(`${video.channel.name} • ${video.duration} • ${video.views}`.substring(0, 100))
                        .setValue(`${index}`)
                        .setEmoji('🎬')
                );

                const menuId = sentMessage.isSlash ? `ytb_video_select_${Date.now()}_${user.id}` : `ytb_video_select_${sentMessage.id}`;
                
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(menuId)
                    .setPlaceholder('Choose your video')
                    .addOptions(options);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                const videoList = searchResults.slice(0, 10)
                    .map((v, i) => `\`${i + 1}.\` **${v.title}**\n    └ 👤 ${v.channel.name} • ⏱️ ${v.duration} • 👁️ ${v.views}`)
                    .join('\n\n');

                const selectEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setAuthor({ 
                        name: 'YouTube Search Results',
                        iconURL: 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png'
                    })
                    .setDescription(`${getLang("selectVideo")}\n\n${videoList}`)
                    .setFooter({ text: `${user.username} | Timeout: 60s`, iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                if (sentMessage.isSlash) {
                    await sentMessage.interaction.editReply({ embeds: [selectEmbed], components: [row] });
                } else {
                    await sentMessage.edit({ embeds: [selectEmbed], components: [row] });
                }

                const videoSelected = await waitForSelection(menuId, user.id, searchResults, getLang);

                if (!videoSelected) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setDescription(getLang("timeout"))
                        .setColor(0x95A5A6);
                    if (sentMessage.isSlash) {
                        return await sentMessage.interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                    } else {
                        return await sentMessage.edit({ embeds: [timeoutEmbed], components: [] });
                    }
                }

                videoUrl = videoSelected.url;
                selectedVideo = videoSelected;
            }

            if (type === 'audio') {
                await downloadMedia(videoUrl, 'audio', 'm4a', sentMessage, getLang, user, selectedVideo);
            } else {
                await showQualitySelection(videoUrl, sentMessage, getLang, user, selectedVideo);
            }

        } catch (error) {
            console.error("YouTube Error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle("❌ Error Occurred")
                .setDescription(getLang("downloadFailed", error.message || "Unknown error"))
                .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() });

            const target = isSlash ? interaction : message;
            if (isSlash && (interaction.replied || interaction.deferred)) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await target.reply({ embeds: [errorEmbed] });
            }
        }
    }
};

async function getVideoMetadata(videoId) {
    try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const { data } = await axios.get(oEmbedUrl);
        
        return {
            id: videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            title: data.title,
            thumbnail: data.thumbnail_url,
            channel: {
                name: data.author_name,
                url: data.author_url
            }
        };
    } catch (error) {
        return {
            id: videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            title: 'YouTube Video',
            channel: { name: 'YouTube', url: 'https://www.youtube.com' }
        };
    }
}

async function searchYouTube(keyWord) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyWord)}`;
    const res = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        },
    });

    const match = res.data.match(/ytInitialData"\]\s*=\s*(\{.*?\});/s) ||
                  res.data.match(/var ytInitialData\s*=\s*(\{.*?\});/s);

    if (!match) throw new Error("ytInitialData not found");

    const json = JSON.parse(match[1]);
    const contents = json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    const videos = [];
    for (const section of contents) {
        const items = section.itemSectionRenderer?.contents || [];
        for (const item of items) {
            const v = item.videoRenderer;
            if (!v || !v.lengthText?.simpleText) continue;

            videos.push({
                id: v.videoId,
                url: `https://www.youtube.com/watch?v=${v.videoId}`,
                title: v.title?.runs?.[0]?.text,
                thumbnail: v.thumbnail?.thumbnails?.pop()?.url,
                duration: v.lengthText?.simpleText,
                views: v.viewCountText?.simpleText || "N/A",
                published: v.publishedTimeText?.simpleText || "N/A",
                channel: {
                    name: v.ownerText?.runs?.[0]?.text,
                    url: `https://www.youtube.com${v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || ""}`,
                    avatar: v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url
                }
            });
        }
    }

    return videos;
}

async function waitForSelection(menuId, userId, results, getLang) {
    return new Promise((resolve) => {
        global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== userId) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const selectedIndex = parseInt(selectInteraction.values[0]);
            await selectInteraction.deferUpdate();
            global.RentoBot.onSelectMenu.delete(menuId);
            resolve(results[selectedIndex]);
        });

        setTimeout(() => {
            if (global.RentoBot.onSelectMenu.has(menuId)) {
                global.RentoBot.onSelectMenu.delete(menuId);
                resolve(null);
            }
        }, 60000);
    });
}

async function showQualitySelection(videoUrl, sentMessage, getLang, user, selectedVideo) {
    const qualities = [
        { label: '4K Ultra HD (2160p)', value: '2160', emoji: '⭐', description: 'Highest quality' },
        { label: 'Full HD (1080p)', value: '1080', emoji: '🎬', description: 'Premium quality' },
        { label: 'HD (720p)', value: '720', emoji: '📹', description: 'High quality' },
        { label: 'Standard (480p)', value: '480', emoji: '🎥', description: 'Standard quality' },
        { label: 'Low (360p)', value: '360', emoji: '📱', description: 'Mobile friendly' }
    ];

    const options = qualities.map(q => 
        new StringSelectMenuOptionBuilder()
            .setLabel(q.label)
            .setDescription(q.description)
            .setValue(q.value)
            .setEmoji(q.emoji)
    );

    const selectMenuId = sentMessage.isSlash ? `ytb_quality_select_${Date.now()}_${user.id}` : `ytb_quality_select_${sentMessage.id}`;
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(selectMenuId)
        .setPlaceholder('Choose video quality')
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const qualityList = qualities.map((q, i) => `\`${i + 1}.\` ${q.emoji} **${q.label}**\n    └ ${q.description}`).join('\n\n');

    const selectEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setAuthor({ 
            name: 'YouTube Video Quality Selection',
            iconURL: 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png'
        })
        .setTitle(selectedVideo?.title || 'YouTube Video')
        .setThumbnail(selectedVideo?.thumbnail)
        .setDescription(`${getLang("selectQuality")}\n\n${qualityList}`)
        .setFooter({ text: `${user.username} | Timeout: 60s`, iconURL: user.displayAvatarURL() })
        .setTimestamp();

    if (selectedVideo?.channel?.name) {
        selectEmbed.addFields({ name: '👤 Channel', value: selectedVideo.channel.name, inline: true });
    }
    if (selectedVideo?.duration) {
        selectEmbed.addFields({ name: '⏱️ Duration', value: selectedVideo.duration, inline: true });
    }

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [selectEmbed], components: [row] });
    } else {
        await sentMessage.edit({ embeds: [selectEmbed], components: [row] });
    }
    
    global.RentoBot.onSelectMenu.set(selectMenuId, async (selectInteraction) => {
        if (selectInteraction.user.id !== user.id) {
            return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        const quality = selectInteraction.values[0];
        await selectInteraction.deferUpdate();
        global.RentoBot.onSelectMenu.delete(selectMenuId);
        
        await downloadMedia(videoUrl, 'video', quality, sentMessage, getLang, user, selectedVideo);
    });

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
}

async function downloadMedia(videoUrl, type, quality, sentMessage, getLang, user, selectedVideo) {
    try {
        const processingEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setAuthor({ 
                name: `Processing ${type === 'audio' ? 'Audio' : 'Video'}`,
                iconURL: 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png'
            })
            .setDescription(`${getLang("processing")}\n\n⏳ Please wait...`)
            .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() });

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [processingEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [processingEmbed], components: [] });
        }

        const apiUrl = type === 'audio' 
            ? `https://meow-dl.onrender.com/yt?url=${encodeURIComponent(videoUrl)}&format=m4a`
            : `https://meow-dl.onrender.com/yt?url=${encodeURIComponent(videoUrl)}&format=mp4&quality=${quality}`;

        const { data } = await axios.get(apiUrl, { timeout: 120000 });

        if (data.status !== 'ok' || !data.downloadLink) {
            throw new Error("Failed to get download link");
        }

        const downloadButton = new ButtonBuilder()
            .setLabel(`📥 Download ${type === 'audio' ? 'Audio' : 'Video'}`)
            .setURL(data.downloadLink)
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder().addComponents(downloadButton);

        const qualityText = type === 'audio' ? (data.quality || 'High Quality M4A') : `${quality}p HD`;
        const videoTitle = data.title || selectedVideo?.title || 'YouTube Video';
        const channelName = data.channel || selectedVideo?.channel?.name || 'YouTube';
        const channelAvatar = selectedVideo?.channel?.avatar;

        const successEmbed = new EmbedBuilder()
            .setColor(type === 'audio' ? 0x1DB954 : 0xFF0000)
            .setAuthor({ 
                name: channelName,
                iconURL: channelAvatar || 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png',
                url: selectedVideo?.channel?.url || 'https://www.youtube.com'
            })
            .setTitle(videoTitle)
            .setURL(videoUrl)
            .setDescription(`${getLang("downloadSuccess")}\n\n${type === 'audio' ? '🎵' : '🎬'} **${qualityText}**`)
            .setThumbnail(data.thumbnail || selectedVideo?.thumbnail)
            .setImage(data.thumbnail || selectedVideo?.thumbnail);

        const fields = [];
        
        if (channelName) {
            fields.push({ name: '📺 Channel', value: channelName, inline: true });
        }
        
        if (qualityText) {
            fields.push({ name: type === 'audio' ? '🎵 Quality' : '📹 Quality', value: qualityText, inline: true });
        }
        
        if (data.fileSize) {
            fields.push({ name: '📦 File Size', value: data.fileSize, inline: true });
        }
        
        if (selectedVideo?.duration) {
            fields.push({ name: '⏰ Duration', value: selectedVideo.duration, inline: true });
        }
        
        if (selectedVideo?.views && selectedVideo.views !== 'N/A') {
            fields.push({ name: '👁️ Views', value: selectedVideo.views, inline: true });
        }
        
        if (selectedVideo?.published && selectedVideo.published !== 'N/A') {
            fields.push({ name: '📅 Published', value: selectedVideo.published, inline: true });
        }
        
        if (data.filename) {
            const format = data.filename.split('.').pop()?.toUpperCase();
            if (format) {
                fields.push({ name: '📄 Format', value: format, inline: true });
            }
        }
        
        if (data.infoFetchTime) {
            fields.push({ name: '⚡ Fetch Time', value: data.infoFetchTime, inline: true });
        }
        
        const expirationTime = data.expiration || '3 minutes';
        fields.push({ name: '⏱️ Link Expiration', value: expirationTime, inline: true });

        successEmbed.addFields(fields);

        const cacheStatus = data.cached ? '💾 Cached Response' : '🆕 Fresh Download';
        successEmbed.setFooter({ 
            text: `Requested by ${user.username} | ${cacheStatus}`, 
            iconURL: user.displayAvatarURL() 
        });
        successEmbed.setTimestamp();

        let channel;
        try {
            if (sentMessage.isSlash) {
                channel = sentMessage.interaction.channel;
                if (!channel && sentMessage.interaction.guild) {
                    channel = await sentMessage.interaction.guild.channels.fetch(sentMessage.interaction.channelId);
                }
            } else {
                channel = sentMessage.channel;
                if (!channel && sentMessage.guild) {
                    channel = await sentMessage.guild.channels.fetch(sentMessage.channelId);
                }
            }
            
            if (channel) {
                await channel.send(`🎬 **[${videoTitle}](${videoUrl})**`);
            }
        } catch (channelError) {
            console.log("Could not send video title message:", channelError.message);
        }

        if (type === 'audio') {
            try {
                const audioResponse = await axios({
                    method: 'get',
                    url: data.downloadLink,
                    responseType: 'arraybuffer',
                    timeout: 60000,
                    maxContentLength: 25 * 1024 * 1024,
                    maxBodyLength: 25 * 1024 * 1024
                });

                if (audioResponse.data.length <= 25 * 1024 * 1024) {
                    const attachment = {
                        attachment: Buffer.from(audioResponse.data),
                        name: data.filename || 'audio.m4a'
                    };

                    if (sentMessage.isSlash) {
                        return await sentMessage.interaction.editReply({
                            embeds: [successEmbed],
                            files: [attachment],
                            components: [row]
                        });
                    } else {
                        return await sentMessage.edit({
                            embeds: [successEmbed],
                            files: [attachment],
                            components: [row]
                        });
                    }
                }
            } catch (audioError) {
                console.log("Audio file too large or download failed, showing link only");
            }
        }

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({
                embeds: [successEmbed],
                components: [row]
            });
        } else {
            await sentMessage.edit({
                embeds: [successEmbed],
                components: [row]
            });
        }

    } catch (error) {
        console.error("Download error:", error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle("❌ Download Failed")
            .setDescription(getLang("downloadFailed", error.message || "Unknown error"))
            .addFields(
                { name: '💡 Tip', value: 'Try again or use a different quality setting.' }
            )
            .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [errorEmbed], components: [] });
        }
    }
}

function isYouTubeUrl(str) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(str);
}

function normalizeYouTubeUrl(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
}

function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
}

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
