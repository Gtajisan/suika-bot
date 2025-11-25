const axios = require('axios');
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');
const fs = require('fs-extra');
const path = require('path');

const API_BASE = 'https://tikwm.com/api';
const TIKWM_CDN = 'https://tikwm.com';

module.exports = {
    config: {
        name: "tiktok",
        aliases: ["tt", "tiktokdl", "ttdl"],
        version: "2.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Download TikTok videos, get trending content, user posts, search videos, and stories",
            ne: "TikTok भिडियो डाउनलोड, ट्रेन्डिङ, प्रयोगकर्ता पोस्ट, खोज र कथाहरू"
        },
        category: "downloader",
        guide: {
            en: "{prefix}tiktok <url> - Download video from URL\n"
                + "{prefix}tiktok trending [region] - Get trending videos (default: NP)\n"
                + "{prefix}tiktok user <username> - Get user's posts\n"
                + "{prefix}tiktok search <query> - Search videos\n"
                + "{prefix}tiktok story <username> - Download user stories\n\n"
                + "Examples:\n"
                + "• {prefix}tiktok https://tiktok.com/@user/video/123\n"
                + "• {prefix}tiktok trending US\n"
                + "• {prefix}tiktok user @charlidamelio\n"
                + "• {prefix}tiktok search dance\n"
                + "• {prefix}tiktok story @user\n\n"
                + "**Auto-Download:** Enable with `/autodl on` to auto-download TikTok links in chat!",
            ne: "{prefix}tiktok <url> - URL बाट भिडियो डाउनलोड गर्नुहोस्\n"
                + "{prefix}tiktok trending [क्षेत्र] - ट्रेन्डिङ भिडियोहरू प्राप्त गर्नुहोस्\n"
                + "{prefix}tiktok user <प्रयोगकर्तानाम> - प्रयोगकर्ताको पोस्टहरू\n"
                + "{prefix}tiktok search <खोजी> - भिडियो खोज्नुहोस्\n"
                + "{prefix}tiktok story <प्रयोगकर्तानाम> - प्रयोगकर्ता कथाहरू"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Choose what to do",
                type: 3,
                required: true,
                choices: [
                    { name: "📥 Download from URL", value: "download" },
                    { name: "🔥 Trending Videos", value: "trending" },
                    { name: "👤 User Posts", value: "user" },
                    { name: "🔍 Search Videos", value: "search" },
                    { name: "📖 User Stories", value: "story" }
                ]
            },
            {
                name: "input",
                description: "URL, username, search query, or region code",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noInput: "❌ Please provide the required input!\n\n**Usage:**\n• Download: Provide TikTok URL\n• Trending: Provide region code (e.g., US, NP, IN) or leave empty for NP\n• User Posts: Provide username (with or without @)\n• Search: Provide search keywords\n• Story: Provide username",
            invalidUrl: "❌ Invalid TikTok URL! Please provide a valid TikTok video URL.",
            loading: "⏳ Fetching data from TikTok, please wait...",
            noDataFound: "❌ No data found for your request.",
            selectVideo: "🎬 **Select a video to download:**\n\nUse the dropdown menu below to choose a video.",
            selectQuality: "📹 **Select video quality:**\n\nChoose your preferred quality from the options below.",
            downloading: "⏳ Downloading video, please wait...",
            success: "✅ Video downloaded successfully!",
            fileTooLarge: "❌ File too large to send (Discord limit 25MB).\nUse the download button below instead.",
            apiError: "❌ API Error: %1",
            timeout: "⏰ Selection timeout! Command cancelled.",
            invalidChoice: "❌ This is not your selection!",
            trendingTitle: "🔥 Trending TikTok Videos - %1",
            userPostsTitle: "👤 %1's TikTok Posts",
            searchResultsTitle: "🔍 Search Results: %1",
            userStoriesTitle: "📖 %1's Stories",
            pageInfo: "Page %1 | %2 videos",
            videoStats: "👁️ %1 | ❤️ %2 | 💬 %3 | 🔗 %4",
            author: "Author",
            duration: "Duration",
            quality: "Quality",
            noMorePages: "ℹ️ No more pages available.",
            invalidRegion: "ℹ️ Invalid region code. Using default: NP"
        },
        ne: {
            noInput: "❌ कृपया आवश्यक इनपुट प्रदान गर्नुहोस्!",
            invalidUrl: "❌ अवैध TikTok URL! कृपया मान्य TikTok भिडियो URL प्रदान गर्नुहोस्।",
            loading: "⏳ TikTok बाट डेटा लिँदै, कृपया पर्खनुहोस्...",
            noDataFound: "❌ तपाईंको अनुरोधको लागि कुनै डेटा फेला परेन।",
            selectVideo: "🎬 **डाउनलोड गर्न भिडियो चयन गर्नुहोस्:**\n\nतलको ड्रपडाउन मेनुबाट भिडियो छान्नुहोस्।",
            selectQuality: "📹 **भिडियो गुणस्तर चयन गर्नुहोस्:**",
            downloading: "⏳ भिडियो डाउनलोड गर्दै, कृपया पर्खनुहोस्...",
            success: "✅ भिडियो सफलतापूर्वक डाउनलोड भयो!",
            fileTooLarge: "❌ फाइल पठाउन धेरै ठूलो छ (Discord को लागि अधिकतम 25MB)।",
            apiError: "❌ API त्रुटि: %1",
            timeout: "⏰ समय सकियो! आदेश रद्द गरियो।",
            invalidChoice: "❌ यो तपाईंको छनोट होइन!",
            trendingTitle: "🔥 ट्रेन्डिङ TikTok भिडियोहरू - %1",
            userPostsTitle: "👤 %1 को TikTok पोस्टहरू",
            searchResultsTitle: "🔍 खोजी परिणामहरू: %1",
            userStoriesTitle: "📖 %1 को कथाहरू",
            pageInfo: "पृष्ठ %1 | %2 भिडियोहरू",
            videoStats: "👁️ %1 | ❤️ %2 | 💬 %3 | 🔗 %4",
            author: "लेखक",
            duration: "अवधि",
            quality: "गुणस्तर"
        }
    },

    onChat: async function ({ message, guildData, getLang }) {
        // Check if auto download is enabled
        if (!guildData?.settings?.autoDownload) return;

        // Check for TikTok URLs in the message
        const tiktokUrlRegex = /(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/[^\s]+/gi;
        const matches = message.content.match(tiktokUrlRegex);
        
        if (!matches || matches.length === 0) return;

        // Process the first URL found
        const url = matches[0];
        await this.downloadFromUrl({ message, url, getLang, user: message.author, isSlash: false });
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        let action, input;

        if (isSlash) {
            action = interaction.options.getString('action');
            input = interaction.options.getString('input') || '';
        } else {
            // Parse prefix command
            if (args.length === 0) {
                const msg = getLang("noInput");
                return message.reply(msg);
            }

            const firstArg = args[0].toLowerCase();
            
            // Check if first argument is a URL (download action)
            if (firstArg.includes('tiktok.com') || firstArg.includes('vm.tiktok.com')) {
                action = 'download';
                input = args.join(' ');
            } else if (['trending', 'trend', 'hot'].includes(firstArg)) {
                action = 'trending';
                input = args[1] || 'NP';
            } else if (['user', 'profile', 'posts'].includes(firstArg)) {
                action = 'user';
                input = args.slice(1).join(' ');
            } else if (['search', 'find'].includes(firstArg)) {
                action = 'search';
                input = args.slice(1).join(' ');
            } else if (['story', 'stories'].includes(firstArg)) {
                action = 'story';
                input = args.slice(1).join(' ');
            } else {
                // Default to download if it looks like a URL, otherwise search
                if (args.join(' ').includes('tiktok.com')) {
                    action = 'download';
                    input = args.join(' ');
                } else {
                    const msg = getLang("noInput");
                    return message.reply(msg);
                }
            }
        }

        // Route to appropriate handler
        switch (action) {
            case 'download':
                await this.downloadFromUrl({ message, interaction, url: input, getLang, user, isSlash });
                break;
            case 'trending':
                await this.getTrending({ message, interaction, region: input || 'NP', getLang, user, isSlash });
                break;
            case 'user':
                await this.getUserPosts({ message, interaction, username: input, getLang, user, isSlash });
                break;
            case 'search':
                await this.searchVideos({ message, interaction, query: input, getLang, user, isSlash });
                break;
            case 'story':
                await this.getUserStories({ message, interaction, username: input, getLang, user, isSlash });
                break;
        }
    },

    // Download video from URL
    downloadFromUrl: async function ({ message, interaction, url, getLang, user, isSlash }) {
        try {
            if (!url || !url.includes('tiktok.com')) {
                const msg = getLang("invalidUrl");
                return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
            }

            const loadingEmbed = new EmbedBuilder()
                .setColor(0x00F2EA)
                .setTitle("📥 TikTok Downloader")
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

            // Fetch video data
            const data = `url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`;
            const response = await makeApiRequest(API_BASE, data);

            if (!response.data || response.code !== 0) {
                return sendError(sentMessage, getLang("noDataFound"), getLang);
            }

            const videoData = response.data;
            await showQualitySelection(videoData, sentMessage, getLang, user);

        } catch (error) {
            console.error("TikTok Download Error:", error);
            handleError(error, message, interaction, getLang, user, isSlash);
        }
    },

    // Get trending videos
    getTrending: async function ({ message, interaction, region, getLang, user, isSlash, cursor = 0 }) {
        try {
            const loadingEmbed = new EmbedBuilder()
                .setColor(0xFF0050)
                .setTitle("🔥 Loading Trending Videos...")
                .setDescription(getLang("loading"))
                .setFooter({ text: `Region: ${region.toUpperCase()}` })
                .setTimestamp();

            let sentMessage;
            if (isSlash) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [loadingEmbed] });
                    sentMessage = await interaction.fetchReply();
                } else {
                    await interaction.editReply({ embeds: [loadingEmbed] });
                    sentMessage = await interaction.fetchReply();
                }
                sentMessage.isSlash = true;
                sentMessage.interaction = interaction;
            } else {
                if (message.id) {
                    sentMessage = await message.reply({ embeds: [loadingEmbed] });
                } else {
                    sentMessage = message;
                    await sentMessage.edit({ embeds: [loadingEmbed] });
                }
                sentMessage.isSlash = false;
            }

            const data = `region=${region.toUpperCase()}&count=10&cursor=${cursor}&web=1&hd=1`;
            const response = await makeApiRequest(`${API_BASE}/feed/list`, data);

            if (!response.data || response.data.length === 0) {
                return sendError(sentMessage, getLang("noDataFound"), getLang);
            }

            await showVideoList(response.data, sentMessage, getLang, user, {
                title: getLang("trendingTitle", region.toUpperCase()),
                type: 'trending',
                region,
                cursor: response.cursor,
                hasMore: response.hasMore
            });

        } catch (error) {
            console.error("TikTok Trending Error:", error);
            handleError(error, message, interaction, getLang, user, isSlash);
        }
    },

    // Get user posts
    getUserPosts: async function ({ message, interaction, username, getLang, user, isSlash, cursor = 0 }) {
        try {
            if (!username) {
                const msg = getLang("noInput");
                return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
            }

            // Clean username
            username = username.replace('@', '').trim();

            const loadingEmbed = new EmbedBuilder()
                .setColor(0x00F2EA)
                .setTitle("👤 Loading User Posts...")
                .setDescription(getLang("loading"))
                .setFooter({ text: `@${username}` })
                .setTimestamp();

            let sentMessage;
            if (isSlash) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [loadingEmbed] });
                    sentMessage = await interaction.fetchReply();
                } else {
                    await interaction.editReply({ embeds: [loadingEmbed] });
                    sentMessage = await interaction.fetchReply();
                }
                sentMessage.isSlash = true;
                sentMessage.interaction = interaction;
            } else {
                if (message.id) {
                    sentMessage = await message.reply({ embeds: [loadingEmbed] });
                } else {
                    sentMessage = message;
                    await sentMessage.edit({ embeds: [loadingEmbed] });
                }
                sentMessage.isSlash = false;
            }

            const data = `unique_id=${encodeURIComponent(username)}&count=10&cursor=${cursor}&web=1&hd=1`;
            const response = await makeApiRequest(`${API_BASE}/user/posts`, data);

            if (!response.data?.videos || response.data.videos.length === 0) {
                return sendError(sentMessage, getLang("noDataFound"), getLang);
            }

            await showVideoList(response.data.videos, sentMessage, getLang, user, {
                title: getLang("userPostsTitle", `@${username}`),
                type: 'user',
                username,
                cursor: response.cursor,
                hasMore: response.hasMore
            });

        } catch (error) {
            console.error("TikTok User Posts Error:", error);
            handleError(error, message, interaction, getLang, user, isSlash);
        }
    },

    // Search videos
    searchVideos: async function ({ message, interaction, query, getLang, user, isSlash, cursor = 0 }) {
        try {
            if (!query) {
                const msg = getLang("noInput");
                return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
            }

            const loadingEmbed = new EmbedBuilder()
                .setColor(0x69C9D0)
                .setTitle("🔍 Searching TikTok...")
                .setDescription(getLang("loading"))
                .setFooter({ text: `Query: ${query}` })
                .setTimestamp();

            let sentMessage;
            if (isSlash) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [loadingEmbed] });
                    sentMessage = await interaction.fetchReply();
                } else {
                    await interaction.editReply({ embeds: [loadingEmbed] });
                    sentMessage = await interaction.fetchReply();
                }
                sentMessage.isSlash = true;
                sentMessage.interaction = interaction;
            } else {
                if (message.id) {
                    sentMessage = await message.reply({ embeds: [loadingEmbed] });
                } else {
                    sentMessage = message;
                    await sentMessage.edit({ embeds: [loadingEmbed] });
                }
                sentMessage.isSlash = false;
            }

            const data = `keywords=${encodeURIComponent(query)}&count=10&cursor=${cursor}&web=1&hd=1`;
            const response = await makeApiRequest(`${API_BASE}/feed/search`, data);

            if (!response.data?.videos || response.data.videos.length === 0) {
                return sendError(sentMessage, getLang("noDataFound"), getLang);
            }

            await showVideoList(response.data.videos, sentMessage, getLang, user, {
                title: getLang("searchResultsTitle", query),
                type: 'search',
                query,
                cursor: response.cursor,
                hasMore: response.hasMore
            });

        } catch (error) {
            console.error("TikTok Search Error:", error);
            handleError(error, message, interaction, getLang, user, isSlash);
        }
    },

    // Get user stories
    getUserStories: async function ({ message, interaction, username, getLang, user, isSlash, cursor = 0 }) {
        try {
            if (!username) {
                const msg = getLang("noInput");
                return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
            }

            // Clean username
            username = username.replace('@', '').trim();

            const loadingEmbed = new EmbedBuilder()
                .setColor(0xEE1D52)
                .setTitle("📖 Loading Stories...")
                .setDescription(getLang("loading"))
                .setFooter({ text: `@${username}` })
                .setTimestamp();

            let sentMessage;
            if (isSlash) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [loadingEmbed] });
                    sentMessage = await interaction.fetchReply();
                } else {
                    await interaction.editReply({ embeds: [loadingEmbed] });
                    sentMessage = await interaction.fetchReply();
                }
                sentMessage.isSlash = true;
                sentMessage.interaction = interaction;
            } else {
                if (message.id) {
                    sentMessage = await message.reply({ embeds: [loadingEmbed] });
                } else {
                    sentMessage = message;
                    await sentMessage.edit({ embeds: [loadingEmbed] });
                }
                sentMessage.isSlash = false;
            }

            const data = `unique_id=${encodeURIComponent(username)}&count=10&cursor=${cursor}&web=1&hd=1`;
            const response = await makeApiRequest(`${API_BASE}/user/story`, data);

            if (!response.data?.videos || response.data.videos.length === 0) {
                return sendError(sentMessage, getLang("noDataFound"), getLang);
            }

            await showVideoList(response.data.videos, sentMessage, getLang, user, {
                title: getLang("userStoriesTitle", `@${username}`),
                type: 'story',
                username,
                cursor: response.cursor,
                hasMore: response.hasMore
            });

        } catch (error) {
            console.error("TikTok Stories Error:", error);
            handleError(error, message, interaction, getLang, user, isSlash);
        }
    }
};

// Helper Functions

async function makeApiRequest(url, data) {
    // Build URL with query parameters
    const fullUrl = `${url}?${data}`;
    
    const config = {
        method: 'get',
        url: fullUrl,
        headers: { 
            'accept': 'application/json, text/javascript, */*; q=0.01', 
            'accept-language': 'en-US,en;q=0.9',
            'origin': 'https://tikwm.com', 
            'referer': 'https://tikwm.com/', 
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
        }
    };

    const response = await axios.request(config);
    return response.data;
}

async function showQualitySelection(videoData, sentMessage, getLang, user) {
    const qualities = [];
    
    // HD quality
    if (videoData.hdplay) {
        qualities.push({
            label: '⭐ HD Quality (No Watermark)',
            value: 'hd',
            url: TIKWM_CDN + videoData.hdplay,
            size: videoData.hd_size,
            type: 'video'
        });
    }
    
    // Normal quality without watermark
    if (videoData.play) {
        qualities.push({
            label: '🎬 Standard Quality (No Watermark)',
            value: 'normal',
            url: TIKWM_CDN + videoData.play,
            size: videoData.size,
            type: 'video'
        });
    }
    
    // With watermark
    if (videoData.wmplay) {
        qualities.push({
            label: '📹 Standard Quality (With Watermark)',
            value: 'watermark',
            url: TIKWM_CDN + videoData.wmplay,
            size: videoData.wm_size,
            type: 'video'
        });
    }

    // Audio only
    if (videoData.music) {
        qualities.push({
            label: '🎵 Audio Only (MP3)',
            value: 'audio',
            url: TIKWM_CDN + videoData.music,
            size: null,
            type: 'audio'
        });
    }

    const options = qualities.map((q, index) => 
        new StringSelectMenuOptionBuilder()
            .setLabel(q.label)
            .setDescription(q.size ? `Size: ${formatFileSize(q.size)}` : q.type === 'audio' ? 'Extract audio from video' : 'Unknown size')
            .setValue(`${index}`)
            .setEmoji(q.label.split(' ')[0])
    );

    const menuId = `tiktok_quality_${Date.now()}_${user.id}`;
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(menuId)
        .setPlaceholder('Choose video quality')
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
        .setTitle("🎬 " + (videoData.title || "TikTok Video"))
        .setDescription(getLang("selectQuality") + "\n\n" + formatVideoStats(videoData, getLang))
        .setThumbnail(videoData.cover ? TIKWM_CDN + videoData.cover : null)
        .setColor(0x00F2EA)
        .addFields([
            { name: '👤 ' + getLang("author"), value: videoData.author?.nickname || 'Unknown', inline: true },
            { name: '⏱️ ' + getLang("duration"), value: `${videoData.duration}s`, inline: true },
            { name: '🎵 Music', value: videoData.music_info?.title?.substring(0, 100) || 'Unknown', inline: false }
        ])
        .setFooter({ text: `${user.username} | Timeout: 60s` })
        .setTimestamp();

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await sentMessage.edit({ embeds: [embed], components: [row] });
    }

    // Set up select menu handler
    global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
        if (selectInteraction.user.id !== user.id) {
            return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        const selectedIndex = parseInt(selectInteraction.values[0]);
        const selectedQuality = qualities[selectedIndex];
        
        await selectInteraction.deferUpdate();
        
        // Check if audio or video was selected
        if (selectedQuality.type === 'audio') {
            await downloadAudio(selectedQuality.url, videoData, sentMessage, getLang, user);
        } else {
            await downloadVideo(selectedQuality.url, videoData, sentMessage, getLang, user);
        }
        
        global.RentoBot.onSelectMenu.delete(menuId);
    });

    // Timeout cleanup
    setTimeout(() => {
        if (global.RentoBot.onSelectMenu.has(menuId)) {
            const timeoutEmbed = new EmbedBuilder()
                .setDescription(getLang("timeout"))
                .setColor(0x95A5A6);

            if (sentMessage.isSlash) {
                sentMessage.interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            } else {
                sentMessage.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
            global.RentoBot.onSelectMenu.delete(menuId);
        }
    }, 60000);
}

async function showVideoList(videos, sentMessage, getLang, user, metadata) {
    const options = videos.slice(0, 10).map((video, index) => {
        const title = (video.title || 'Untitled').substring(0, 80);
        const author = video.author?.nickname || video.author?.unique_id || 'Unknown';
        const stats = `👁️ ${formatNumber(video.play_count)} | ❤️ ${formatNumber(video.digg_count)}`;
        
        return new StringSelectMenuOptionBuilder()
            .setLabel(title.length > 80 ? title.substring(0, 77) + '...' : title)
            .setDescription(`${author} • ${stats}`.substring(0, 100))
            .setValue(`${index}`)
            .setEmoji('🎬');
    });

    const menuId = `tiktok_video_${Date.now()}_${user.id}`;
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(menuId)
        .setPlaceholder('Choose a video to download')
        .addOptions(options);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    // Pagination buttons
    const buttons = [];
    if (metadata.cursor && metadata.cursor > 0) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId(`tiktok_prev_${Date.now()}_${user.id}`)
                .setLabel('◀️ Previous')
                .setStyle(ButtonStyle.Primary)
        );
    }
    if (metadata.hasMore) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId(`tiktok_next_${Date.now()}_${user.id}`)
                .setLabel('Next ▶️')
                .setStyle(ButtonStyle.Primary)
        );
    }

    const components = [selectRow];
    if (buttons.length > 0) {
        const buttonRow = new ActionRowBuilder().addComponents(buttons);
        components.push(buttonRow);
    }

    const videoList = videos.slice(0, 10).map((v, i) => {
        const title = (v.title || 'Untitled').substring(0, 60);
        const author = v.author?.nickname || v.author?.unique_id || 'Unknown';
        const stats = getLang("videoStats", 
            formatNumber(v.play_count), 
            formatNumber(v.digg_count),
            formatNumber(v.comment_count),
            formatNumber(v.share_count)
        );
        return `**${i + 1}.** ${title}\n   👤 ${author}\n   ${stats}`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
        .setTitle(metadata.title)
        .setDescription(getLang("selectVideo") + "\n\n" + videoList)
        .setColor(0xFF0050)
        .setFooter({ text: getLang("pageInfo", '1', videos.length) + ` | ${user.username} | Timeout: 60s` })
        .setTimestamp();

    if (videos[0]?.cover || videos[0]?.author?.avatar) {
        const thumbnail = videos[0].cover ? TIKWM_CDN + videos[0].cover : TIKWM_CDN + videos[0].author.avatar;
        embed.setThumbnail(thumbnail);
    }

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [embed], components });
    } else {
        await sentMessage.edit({ embeds: [embed], components });
    }

    // Handle video selection
    global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
        if (selectInteraction.user.id !== user.id) {
            return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        const selectedIndex = parseInt(selectInteraction.values[0]);
        const selectedVideo = videos[selectedIndex];
        
        await selectInteraction.deferUpdate();
        global.RentoBot.onSelectMenu.delete(menuId);
        
        // Show quality selection for selected video
        await showQualitySelection(selectedVideo, sentMessage, getLang, user);
    });

    // Handle pagination buttons
    if (buttons.length > 0) {
        const filter = i => i.user.id === user.id && i.customId.startsWith('tiktok_');
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId.includes('_next_')) {
                await i.deferUpdate();
                // Load next page
                const parentModule = module.exports;
                if (metadata.type === 'trending') {
                    await parentModule.getTrending({ 
                        message: sentMessage, 
                        interaction: i, 
                        region: metadata.region, 
                        getLang, 
                        user, 
                        isSlash: true, 
                        cursor: metadata.cursor 
                    });
                } else if (metadata.type === 'user') {
                    await parentModule.getUserPosts({ 
                        message: sentMessage, 
                        interaction: i, 
                        username: metadata.username, 
                        getLang, 
                        user, 
                        isSlash: true, 
                        cursor: metadata.cursor 
                    });
                } else if (metadata.type === 'search') {
                    await parentModule.searchVideos({ 
                        message: sentMessage, 
                        interaction: i, 
                        query: metadata.query, 
                        getLang, 
                        user, 
                        isSlash: true, 
                        cursor: metadata.cursor 
                    });
                } else if (metadata.type === 'story') {
                    await parentModule.getUserStories({ 
                        message: sentMessage, 
                        interaction: i, 
                        username: metadata.username, 
                        getLang, 
                        user, 
                        isSlash: true, 
                        cursor: metadata.cursor 
                    });
                }
            }
        });
    }

    // Timeout cleanup
    setTimeout(() => {
        if (global.RentoBot.onSelectMenu.has(menuId)) {
            global.RentoBot.onSelectMenu.delete(menuId);
        }
    }, 60000);
}

async function downloadVideo(videoUrl, videoData, sentMessage, getLang, user) {
    try {
        const downloadingEmbed = new EmbedBuilder()
            .setColor(0x00F2EA)
            .setDescription(getLang("downloading"))
            .setFooter({ text: `Requested by ${user.username}` });

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [downloadingEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [downloadingEmbed], components: [] });
        }

        const videoResponse = await axios({
            method: "get",
            url: videoUrl,
            responseType: "arraybuffer",
            maxBodyLength: Infinity
        });

        // Check file size (25MB Discord limit)
        if (videoResponse.data.length > 25 * 1024 * 1024) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle("❌ File Too Large")
                .setDescription(getLang("fileTooLarge"));
            
            const button = new ButtonBuilder()
                .setLabel('Download Directly')
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

        // Save and send video
        const tmpDir = path.join(__dirname, "tmp");
        await fs.ensureDir(tmpDir);
        const videoPath = path.join(tmpDir, `tiktok_${Date.now()}.mp4`);
        await fs.writeFile(videoPath, videoResponse.data);

        const attachment = { attachment: videoPath, name: "tiktok_video.mp4" };

        const successEmbed = new EmbedBuilder()
            .setColor(0x00F2EA)
            .setTitle("✅ TikTok Video Downloaded")
            .setDescription(`**Title:** ${(videoData.title || 'TikTok Video').substring(0, 200)}\n\n${formatVideoStats(videoData, getLang)}`)
            .setThumbnail(videoData.cover ? TIKWM_CDN + videoData.cover : null)
            .addFields([
                { name: '👤 Author', value: videoData.author?.nickname || 'Unknown', inline: true },
                { name: '⏱️ Duration', value: `${videoData.duration}s`, inline: true },
                { name: '📅 Date', value: new Date(videoData.create_time * 1000).toLocaleDateString(), inline: true }
            ])
            .setFooter({ text: `Requested by ${user.username}` })
            .setTimestamp();

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({
                embeds: [successEmbed],
                files: [attachment],
                components: []
            });
        } else {
            await sentMessage.edit({
                embeds: [successEmbed],
                files: [attachment],
                components: []
            });
        }

        // Cleanup
        setTimeout(() => fs.unlink(videoPath).catch(() => {}), 10000);

    } catch (error) {
        console.error("Download Error:", error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle("❌ Download Failed")
            .setDescription(getLang("apiError", error.message || "Unknown error"));
        
        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [errorEmbed], components: [] });
        }
    }
}

async function downloadAudio(audioUrl, videoData, sentMessage, getLang, user) {
    try {
        const downloadingEmbed = new EmbedBuilder()
            .setColor(0xFF0050)
            .setDescription("🎵 Downloading audio, please wait...")
            .setFooter({ text: `Requested by ${user.username}` });

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [downloadingEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [downloadingEmbed], components: [] });
        }

        const audioResponse = await axios({
            method: "get",
            url: audioUrl,
            responseType: "arraybuffer",
            maxBodyLength: Infinity
        });

        // Check file size (25MB Discord limit)
        if (audioResponse.data.length > 25 * 1024 * 1024) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle("❌ File Too Large")
                .setDescription(getLang("fileTooLarge"));
            
            const button = new ButtonBuilder()
                .setLabel('Download Directly')
                .setURL(audioUrl)
                .setStyle(ButtonStyle.Link)
                .setEmoji('⬇️');
            
            const row = new ActionRowBuilder().addComponents(button);
            
            if (sentMessage.isSlash) {
                return sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [row] });
            } else {
                return sentMessage.edit({ embeds: [errorEmbed], components: [row] });
            }
        }

        // Save and send audio
        const tmpDir = path.join(__dirname, "tmp");
        await fs.ensureDir(tmpDir);
        const audioPath = path.join(tmpDir, `tiktok_audio_${Date.now()}.mp3`);
        await fs.writeFile(audioPath, audioResponse.data);

        const attachment = { attachment: audioPath, name: "tiktok_audio.mp3" };

        const musicTitle = videoData.music_info?.title || 'TikTok Audio';
        const musicArtist = videoData.music_info?.author || 'Unknown Artist';

        const successEmbed = new EmbedBuilder()
            .setColor(0xFF0050)
            .setTitle("🎵 TikTok Audio Downloaded")
            .setDescription(`**Title:** ${(videoData.title || 'TikTok Audio').substring(0, 200)}\n\n**Music:** ${musicTitle}\n**Artist:** ${musicArtist}`)
            .setThumbnail(videoData.cover ? TIKWM_CDN + videoData.cover : null)
            .addFields([
                { name: '👤 Video Author', value: videoData.author?.nickname || 'Unknown', inline: true },
                { name: '⏱️ Duration', value: `${videoData.duration || videoData.music_info?.duration || 0}s`, inline: true },
                { name: '🎼 Type', value: videoData.music_info?.original ? 'Original Sound' : 'Music Track', inline: true }
            ])
            .setFooter({ text: `Requested by ${user.username}` })
            .setTimestamp();

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({
                embeds: [successEmbed],
                files: [attachment],
                components: []
            });
        } else {
            await sentMessage.edit({
                embeds: [successEmbed],
                files: [attachment],
                components: []
            });
        }

        // Cleanup
        setTimeout(() => fs.unlink(audioPath).catch(() => {}), 10000);

    } catch (error) {
        console.error("Audio Download Error:", error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle("❌ Audio Download Failed")
            .setDescription(getLang("apiError", error.message || "Unknown error"));
        
        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [errorEmbed], components: [] });
        }
    }
}

function formatVideoStats(video, getLang) {
    return getLang("videoStats",
        formatNumber(video.play_count),
        formatNumber(video.digg_count),
        formatNumber(video.comment_count),
        formatNumber(video.share_count)
    );
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

function sendError(sentMessage, errorMsg, getLang) {
    const errorEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setDescription(errorMsg);
    
    if (sentMessage.isSlash) {
        return sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
    } else {
        return sentMessage.edit({ embeds: [errorEmbed], components: [] });
    }
}

function handleError(error, message, interaction, getLang, user, isSlash) {
    let errMsg = getLang("apiError", error.message || "Unknown error");
    
    const errorEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle("❌ TikTok Error")
        .setDescription(errMsg)
        .setFooter({ text: `Requested by ${user.username}` });

    if (isSlash) {
        if (interaction.replied || interaction.deferred) {
            interaction.editReply({ embeds: [errorEmbed] }).catch(() => {});
        } else {
            interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
    } else {
        message.reply({ embeds: [errorEmbed] }).catch(() => {});
    }
}
