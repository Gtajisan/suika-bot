const axios = require('axios');
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

const API_BASE = 'https://samirapihub.vercel.app/anime';

module.exports = {
    config: {
        name: "anime",
        aliases: ["watchanime", "animewatch", "hindi-anime"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and watch anime in Hindi dubbed with comprehensive browsing options",
            ne: "हिन्दी डब एनिमे खोज्नुहोस् र हेर्नुहोस्"
        },
        category: "entertainment",
        guide: {
            en: "{prefix}anime [search query] - Search for anime\n{prefix}anime menu - Show main browsing menu\n{prefix}anime hindi - Browse Hindi dubbed anime\n{prefix}anime popular - Show popular anime\n{prefix}anime franchise <name> - Browse by franchise (naruto, pokemon, dragon-ball, etc.)\n\nExamples:\n• {prefix}anime naruto\n• {prefix}anime hindi\n• {prefix}anime menu\n• {prefix}anime franchise pokemon",
            ne: "{prefix}anime [खोजी] - एनिमे खोज्नुहोस्\n{prefix}anime menu - मुख्य मेनु देखाउनुहोस्\n{prefix}anime hindi - हिन्दी डब एनिमे ब्राउज गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Choose what to do",
                type: 3,
                required: false,
                choices: [
                    { name: "🔍 Search", value: "search" },
                    { name: "📺 Main Menu", value: "menu" },
                    { name: "🇮🇳 Hindi Dubbed", value: "hindi" },
                    { name: "🔥 Popular", value: "popular" },
                    { name: "🆕 New Releases", value: "newest" },
                    { name: "🏢 Browse by Network", value: "network" },
                    { name: "🎭 Browse by Genre", value: "genre" },
                    { name: "📚 Browse by Franchise", value: "franchise" }
                ]
            },
            {
                name: "query",
                description: "Search query, franchise name, genre, or network",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noQuery: "❌ Please provide an anime name or use `/anime menu` for browsing options!",
            searching: "🔍 Searching for anime...",
            loading: "⏳ Loading anime data...",
            noResults: "❌ No anime found for: **%1**",
            error: "❌ An error occurred: %1",
            selectAnime: "🎬 **Found %1 anime!**\n\nSelect from the dropdown below:",
            timeout: "⏰ Time's up! Command cancelled.",
            invalidChoice: "❌ This is not your selection!",
            loadingDetails: "⏳ Loading anime details...",
            selectEpisode: "📺 **Select an episode to watch:**",
            selectSeason: "📺 **Select a season:**",
            watchNow: "▶️ Watch Now",
            mainMenu: "🎬 **Anime Hub - Choose your adventure:**",
            featured: "🌟 **Featured Anime**",
            genres: "Genres",
            year: "Year",
            network: "Network",
            language: "Language",
            duration: "Duration",
            recentEpisode: "Recent Episode",
            seasons: "Seasons",
            episodes: "Episodes",
            recommendations: "Recommendations"
        },
        ne: {
            noQuery: "❌ कृपया एनिमे नाम प्रदान गर्नुहोस् वा `/anime menu` ब्राउजिङ विकल्पहरूको लागि प्रयोग गर्नुहोस्!",
            searching: "🔍 एनिमे खोज्दै...",
            loading: "⏳ एनिमे डाटा लोड गर्दै...",
            noResults: "❌ कुनै एनिमे फेला परेन: **%1**",
            error: "❌ त्रुटि देखा पर्यो: %1",
            selectAnime: "🎬 **%1 एनिमे फेला पर्यो!**\n\nतलको ड्रपडाउनबाट चयन गर्नुहोस्:",
            timeout: "⏰ समय सकियो! आदेश रद्द गरियो।",
            invalidChoice: "❌ यो तपाईंको छनोट होइन!",
            loadingDetails: "⏳ एनिमे विवरण लोड गर्दै...",
            selectEpisode: "📺 **हेर्नको लागि एपिसोड चयन गर्नुहोस्:**",
            selectSeason: "📺 **सिजन चयन गर्नुहोस्:**",
            watchNow: "▶️ अहिले हेर्नुहोस्",
            mainMenu: "🎬 **एनिमे हब - आफ्नो साहसिक कार्य छान्नुहोस्:**",
            featured: "🌟 **विशेष एनिमे**"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        let action = '';
        let query = '';

        if (isSlash) {
            action = interaction.options.getString('action') || 'search';
            query = interaction.options.getString('query') || '';
        } else {
            if (args.length === 0) {
                action = 'menu';
            } else {
                const firstArg = args[0].toLowerCase();
                if (['menu', 'browse', 'home'].includes(firstArg)) {
                    action = 'menu';
                } else if (['hindi', 'hin', 'हिन्दी'].includes(firstArg)) {
                    action = 'hindi';
                } else if (['popular', 'trending', 'hot'].includes(firstArg)) {
                    action = 'popular';
                } else if (['new', 'newest', 'latest', 'recent'].includes(firstArg)) {
                    action = 'newest';
                } else if (['network', 'net'].includes(firstArg)) {
                    action = 'network';
                    query = args.slice(1).join(' ');
                } else if (['genre', 'category'].includes(firstArg)) {
                    action = 'genre';
                    query = args.slice(1).join(' ');
                } else if (['franchise', 'series', 'collection'].includes(firstArg)) {
                    action = 'franchise';
                    query = args.slice(1).join(' ');
                } else {
                    action = 'search';
                    query = args.join(' ');
                }
            }
        }

        try {
            if (action === 'menu') {
                return await this.showMainMenu({ message, interaction, getLang, user, isSlash });
            } else if (action === 'hindi') {
                return await this.browseLanguage({ message, interaction, getLang, user, isSlash, language: 'hindi' });
            } else if (action === 'popular') {
                return await this.showFeatured({ message, interaction, getLang, user, isSlash, type: 'mostWatchedSeries' });
            } else if (action === 'newest') {
                return await this.showFeatured({ message, interaction, getLang, user, isSlash, type: 'newestDrop' });
            } else if (action === 'network') {
                if (!query) {
                    return await this.showNetworkMenu({ message, interaction, getLang, user, isSlash });
                }
                return await this.browseNetwork({ message, interaction, getLang, user, isSlash, network: query });
            } else if (action === 'genre') {
                if (!query) {
                    return await this.showGenreMenu({ message, interaction, getLang, user, isSlash });
                }
                return await this.browseGenre({ message, interaction, getLang, user, isSlash, genre: query });
            } else if (action === 'franchise') {
                if (!query) {
                    return await this.showFranchiseMenu({ message, interaction, getLang, user, isSlash });
                }
                return await this.browseFranchise({ message, interaction, getLang, user, isSlash, franchise: query });
            } else {
                if (!query) {
                    const msg = getLang("noQuery");
                    return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
                }
                return await this.searchAnime({ message, interaction, query, getLang, user, isSlash });
            }
        } catch (error) {
            console.error('Anime command error:', error);
            const errorMsg = getLang("error", error.message || "Unknown error");
            const errorEmbed = new EmbedBuilder()
                .setDescription(errorMsg)
                .setColor(0xED4245);

            if (isSlash) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            } else {
                await message.reply({ embeds: [errorEmbed] });
            }
        }
    },

    showMainMenu: async function ({ message, interaction, getLang, user, isSlash }) {
        const menuEmbed = new EmbedBuilder()
            .setTitle("🎬 Anime Hub - Browse & Watch")
            .setDescription(getLang("mainMenu") + "\n\n**Quick Access:**")
            .setColor(0xFF6B6B)
            .setThumbnail("https://cdn.myanimelist.net/images/about_me/ranking_items/manga1.jpg")
            .addFields(
                { name: "🇮🇳 Hindi Dubbed", value: "Watch anime in Hindi", inline: true },
                { name: "🔥 Most Watched", value: "Popular series & movies", inline: true },
                { name: "🆕 Newest Drops", value: "Latest releases", inline: true },
                { name: "📚 Franchises", value: "Naruto, Pokemon, Dragon Ball...", inline: true },
                { name: "🏢 Networks", value: "Netflix, Crunchyroll, Disney+...", inline: true },
                { name: "🎭 Genres", value: "Action, Comedy, Romance...", inline: true }
            )
            .setFooter({ text: `${user.username} | Use buttons below or type /anime <option>`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`anime_hindi_${user.id}`)
                .setLabel("Hindi Dubbed")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🇮🇳"),
            new ButtonBuilder()
                .setCustomId(`anime_popular_${user.id}`)
                .setLabel("Popular")
                .setStyle(ButtonStyle.Success)
                .setEmoji("🔥"),
            new ButtonBuilder()
                .setCustomId(`anime_newest_${user.id}`)
                .setLabel("New Releases")
                .setStyle(ButtonStyle.Success)
                .setEmoji("🆕")
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`anime_franchise_${user.id}`)
                .setLabel("Franchises")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("📚"),
            new ButtonBuilder()
                .setCustomId(`anime_network_${user.id}`)
                .setLabel("Networks")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🏢"),
            new ButtonBuilder()
                .setCustomId(`anime_genre_${user.id}`)
                .setLabel("Genres")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🎭")
        );

        const components = [row1, row2];

        let sentMessage;
        if (isSlash) {
            await interaction.reply({ embeds: [menuEmbed], components });
            sentMessage = { interaction, isSlash: true };
        } else {
            sentMessage = await message.reply({ embeds: [menuEmbed], components });
            sentMessage.isSlash = false;
        }

        this.setupMenuButtons(user.id, sentMessage, getLang);
    },

    setupMenuButtons: function (userId, sentMessage, getLang) {
        const buttons = ['hindi', 'popular', 'newest', 'franchise', 'network', 'genre'];

        buttons.forEach(btn => {
            const buttonId = `anime_${btn}_${userId}`;
            global.RentoBot.onButton.set(buttonId, async (buttonInteraction) => {
                if (buttonInteraction.user.id !== userId) {
                    return buttonInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
                }

                await buttonInteraction.deferUpdate();

                if (btn === 'hindi') {
                    await this.browseLanguage({ interaction: buttonInteraction, getLang, user: buttonInteraction.user, isSlash: true, language: 'hindi' });
                } else if (btn === 'popular') {
                    await this.showFeatured({ interaction: buttonInteraction, getLang, user: buttonInteraction.user, isSlash: true, type: 'mostWatchedSeries' });
                } else if (btn === 'newest') {
                    await this.showFeatured({ interaction: buttonInteraction, getLang, user: buttonInteraction.user, isSlash: true, type: 'newestDrop' });
                } else if (btn === 'franchise') {
                    await this.showFranchiseMenu({ interaction: buttonInteraction, getLang, user: buttonInteraction.user, isSlash: true });
                } else if (btn === 'network') {
                    await this.showNetworkMenu({ interaction: buttonInteraction, getLang, user: buttonInteraction.user, isSlash: true });
                } else if (btn === 'genre') {
                    await this.showGenreMenu({ interaction: buttonInteraction, getLang, user: buttonInteraction.user, isSlash: true });
                }

                buttons.forEach(b => global.RentoBot.onButton.delete(`anime_${b}_${userId}`));
            });
        });

        setTimeout(() => {
            buttons.forEach(b => global.RentoBot.onButton.delete(`anime_${b}_${userId}`));
        }, 300000);
    },

    searchAnime: async function ({ message, interaction, query, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("searching"))
            .setColor(0xFF6B6B)
            .setFooter({ text: user.username });

        let sentMessage;
        if (isSlash) {
            await interaction.reply({ embeds: [loadingEmbed] });
            sentMessage = { interaction, isSlash: true };
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
            sentMessage.isSlash = false;
        }

        const { data } = await axios.get(`${API_BASE}/search?query=${encodeURIComponent(query)}`);

        if (!data || !data.data || data.data.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setDescription(getLang("noResults", query))
                .setColor(0xED4245);
            if (sentMessage.isSlash) {
                return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await sentMessage.edit({ embeds: [errorEmbed] });
            }
        }

        await showAnimeList(data.data, sentMessage, getLang, user, `Search: ${query}`, data.currentPage, data.totalPage);
    },

    showFeatured: async function ({ message, interaction, getLang, user, isSlash, type }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0xFF6B6B);

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [loadingEmbed], components: [] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [loadingEmbed] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
            sentMessage.isSlash = false;
        }

        const { data } = await axios.get(`${API_BASE}/main/${type}`);

        if (!data || data.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setDescription("❌ No featured anime found.")
                .setColor(0xED4245);
            if (sentMessage.isSlash) {
                return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await sentMessage.edit({ embeds: [errorEmbed] });
            }
        }

        const titles = {
            'newestDrop': '🆕 Newest Drops',
            'mostWatchedSeries': '🔥 Most Watched Series',
            'mostWatchedMovies': '🔥 Most Watched Movies',
            'newAnimeSeries': '🆕 New Anime Series',
            'newAnimeMovies': '🆕 New Anime Movies',
            'newCartoonSeries': '🆕 New Cartoon Series',
            'newCartoonMovies': '🆕 New Cartoon Movies'
        };

        await showAnimeList(data, sentMessage, getLang, user, titles[type] || 'Featured Anime', 1, 1);
    },

    browseLanguage: async function ({ message, interaction, getLang, user, isSlash, language, page = 1 }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0xFF6B6B);

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [loadingEmbed], components: [] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [loadingEmbed] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
            sentMessage.isSlash = false;
        }

        const url = page > 1 ? `${API_BASE}/language/${language}/${page}` : `${API_BASE}/language/${language}`;
        const { data } = await axios.get(url);

        if (!data || !data.data || data.data.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setDescription(`❌ No anime found for language: ${language}`)
                .setColor(0xED4245);
            if (sentMessage.isSlash) {
                return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await sentMessage.edit({ embeds: [errorEmbed] });
            }
        }

        await showAnimeList(data.data, sentMessage, getLang, user, `🇮🇳 ${data.header || 'Hindi Dubbed Anime'}`, data.currentPage, data.totalPage, 'language', language);
    },

    browseFranchise: async function ({ message, interaction, getLang, user, isSlash, franchise, page = 1 }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0xFF6B6B);

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [loadingEmbed], components: [] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [loadingEmbed] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
            sentMessage.isSlash = false;
        }

        const url = page > 1 ? `${API_BASE}/franchise/${franchise}/${page}` : `${API_BASE}/franchise/${franchise}`;
        const { data } = await axios.get(url);

        if (!data || !data.data || data.data.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setDescription(`❌ No anime found for franchise: ${franchise}`)
                .setColor(0xED4245);
            if (sentMessage.isSlash) {
                return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await sentMessage.edit({ embeds: [errorEmbed] });
            }
        }

        await showAnimeList(data.data, sentMessage, getLang, user, `📚 ${data.header || franchise.toUpperCase()}`, data.currentPage, data.totalPage, 'franchise', franchise);
    },

    browseNetwork: async function ({ message, interaction, getLang, user, isSlash, network, page = 1 }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0xFF6B6B);

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [loadingEmbed], components: [] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [loadingEmbed] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
            sentMessage.isSlash = false;
        }

        const url = page > 1 ? `${API_BASE}/network/${network}/${page}` : `${API_BASE}/network/${network}`;
        const { data } = await axios.get(url);

        if (!data || !data.data || data.data.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setDescription(`❌ No anime found for network: ${network}`)
                .setColor(0xED4245);
            if (sentMessage.isSlash) {
                return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await sentMessage.edit({ embeds: [errorEmbed] });
            }
        }

        await showAnimeList(data.data, sentMessage, getLang, user, `🏢 ${data.header || network.toUpperCase()}`, data.currentPage, data.totalPage, 'network', network);
    },

    browseGenre: async function ({ message, interaction, getLang, user, isSlash, genre, page = 1 }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0xFF6B6B);

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [loadingEmbed], components: [] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [loadingEmbed] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
            sentMessage.isSlash = false;
        }

        const url = page > 1 ? `${API_BASE}/genre/${genre}/${page}` : `${API_BASE}/genre/${genre}`;
        const { data } = await axios.get(url);

        if (!data || !data.data || data.data.length === 0) {
            const errorEmbed = new EmbedBuilder()
                .setDescription(`❌ No anime found for genre: ${genre}`)
                .setColor(0xED4245);
            if (sentMessage.isSlash) {
                return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await sentMessage.edit({ embeds: [errorEmbed] });
            }
        }

        await showAnimeList(data.data, sentMessage, getLang, user, `🎭 ${data.header || genre.toUpperCase()}`, data.currentPage, data.totalPage, 'genre', genre);
    },

    showFranchiseMenu: async function ({ message, interaction, getLang, user, isSlash }) {
        const franchises = [
            { name: 'Naruto', value: 'naruto', emoji: '🍥' },
            { name: 'Pokemon', value: 'pokemon', emoji: '⚡' },
            { name: 'Dragon Ball', value: 'dragon-ball', emoji: '🐉' },
            { name: 'Ben 10', value: 'ben-10', emoji: '⌚' },
            { name: 'Shinchan', value: 'shinchan', emoji: '👶' },
            { name: 'Transformers', value: 'transformers', emoji: '🤖' }
        ];

        const options = franchises.map(f => 
            new StringSelectMenuOptionBuilder()
                .setLabel(f.name)
                .setValue(f.value)
                .setEmoji(f.emoji)
        );

        const menuId = `anime_franchise_menu_${Date.now()}_${user.id}`;
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuId)
            .setPlaceholder('Select a franchise')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle("📚 Browse Anime by Franchise")
            .setDescription("Select a franchise to browse all related anime:\n\n" + 
                franchises.map(f => `${f.emoji} **${f.name}**`).join('\n'))
            .setColor(0xFF6B6B)
            .setFooter({ text: `${user.username} | Timeout: 60s` });

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [embed], components: [row] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [embed], components: [row] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [embed], components: [row] });
            sentMessage.isSlash = false;
        }

        global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== user.id) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const franchise = selectInteraction.values[0];
            await selectInteraction.deferUpdate();
            global.RentoBot.onSelectMenu.delete(menuId);
            await this.browseFranchise({ interaction: selectInteraction, getLang, user, isSlash: true, franchise });
        });

        setTimeout(() => global.RentoBot.onSelectMenu.delete(menuId), 60000);
    },

    showNetworkMenu: async function ({ message, interaction, getLang, user, isSlash }) {
        const networks = [
            { name: 'Netflix', value: 'netflix', emoji: '🔴' },
            { name: 'Crunchyroll', value: 'crunchyroll', emoji: '🧡' },
            { name: 'Disney+', value: 'disney', emoji: '🏰' },
            { name: 'Prime Video', value: 'prime-video', emoji: '📺' },
            { name: 'Cartoon Network', value: 'cartoon-network', emoji: '📡' },
            { name: 'Sony YAY', value: 'sony-yay', emoji: '🎮' },
            { name: 'Hungama TV', value: 'hungama-tv', emoji: '📹' }
        ];

        const options = networks.map(n => 
            new StringSelectMenuOptionBuilder()
                .setLabel(n.name)
                .setValue(n.value)
                .setEmoji(n.emoji)
        );

        const menuId = `anime_network_menu_${Date.now()}_${user.id}`;
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuId)
            .setPlaceholder('Select a network/platform')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle("🏢 Browse Anime by Network/Platform")
            .setDescription("Select a network to browse all their anime:\n\n" + 
                networks.map(n => `${n.emoji} **${n.name}**`).join('\n'))
            .setColor(0xFF6B6B)
            .setFooter({ text: `${user.username} | Timeout: 60s` });

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [embed], components: [row] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [embed], components: [row] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [embed], components: [row] });
            sentMessage.isSlash = false;
        }

        global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== user.id) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const network = selectInteraction.values[0];
            await selectInteraction.deferUpdate();
            global.RentoBot.onSelectMenu.delete(menuId);
            await this.browseNetwork({ interaction: selectInteraction, getLang, user, isSlash: true, network });
        });

        setTimeout(() => global.RentoBot.onSelectMenu.delete(menuId), 60000);
    },

    showGenreMenu: async function ({ message, interaction, getLang, user, isSlash }) {
        const genres = [
            { name: 'Action', value: 'action', emoji: '⚔️' },
            { name: 'Adventure', value: 'adventure', emoji: '🗺️' },
            { name: 'Comedy', value: 'comedy', emoji: '😂' },
            { name: 'Drama', value: 'drama', emoji: '🎭' },
            { name: 'Fantasy', value: 'fantasy', emoji: '🧙' },
            { name: 'Romance', value: 'romance', emoji: '💕' },
            { name: 'Sci-Fi', value: 'sci-fi', emoji: '🚀' },
            { name: 'Horror', value: 'horror', emoji: '👻' },
            { name: 'Mystery', value: 'mystery', emoji: '🔍' },
            { name: 'Thriller', value: 'thriller', emoji: '😱' }
        ];

        const options = genres.map(g => 
            new StringSelectMenuOptionBuilder()
                .setLabel(g.name)
                .setValue(g.value)
                .setEmoji(g.emoji)
        );

        const menuId = `anime_genre_menu_${Date.now()}_${user.id}`;
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuId)
            .setPlaceholder('Select a genre')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle("🎭 Browse Anime by Genre")
            .setDescription("Select a genre to discover anime:\n\n" + 
                genres.map(g => `${g.emoji} **${g.name}**`).join(' • '))
            .setColor(0xFF6B6B)
            .setFooter({ text: `${user.username} | Timeout: 60s` });

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [embed], components: [row] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [embed], components: [row] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [embed], components: [row] });
            sentMessage.isSlash = false;
        }

        global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== user.id) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const genre = selectInteraction.values[0];
            await selectInteraction.deferUpdate();
            global.RentoBot.onSelectMenu.delete(menuId);
            await this.browseGenre({ interaction: selectInteraction, getLang, user, isSlash: true, genre });
        });

        setTimeout(() => global.RentoBot.onSelectMenu.delete(menuId), 60000);
    }
};

async function showAnimeList(animeList, sentMessage, getLang, user, title, currentPage, totalPage, browseType = null, browseValue = null) {
    const options = animeList.slice(0, 25).map((anime, index) => {
        const type = anime.type === 'series' ? '📺' : '🎬';
        return new StringSelectMenuOptionBuilder()
            .setLabel(`${anime.title.substring(0, 90)}${anime.title.length > 90 ? '...' : ''}`)
            .setDescription(`${type} ${anime.type.toUpperCase()}`)
            .setValue(`${index}`)
            .setEmoji(type);
    });

    const menuId = sentMessage.isSlash ? 
        `anime_select_${Date.now()}_${user.id}` : 
        `anime_select_${sentMessage.id}`;

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(menuId)
        .setPlaceholder('Select an anime to watch')
        .addOptions(options);

    const row1 = new ActionRowBuilder().addComponents(selectMenu);
    const components = [row1];

    if (totalPage && totalPage > 1) {
        const navButtons = [];
        if (currentPage > 1) {
            navButtons.push(
                new ButtonBuilder()
                    .setCustomId(`anime_prev_${currentPage}_${user.id}_${browseType || 'search'}_${browseValue || ''}`)
                    .setLabel('◀️ Previous')
                    .setStyle(ButtonStyle.Primary)
            );
        }
        navButtons.push(
            new ButtonBuilder()
                .setCustomId(`anime_page_info_${user.id}`)
                .setLabel(`Page ${currentPage}/${totalPage}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );
        if (currentPage < totalPage) {
            navButtons.push(
                new ButtonBuilder()
                    .setCustomId(`anime_next_${currentPage}_${user.id}_${browseType || 'search'}_${browseValue || ''}`)
                    .setLabel('Next ▶️')
                    .setStyle(ButtonStyle.Primary)
            );
        }
        if (navButtons.length > 0) {
            components.push(new ActionRowBuilder().addComponents(navButtons));
        }
    }

    const itemsPerPage = 15;
    const animeListText = animeList.slice(0, itemsPerPage)
        .map((a, i) => `**${i + 1}.** ${a.title} ${a.type === 'series' ? '📺' : '🎬'}`)
        .join('\n');

    const paginationText = animeList.length > itemsPerPage ? 
        `\n\n📄 **Showing ${itemsPerPage} of ${animeList.length} results** - Use pagination buttons below to see more!` : '';

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(`${getLang("selectAnime", animeList.length)}\n\n${animeListText}${paginationText}`)
        .setColor(0xFF6B6B)
        .setFooter({ text: `${user.username} | Page ${currentPage || 1}/${totalPage || 1} | Select from dropdown above`, iconURL: user.displayAvatarURL() })
        .setTimestamp();

    if (animeList[0]?.image) {
        embed.setThumbnail(animeList[0].image);
    }

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [embed], components });
    } else {
        await sentMessage.edit({ embeds: [embed], components });
    }

    global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
        if (selectInteraction.user.id !== user.id) {
            return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        const selectedIndex = parseInt(selectInteraction.values[0]);
        const selectedAnime = animeList[selectedIndex];

        await selectInteraction.deferUpdate();
        global.RentoBot.onSelectMenu.delete(menuId);
        cleanupPaginationButtons(currentPage, user.id, browseType, browseValue);

        if (selectedAnime.type === 'series') {
            await showSeriesDetails(selectedAnime.id, sentMessage, getLang, user);
        } else {
            await showMovieDetails(selectedAnime.id, sentMessage, getLang, user);
        }
    });

    setupPaginationButtons(currentPage, user.id, browseType, browseValue, sentMessage, getLang, user, title);

    setTimeout(() => {
        global.RentoBot.onSelectMenu.delete(menuId);
        cleanupPaginationButtons(currentPage, user.id, browseType, browseValue);
    }, 60000);
}

function cleanupPaginationButtons(currentPage, userId, browseType, browseValue) {
    global.RentoBot.onButton.delete(`anime_prev_${currentPage}_${userId}_${browseType || 'search'}_${browseValue || ''}`);
    global.RentoBot.onButton.delete(`anime_next_${currentPage}_${userId}_${browseType || 'search'}_${browseValue || ''}`);
}

function setupPaginationButtons(currentPage, userId, browseType, browseValue, sentMessage, getLang, user, title) {
    const prevButtonId = `anime_prev_${currentPage}_${userId}_${browseType || 'search'}_${browseValue || ''}`;
    const nextButtonId = `anime_next_${currentPage}_${userId}_${browseType || 'search'}_${browseValue || ''}`;

    global.RentoBot.onButton.set(prevButtonId, async (buttonInteraction) => {
        if (buttonInteraction.user.id !== userId) {
            return buttonInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        await buttonInteraction.deferUpdate();
        cleanupPaginationButtons(currentPage, userId, browseType, browseValue);

        const newPage = currentPage - 1;
        await handlePagination(newPage, browseType, browseValue, sentMessage, getLang, user, title);
    });

    global.RentoBot.onButton.set(nextButtonId, async (buttonInteraction) => {
        if (buttonInteraction.user.id !== userId) {
            return buttonInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        await buttonInteraction.deferUpdate();
        cleanupPaginationButtons(currentPage, userId, browseType, browseValue);

        const newPage = currentPage + 1;
        await handlePagination(newPage, browseType, browseValue, sentMessage, getLang, user, title);
    });
}

async function handlePagination(page, browseType, browseValue, sentMessage, getLang, user, title) {
    const loadingEmbed = new EmbedBuilder()
        .setDescription(getLang("loading"))
        .setColor(0xFF6B6B);

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [loadingEmbed], components: [] });
    } else {
        await sentMessage.edit({ embeds: [loadingEmbed], components: [] });
    }

    try {
        let url = '';
        if (browseType === 'language') {
            url = `${API_BASE}/language/${browseValue}/${page}`;
        } else if (browseType === 'franchise') {
            url = `${API_BASE}/franchise/${browseValue}/${page}`;
        } else if (browseType === 'network') {
            url = `${API_BASE}/network/${browseValue}/${page}`;
        } else if (browseType === 'genre') {
            url = `${API_BASE}/genre/${browseValue}/${page}`;
        }

        if (url) {
            const { data } = await axios.get(url);
            await showAnimeList(data.data, sentMessage, getLang, user, title, data.currentPage, data.totalPage, browseType, browseValue);
        }
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setDescription(`❌ Failed to load page ${page}`)
            .setColor(0xED4245);
        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [errorEmbed], components: [] });
        }
    }
}

async function showSeriesDetails(seriesId, sentMessage, getLang, user) {
    const loadingEmbed = new EmbedBuilder()
        .setDescription(getLang("loadingDetails"))
        .setColor(0xFF6B6B);

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [loadingEmbed], components: [] });
    } else {
        await sentMessage.edit({ embeds: [loadingEmbed], components: [] });
    }

    const { data: series } = await axios.get(`${API_BASE}/series/${seriesId}`);

    const embed = new EmbedBuilder()
        .setTitle(`📺 ${series.title}`)
        .setColor(0xFF6B6B)
        .setDescription(series.overview || 'No description available.')
        .setThumbnail(series.image)
        .setImage(series.cover);

    const fields = [];
    if (series.genres && series.genres.length > 0) {
        fields.push({ name: '🎭 Genres', value: series.genres.join(', '), inline: true });
    }
    if (series.year) {
        fields.push({ name: '📅 Year', value: series.year, inline: true });
    }
    if (series.network) {
        fields.push({ name: '🏢 Network', value: series.network.toUpperCase(), inline: true });
    }
    if (series.languages && series.languages.length > 0) {
        fields.push({ name: '🗣️ Languages', value: series.languages.join(', '), inline: true });
    }
    if (series.duration) {
        fields.push({ name: '⏱️ Duration', value: series.duration, inline: true });
    }
    if (series.recentEp) {
        fields.push({ name: '🆕 Recent Episode', value: series.recentEp, inline: true });
    }
    if (series.seasons && series.seasons.length > 0) {
        const totalEpisodes = series.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
        fields.push({ name: '📊 Seasons', value: `${series.seasons.length} seasons, ${totalEpisodes} episodes`, inline: false });
    }

    embed.addFields(fields);
    embed.setFooter({ text: `Series ID: ${series.id} | Requested by ${user.username}`, iconURL: user.displayAvatarURL() });
    embed.setTimestamp();

    const seasonOptions = series.seasons.map((season, index) => 
        new StringSelectMenuOptionBuilder()
            .setLabel(`Season ${season.season}`)
            .setDescription(`${season.episodes.length} episodes`)
            .setValue(`${index}`)
            .setEmoji('📺')
    );

    const menuId = sentMessage.isSlash ? 
        `anime_season_select_${Date.now()}_${user.id}` : 
        `anime_season_select_${sentMessage.id}`;

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(menuId)
        .setPlaceholder('Select a season to view episodes')
        .addOptions(seasonOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await sentMessage.edit({ embeds: [embed], components: [row] });
    }

    global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
        if (selectInteraction.user.id !== user.id) {
            return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        const seasonIndex = parseInt(selectInteraction.values[0]);
        const season = series.seasons[seasonIndex];

        await selectInteraction.deferUpdate();
        global.RentoBot.onSelectMenu.delete(menuId);

        await showEpisodeList(season, series, sentMessage, getLang, user);
    });

    setTimeout(() => global.RentoBot.onSelectMenu.delete(menuId), 60000);
}

async function showEpisodeList(season, series, sentMessage, getLang, user) {
    const episodeOptions = season.episodes.slice(0, 25).map((ep, index) => 
        new StringSelectMenuOptionBuilder()
            .setLabel(`Episode ${ep.episode}${ep.title ? ': ' + ep.title.substring(0, 60) : ''}`)
            .setDescription(`Season ${season.season}`)
            .setValue(`${index}`)
            .setEmoji('▶️')
    );

    const menuId = sentMessage.isSlash ? 
        `anime_episode_select_${Date.now()}_${user.id}` : 
        `anime_episode_select_${sentMessage.id}`;

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(menuId)
        .setPlaceholder('Select an episode to watch')
        .addOptions(episodeOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const episodeListText = season.episodes.slice(0, 15)
        .map((ep, i) => `**${i + 1}.** Episode ${ep.episode}${ep.title ? ': ' + ep.title : ''}`)
        .join('\n');

    const embed = new EmbedBuilder()
        .setTitle(`📺 ${series.title} - Season ${season.season}`)
        .setDescription(`${getLang("selectEpisode")}\n\n${episodeListText}${season.episodes.length > 15 ? '\n*...and more*' : ''}`)
        .setColor(0xFF6B6B)
        .setThumbnail(series.image)
        .setFooter({ text: `${user.username} | ${season.episodes.length} episodes | Timeout: 60s`, iconURL: user.displayAvatarURL() })
        .setTimestamp();

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await sentMessage.edit({ embeds: [embed], components: [row] });
    }

    global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
        if (selectInteraction.user.id !== user.id) {
            return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        const episodeIndex = parseInt(selectInteraction.values[0]);
        const episode = season.episodes[episodeIndex];

        await selectInteraction.deferUpdate();
        global.RentoBot.onSelectMenu.delete(menuId);

        await showEpisodePlayer(episode.id, series, sentMessage, getLang, user);
    });

    setTimeout(() => global.RentoBot.onSelectMenu.delete(menuId), 60000);
}

async function showEpisodePlayer(episodeId, series, sentMessage, getLang, user) {
    const loadingEmbed = new EmbedBuilder()
        .setDescription("⏳ Loading episode...")
        .setColor(0xFF6B6B);

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [loadingEmbed], components: [] });
    } else {
        await sentMessage.edit({ embeds: [loadingEmbed], components: [] });
    }

    const { data: episode } = await axios.get(`${API_BASE}/episode/${episodeId}`);

    // Find Zephyr Flick server from streamLink array
    let zephyrUrl = null;
    if (episode.streamLink && Array.isArray(episode.streamLink)) {
        zephyrUrl = episode.streamLink.find(link => 
            link && typeof link === 'string' && link.includes('play.zephyrflick.top/video/')
        );
    }

    if (!zephyrUrl) {
        const errorEmbed = new EmbedBuilder()
            .setDescription("❌ No Zephyr Flick server available for this episode.")
            .setColor(0xED4245);

        if (sentMessage.isSlash) {
            return await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
        } else {
            return await sentMessage.edit({ embeds: [errorEmbed], components: [] });
        }
    }

    const embed = new EmbedBuilder()
        .setTitle(`▶️ ${episode.title || series.title}`)
        .setDescription(`**Ready to watch!**\n\nClick the button below to watch on Zephyr Flick - a fast, ad-free streaming experience.\n\n🎬 **Episode ID:** ${episodeId}`)
        .setColor(0x57F287)
        .setImage(episode.cover)
        .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() })
        .setTimestamp();

    const button = new ButtonBuilder()
        .setLabel('▶️ Watch on Zephyr Flick')
        .setURL(zephyrUrl)
        .setStyle(ButtonStyle.Link)
        .setEmoji('🎬');

    const row = new ActionRowBuilder().addComponents(button);

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await sentMessage.edit({ embeds: [embed], components: [row] });
    }
}

async function showMovieDetails(movieId, sentMessage, getLang, user) {
    const loadingEmbed = new EmbedBuilder()
        .setDescription(getLang("loadingDetails"))
        .setColor(0xFF6B6B);

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [loadingEmbed], components: [] });
    } else {
        await sentMessage.edit({ embeds: [loadingEmbed], components: [] });
    }

    const { data: movie } = await axios.get(`${API_BASE}/movies/${movieId}`);

    const embed = new EmbedBuilder()
        .setTitle(`🎬 ${movie.title}`)
        .setColor(0xFF6B6B)
        .setDescription(movie.overview || 'No description available.')
        .setThumbnail(movie.image)
        .setImage(movie.cover);

    const fields = [];
    if (movie.genres && movie.genres.length > 0) {
        fields.push({ name: '🎭 Genres', value: movie.genres.join(', '), inline: true });
    }
    if (movie.year) {
        fields.push({ name: '📅 Year', value: movie.year, inline: true });
    }
    if (movie.network) {
        fields.push({ name: '🏢 Network', value: movie.network.toUpperCase(), inline: true });
    }
    if (movie.languages && movie.languages.length > 0) {
        fields.push({ name: '🗣️ Languages', value: movie.languages.join(', '), inline: true });
    }
    if (movie.duration) {
        fields.push({ name: '⏱️ Duration', value: movie.duration, inline: true });
    }

    embed.addFields(fields);
    embed.setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() });
    embed.setTimestamp();

    // Find Zephyr Flick server from streamLink array
    let zephyrUrl = null;
    if (movie.streamLink && Array.isArray(movie.streamLink)) {
        zephyrUrl = movie.streamLink.find(link => 
            link && typeof link === 'string' && link.includes('play.zephyrflick.top/video/')
        );
    }

    if (!zephyrUrl) {
        const errorEmbed = new EmbedBuilder()
            .setDescription("❌ No Zephyr Flick server available for this movie.")
            .setColor(0xED4245);

        if (sentMessage.isSlash) {
            return await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
        } else {
            return await sentMessage.edit({ embeds: [errorEmbed], components: [] });
        }
    }

    const button = new ButtonBuilder()
        .setLabel('▶️ Watch on Zephyr Flick')
        .setURL(zephyrUrl)
        .setStyle(ButtonStyle.Link)
        .setEmoji('🎬');

    const row = new ActionRowBuilder().addComponents(button);

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await sentMessage.edit({ embeds: [embed], components: [row] });
    }
}