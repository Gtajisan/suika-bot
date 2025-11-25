const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const axios = require('axios');

const ANILIST_API = 'https://graphql.anilist.co';

module.exports = {
    config: {
        name: "anilist",
        aliases: ["al", "anl", "animelist"],
        version: "2.0",
        author: "Samir",
        countDown: 3,
        role: 0,
        description: {
            en: "Complete anime/manga database - Search, rankings, trending, characters, recommendations & more"
        },
        category: "entertainment",
        guide: {
            en: `{prefix}anilist search <anime/manga name> - Search anime or manga
{prefix}anilist top anime - Top rated anime
{prefix}anilist top manga - Top rated manga
{prefix}anilist top movies - Top anime movies
{prefix}anilist trending anime - Trending anime
{prefix}anilist trending manga - Trending manga
{prefix}anilist manhwa - Top manhwa (Korean manga)
{prefix}anilist manhua - Top manhua (Chinese manga)
{prefix}anilist season - Current season anime
{prefix}anilist upcoming - Upcoming anime
{prefix}anilist character <name> - Search characters
{prefix}anilist staff <name> - Search staff/creators
{prefix}anilist studio <name> - Search studios
{prefix}anilist user <username> - View user stats
{prefix}anilist random anime - Random anime
{prefix}anilist random manga - Random manga
{prefix}anilist recommend <anime/manga name> - Get recommendations based on a title
{prefix}anilist menu - Show all options

Examples:
• {prefix}anilist search One Piece
• {prefix}anilist top anime
• {prefix}anilist trending manga
• {prefix}anilist manhwa
• {prefix}anilist character Naruto
• {prefix}anilist recommend Naruto
• {prefix}anilist menu`,
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
                    { name: "📊 Top Anime", value: "top_anime" },
                    { name: "📊 Top Manga", value: "top_manga" },
                    { name: "🎬 Top Movies", value: "top_movies" },
                    { name: "🔥 Trending Anime", value: "trending_anime" },
                    { name: "🔥 Trending Manga", value: "trending_manga" },
                    { name: "🇰🇷 Manhwa", value: "manhwa" },
                    { name: "🇨🇳 Manhua", value: "manhua" },
                    { name: "📺 This Season", value: "season" },
                    { name: "🆕 Upcoming", value: "upcoming" },
                    { name: "👤 Character Search", value: "character" },
                    { name: "🎨 Staff Search", value: "staff" },
                    { name: "🏢 Studio Search", value: "studio" },
                    { name: "👥 User Stats", value: "user" },
                    { name: "🎲 Random Anime", value: "random_anime" },
                    { name: "🎲 Random Manga", value: "random_manga" },
                    { name: "💡 Recommendations", value: "recommend" },
                    { name: "📋 Menu", value: "menu" }
                ]
            },
            {
                name: "query",
                description: "Search query or username",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noQuery: "❌ Please provide a search query! Use `/anilist menu` for all options.",
            searching: "🔍 Searching AniList database...",
            loading: "⏳ Loading data from AniList...",
            noResults: "❌ No results found for: **%1**",
            error: "❌ An error occurred: %1",
            invalidChoice: "❌ This is not your menu!",
            timeout: "⏱️ Menu timed out. Please use the command again.",
            mainMenu: "Welcome to AniList! Choose what you'd like to explore:",
            selectOption: "Please select an option from the menu above!",
            viewOnAniList: "View on AniList",
            episodes: "Episodes",
            chapters: "Chapters",
            volumes: "Volumes",
            score: "Score",
            popularity: "Popularity",
            status: "Status",
            format: "Format",
            season: "Season",
            genres: "Genres",
            studios: "Studios",
            source: "Source",
            duration: "Duration",
            startDate: "Start Date",
            endDate: "End Date",
            description: "Description",
            characters: "Main Characters",
            relations: "Relations",
            recommendations: "Recommendations",
            tags: "Tags"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        let action = '';
        let query = '';

        if (isSlash) {
            action = interaction.options.getString('action') || 'menu';
            query = interaction.options.getString('query') || '';
        } else {
            if (args.length === 0) {
                action = 'menu';
            } else {
                const firstArg = args[0].toLowerCase();
                const secondArg = args[1]?.toLowerCase() || '';

                if (['menu', 'help', 'options'].includes(firstArg)) {
                    action = 'menu';
                } else if (firstArg === 'search' || firstArg === 's') {
                    action = 'search';
                    query = args.slice(1).join(' ');
                } else if (firstArg === 'top') {
                    if (secondArg === 'anime' || secondArg === 'a') action = 'top_anime';
                    else if (secondArg === 'manga' || secondArg === 'm') action = 'top_manga';
                    else if (secondArg === 'movies' || secondArg === 'movie') action = 'top_movies';
                    else action = 'top_anime';
                } else if (firstArg === 'trending' || firstArg === 'trend') {
                    if (secondArg === 'anime' || secondArg === 'a') action = 'trending_anime';
                    else if (secondArg === 'manga' || secondArg === 'm') action = 'trending_manga';
                    else action = 'trending_anime';
                } else if (['manhwa', 'kr', 'korean'].includes(firstArg)) {
                    action = 'manhwa';
                } else if (['manhua', 'cn', 'chinese'].includes(firstArg)) {
                    action = 'manhua';
                } else if (['season', 'seasonal', 'current'].includes(firstArg)) {
                    action = 'season';
                } else if (['upcoming', 'next', 'future'].includes(firstArg)) {
                    action = 'upcoming';
                } else if (['character', 'char', 'c'].includes(firstArg)) {
                    action = 'character';
                    query = args.slice(1).join(' ');
                } else if (['staff', 'creator', 'author'].includes(firstArg)) {
                    action = 'staff';
                    query = args.slice(1).join(' ');
                } else if (['studio', 'studios'].includes(firstArg)) {
                    action = 'studio';
                    query = args.slice(1).join(' ');
                } else if (['user', 'profile'].includes(firstArg)) {
                    action = 'user';
                    query = args.slice(1).join(' ');
                } else if (firstArg === 'random') {
                    if (secondArg === 'anime' || secondArg === 'a') action = 'random_anime';
                    else if (secondArg === 'manga' || secondArg === 'm') action = 'random_manga';
                    else action = 'random_anime';
                } else if (['recommend', 'rec', 'recommendations'].includes(firstArg)) {
                    action = 'recommend';
                    query = args.slice(1).join(' ');
                } else {
                    action = 'search';
                    query = args.join(' ');
                }
            }
        }

        try {
            switch (action) {
                case 'menu':
                    return await this.showMainMenu({ message, interaction, getLang, user, isSlash });
                case 'search':
                    if (!query) return this.sendError(message, interaction, getLang('noQuery'), isSlash);
                    return await this.searchMedia({ message, interaction, query, getLang, user, isSlash });
                case 'top_anime':
                    return await this.getTopMedia({ message, interaction, getLang, user, isSlash, type: 'ANIME', sort: 'SCORE_DESC', title: '📊 Top Rated Anime' });
                case 'top_manga':
                    return await this.getTopMedia({ message, interaction, getLang, user, isSlash, type: 'MANGA', sort: 'SCORE_DESC', title: '📊 Top Rated Manga' });
                case 'top_movies':
                    return await this.getTopMedia({ message, interaction, getLang, user, isSlash, type: 'ANIME', format: 'MOVIE', sort: 'SCORE_DESC', title: '🎬 Top Anime Movies' });
                case 'trending_anime':
                    return await this.getTopMedia({ message, interaction, getLang, user, isSlash, type: 'ANIME', sort: 'TRENDING_DESC', title: '🔥 Trending Anime' });
                case 'trending_manga':
                    return await this.getTopMedia({ message, interaction, getLang, user, isSlash, type: 'MANGA', sort: 'TRENDING_DESC', title: '🔥 Trending Manga' });
                case 'manhwa':
                    return await this.getTopMedia({ message, interaction, getLang, user, isSlash, type: 'MANGA', countryOfOrigin: 'KR', sort: 'SCORE_DESC', title: '🇰🇷 Top Manhwa (Korean Manga)' });
                case 'manhua':
                    return await this.getTopMedia({ message, interaction, getLang, user, isSlash, type: 'MANGA', countryOfOrigin: 'CN', sort: 'SCORE_DESC', title: '🇨🇳 Top Manhua (Chinese Manga)' });
                case 'season':
                    return await this.getCurrentSeason({ message, interaction, getLang, user, isSlash });
                case 'upcoming':
                    return await this.getUpcoming({ message, interaction, getLang, user, isSlash });
                case 'character':
                    if (!query) return this.sendError(message, interaction, getLang('noQuery'), isSlash);
                    return await this.searchCharacter({ message, interaction, query, getLang, user, isSlash });
                case 'staff':
                    if (!query) return this.sendError(message, interaction, getLang('noQuery'), isSlash);
                    return await this.searchStaff({ message, interaction, query, getLang, user, isSlash });
                case 'studio':
                    if (!query) return this.sendError(message, interaction, getLang('noQuery'), isSlash);
                    return await this.searchStudio({ message, interaction, query, getLang, user, isSlash });
                case 'user':
                    if (!query) return this.sendError(message, interaction, getLang('noQuery'), isSlash);
                    return await this.getUserStats({ message, interaction, query, getLang, user, isSlash });
                case 'random_anime':
                    return await this.getRandomMedia({ message, interaction, getLang, user, isSlash, type: 'ANIME' });
                case 'random_manga':
                    return await this.getRandomMedia({ message, interaction, getLang, user, isSlash, type: 'MANGA' });
                case 'recommend':
                    if (!query) return this.sendError(message, interaction, getLang('noQuery'), isSlash);
                    return await this.getRecommendations({ message, interaction, query, getLang, user, isSlash });
                default:
                    return await this.showMainMenu({ message, interaction, getLang, user, isSlash });
            }
        } catch (error) {
            console.error('AniList command error:', error);
            return this.sendError(message, interaction, getLang('error', error.message), isSlash);
        }
    },

    showMainMenu: async function ({ message, interaction, getLang, user, isSlash }) {
        const menuEmbed = new EmbedBuilder()
            .setTitle("🌟 AniList - Complete Anime & Manga Database")
            .setDescription(getLang("mainMenu") + "\n\n**Quick Access Guide:**")
            .setColor(0x02A9FF)
            .setThumbnail("https://anilist.co/img/icons/android-chrome-512x512.png")
            .addFields(
                { name: "🔍 Search", value: "`/anilist search <name>`\nFind any anime or manga", inline: true },
                { name: "📊 Top Lists", value: "`/anilist top anime/manga/movies`\nHighest rated content", inline: true },
                { name: "🔥 Trending", value: "`/anilist trending anime/manga`\nWhat's hot right now", inline: true },
                { name: "🇰🇷 Manhwa", value: "`/anilist manhwa`\nTop Korean manga", inline: true },
                { name: "🇨🇳 Manhua", value: "`/anilist manhua`\nTop Chinese manga", inline: true },
                { name: "📺 This Season", value: "`/anilist season`\nCurrently airing anime", inline: true },
                { name: "🆕 Upcoming", value: "`/anilist upcoming`\nFuture releases", inline: true },
                { name: "👤 Characters", value: "`/anilist character <name>`\nSearch characters", inline: true },
                { name: "🎨 Staff", value: "`/anilist staff <name>`\nCreators & voice actors", inline: true },
                { name: "🏢 Studios", value: "`/anilist studio <name>`\nAnimation studios", inline: true },
                { name: "👥 User Stats", value: "`/anilist user <username>`\nView user profile", inline: true },
                { name: "🎲 Random", value: "`/anilist random anime/manga`\nDiscover something new", inline: true },
                { name: "💡 Recommendations", value: "`/anilist recommend <name>`\nGet similar titles", inline: true }
            )
            .setFooter({ text: `${user.username} | Powered by AniList API`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`al_search_${user.id}`)
                .setLabel("Search")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🔍"),
            new ButtonBuilder()
                .setCustomId(`al_top_anime_${user.id}`)
                .setLabel("Top Anime")
                .setStyle(ButtonStyle.Success)
                .setEmoji("📊"),
            new ButtonBuilder()
                .setCustomId(`al_trending_${user.id}`)
                .setLabel("Trending")
                .setStyle(ButtonStyle.Success)
                .setEmoji("🔥")
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`al_manhwa_${user.id}`)
                .setLabel("Manhwa")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🇰🇷"),
            new ButtonBuilder()
                .setCustomId(`al_season_${user.id}`)
                .setLabel("This Season")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("📺"),
            new ButtonBuilder()
                .setCustomId(`al_random_${user.id}`)
                .setLabel("Random")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🎲")
        );

        const components = [row1, row2];

        if (isSlash) {
            await interaction.reply({ embeds: [menuEmbed], components });
        } else {
            await message.reply({ embeds: [menuEmbed], components });
        }

        this.setupMenuButtons(user.id, { message, interaction, getLang, user, isSlash });
    },

    setupMenuButtons: function (userId, context) {
        const buttonHandlers = {
            [`al_search_${userId}`]: () => this.sendError(context.message, context.interaction, "Please use `/anilist search <name>` to search!", context.isSlash),
            [`al_top_anime_${userId}`]: () => this.getTopMedia({ ...context, type: 'ANIME', sort: 'SCORE_DESC', title: '📊 Top Rated Anime' }),
            [`al_trending_${userId}`]: () => this.getTopMedia({ ...context, type: 'ANIME', sort: 'TRENDING_DESC', title: '🔥 Trending Anime' }),
            [`al_manhwa_${userId}`]: () => this.getTopMedia({ ...context, type: 'MANGA', countryOfOrigin: 'KR', sort: 'SCORE_DESC', title: '🇰🇷 Top Manhwa' }),
            [`al_season_${userId}`]: () => this.getCurrentSeason(context),
            [`al_random_${userId}`]: () => this.getRandomMedia({ ...context, type: 'ANIME' })
        };

        Object.entries(buttonHandlers).forEach(([customId, handler]) => {
            global.RentoBot.onButton.set(customId, async (btnInteraction) => {
                if (btnInteraction.user.id !== userId) {
                    return btnInteraction.reply({ content: context.getLang("invalidChoice"), ephemeral: true });
                }
                await btnInteraction.deferUpdate();
                await handler();
            });
        });

        setTimeout(() => {
            Object.keys(buttonHandlers).forEach(id => global.RentoBot.onButton.delete(id));
        }, 300000);
    },

    anilistQuery: async function (query, variables = {}) {
        try {
            const response = await axios.post(ANILIST_API, {
                query,
                variables
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('AniList API Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.errors?.[0]?.message || 'Failed to fetch data from AniList');
        }
    },

    searchMedia: async function ({ message, interaction, query, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("searching"))
            .setColor(0x02A9FF)
            .setFooter({ text: user.username });

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const searchQuery = `
        query ($search: String) {
            Page(page: 1, perPage: 10) {
                media(search: $search, sort: POPULARITY_DESC) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    type
                    format
                    status
                    averageScore
                    popularity
                    coverImage {
                        large
                    }
                    bannerImage
                }
            }
        }`;

        const data = await this.anilistQuery(searchQuery, { search: query });

        if (!data.data?.Page?.media || data.data.Page.media.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription(getLang("noResults", query)).setColor(0xED4245)]
            }, isSlash);
        }

        await this.showMediaList(data.data.Page.media, sentMessage, getLang, user, `Search: ${query}`, isSlash);
    },

    getTopMedia: async function ({ message, interaction, getLang, user, isSlash, type, format = null, sort, title, countryOfOrigin = null, page = 1 }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0x02A9FF);

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const topQuery = `
        query ($type: MediaType, $format: MediaFormat, $sort: [MediaSort], $countryOfOrigin: CountryCode, $page: Int) {
            Page(page: $page, perPage: 25) {
                pageInfo {
                    total
                    currentPage
                    lastPage
                }
                media(type: $type, format: $format, sort: $sort, countryOfOrigin: $countryOfOrigin) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    type
                    format
                    status
                    averageScore
                    popularity
                    trending
                    coverImage {
                        large
                    }
                    bannerImage
                }
            }
        }`;

        const variables = { type, sort: [sort], page };
        if (format) variables.format = format;
        if (countryOfOrigin) variables.countryOfOrigin = countryOfOrigin;

        const data = await this.anilistQuery(topQuery, variables);

        if (!data.data?.Page?.media || data.data.Page.media.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription("❌ No results found.").setColor(0xED4245)]
            }, isSlash);
        }

        await this.showMediaList(data.data.Page.media, sentMessage, getLang, user, title, isSlash, data.data.Page.pageInfo);
    },

    getCurrentSeason: async function ({ message, interaction, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0x02A9FF);

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        let season;
        if (month >= 1 && month <= 3) season = 'WINTER';
        else if (month >= 4 && month <= 6) season = 'SPRING';
        else if (month >= 7 && month <= 9) season = 'SUMMER';
        else season = 'FALL';

        const seasonQuery = `
        query ($season: MediaSeason, $year: Int) {
            Page(page: 1, perPage: 25) {
                media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    type
                    format
                    status
                    averageScore
                    popularity
                    coverImage {
                        large
                    }
                    bannerImage
                }
            }
        }`;

        const data = await this.anilistQuery(seasonQuery, { season, year });

        if (!data.data?.Page?.media || data.data.Page.media.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription("❌ No seasonal anime found.").setColor(0xED4245)]
            }, isSlash);
        }

        await this.showMediaList(data.data.Page.media, sentMessage, getLang, user, `📺 ${season} ${year} Anime`, isSlash);
    },

    getUpcoming: async function ({ message, interaction, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0x02A9FF);

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const upcomingQuery = `
        query {
            Page(page: 1, perPage: 25) {
                media(status: NOT_YET_RELEASED, type: ANIME, sort: POPULARITY_DESC) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    type
                    format
                    status
                    averageScore
                    popularity
                    coverImage {
                        large
                    }
                    bannerImage
                    startDate {
                        year
                        month
                        day
                    }
                }
            }
        }`;

        const data = await this.anilistQuery(upcomingQuery);

        if (!data.data?.Page?.media || data.data.Page.media.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription("❌ No upcoming anime found.").setColor(0xED4245)]
            }, isSlash);
        }

        await this.showMediaList(data.data.Page.media, sentMessage, getLang, user, '🆕 Upcoming Anime', isSlash);
    },

    getRandomMedia: async function ({ message, interaction, getLang, user, isSlash, type }, retryCount = 0, sentMessage = null) {
        const maxRetries = 5;
        
        if (retryCount >= maxRetries) {
            return this.sendError(message, interaction, "❌ Failed to find a random anime/manga after multiple attempts. Please try again.", isSlash);
        }

        const loadingEmbed = new EmbedBuilder()
            .setDescription(retryCount === 0 ? getLang("loading") : `⏳ Searching... (Attempt ${retryCount + 1}/${maxRetries})`)
            .setColor(0x02A9FF);

        if (retryCount === 0) {
            sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);
        } else if (sentMessage) {
            await this.updateMessage(sentMessage, { embeds: [loadingEmbed] }, isSlash);
        }

        const randomId = Math.floor(Math.random() * 50000) + 1;

        const randomQuery = `
        query ($id: Int, $type: MediaType) {
            Media(id: $id, type: $type) {
                id
                title {
                    romaji
                    english
                    native
                }
                type
                format
                status
                description
                startDate {
                    year
                    month
                    day
                }
                endDate {
                    year
                    month
                    day
                }
                season
                seasonYear
                episodes
                chapters
                volumes
                duration
                source
                averageScore
                meanScore
                popularity
                favourites
                trending
                genres
                tags {
                    name
                    rank
                }
                studios {
                    nodes {
                        name
                    }
                }
                coverImage {
                    large
                    extraLarge
                }
                bannerImage
                siteUrl
                characters(perPage: 6, sort: ROLE) {
                    edges {
                        role
                        node {
                            name {
                                full
                            }
                            image {
                                large
                            }
                        }
                    }
                }
                relations {
                    edges {
                        relationType
                        node {
                            title {
                                romaji
                            }
                        }
                    }
                }
            }
        }`;

        try {
            const data = await this.anilistQuery(randomQuery, { id: randomId, type });
            
            if (data.data?.Media) {
                await this.showMediaDetails(data.data.Media, sentMessage, getLang, user, isSlash);
            } else {
                // Retry with incremented count, passing sentMessage
                return this.getRandomMedia({ message, interaction, getLang, user, isSlash, type }, retryCount + 1, sentMessage);
            }
        } catch (error) {
            // Only log if it's not a 404 error
            if (!error.message.includes('Not Found')) {
                console.error('Random media fetch error:', error.message);
            }
            // Retry with incremented count, passing sentMessage
            return this.getRandomMedia({ message, interaction, getLang, user, isSlash, type }, retryCount + 1, sentMessage);
        }
    },

    searchCharacter: async function ({ message, interaction, query, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("searching"))
            .setColor(0x02A9FF);

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const charQuery = `
        query ($search: String) {
            Page(page: 1, perPage: 10) {
                characters(search: $search, sort: FAVOURITES_DESC) {
                    id
                    name {
                        full
                        native
                    }
                    image {
                        large
                    }
                    description
                    favourites
                    siteUrl
                    media(perPage: 5, sort: POPULARITY_DESC) {
                        nodes {
                            title {
                                romaji
                            }
                            type
                        }
                    }
                }
            }
        }`;

        const data = await this.anilistQuery(charQuery, { search: query });

        if (!data.data?.Page?.characters || data.data.Page.characters.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription(getLang("noResults", query)).setColor(0xED4245)]
            }, isSlash);
        }

        await this.showCharacterList(data.data.Page.characters, sentMessage, getLang, user, `Character Search: ${query}`, isSlash);
    },

    searchStaff: async function ({ message, interaction, query, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("searching"))
            .setColor(0x02A9FF);

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const staffQuery = `
        query ($search: String) {
            Page(page: 1, perPage: 10) {
                staff(search: $search, sort: FAVOURITES_DESC) {
                    id
                    name {
                        full
                        native
                    }
                    image {
                        large
                    }
                    description
                    favourites
                    siteUrl
                    primaryOccupations
                    staffMedia(perPage: 5, sort: POPULARITY_DESC) {
                        nodes {
                            title {
                                romaji
                            }
                            type
                        }
                    }
                }
            }
        }`;

        const data = await this.anilistQuery(staffQuery, { search: query });

        if (!data.data?.Page?.staff || data.data.Page.staff.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription(getLang("noResults", query)).setColor(0xED4245)]
            }, isSlash);
        }

        await this.showStaffList(data.data.Page.staff, sentMessage, getLang, user, `Staff Search: ${query}`, isSlash);
    },

    searchStudio: async function ({ message, interaction, query, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("searching"))
            .setColor(0x02A9FF);

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const studioQuery = `
        query ($search: String) {
            Page(page: 1, perPage: 10) {
                studios(search: $search, sort: FAVOURITES_DESC) {
                    id
                    name
                    isAnimationStudio
                    favourites
                    siteUrl
                    media(perPage: 10, sort: POPULARITY_DESC) {
                        nodes {
                            title {
                                romaji
                            }
                            type
                            averageScore
                        }
                    }
                }
            }
        }`;

        const data = await this.anilistQuery(studioQuery, { search: query });

        if (!data.data?.Page?.studios || data.data.Page.studios.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription(getLang("noResults", query)).setColor(0xED4245)]
            }, isSlash);
        }

        await this.showStudioList(data.data.Page.studios, sentMessage, getLang, user, `Studio Search: ${query}`, isSlash);
    },

    getUserStats: async function ({ message, interaction, query, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loading"))
            .setColor(0x02A9FF);

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const userQuery = `
        query ($name: String) {
            User(name: $name) {
                id
                name
                avatar {
                    large
                }
                bannerImage
                about
                siteUrl
                statistics {
                    anime {
                        count
                        episodesWatched
                        minutesWatched
                        meanScore
                    }
                    manga {
                        count
                        chaptersRead
                        volumesRead
                        meanScore
                    }
                }
                favourites {
                    anime {
                        nodes {
                            title {
                                romaji
                            }
                        }
                    }
                    manga {
                        nodes {
                            title {
                                romaji
                            }
                        }
                    }
                    characters {
                        nodes {
                            name {
                                full
                            }
                        }
                    }
                }
            }
        }`;

        try {
            const data = await this.anilistQuery(userQuery, { name: query });

            if (!data.data?.User) {
                return this.updateMessage(sentMessage, {
                    embeds: [new EmbedBuilder().setDescription(getLang("noResults", query)).setColor(0xED4245)]
                }, isSlash);
            }

            await this.showUserProfile(data.data.User, sentMessage, getLang, user, isSlash);
        } catch (error) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription(getLang("noResults", query)).setColor(0xED4245)]
            }, isSlash);
        }
    },

    getRecommendations: async function ({ message, interaction, query, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("searching"))
            .setColor(0x02A9FF);

        let sentMessage = await this.sendMessage(message, interaction, { embeds: [loadingEmbed] }, isSlash);

        const searchQuery = `
        query ($search: String) {
            Page(page: 1, perPage: 1) {
                media(search: $search, sort: POPULARITY_DESC) {
                    id
                    title {
                        romaji
                        english
                    }
                    recommendations(perPage: 25, sort: RATING_DESC) {
                        nodes {
                            mediaRecommendation {
                                id
                                title {
                                    romaji
                                    english
                                    native
                                }
                                type
                                format
                                status
                                averageScore
                                popularity
                                coverImage {
                                    large
                                }
                                bannerImage
                            }
                        }
                    }
                }
            }
        }`;

        const data = await this.anilistQuery(searchQuery, { search: query });

        if (!data.data?.Page?.media || data.data.Page.media.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription(getLang("noResults", query)).setColor(0xED4245)]
            }, isSlash);
        }

        const sourceMedia = data.data.Page.media[0];
        const recommendations = sourceMedia.recommendations?.nodes
            ?.map(node => node.mediaRecommendation)
            .filter(rec => rec !== null) || [];

        if (recommendations.length === 0) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder()
                    .setDescription(`❌ No recommendations found for: **${sourceMedia.title.english || sourceMedia.title.romaji}**`)
                    .setColor(0xED4245)]
            }, isSlash);
        }

        const sourceTitle = sourceMedia.title.english || sourceMedia.title.romaji;
        await this.showMediaList(recommendations, sentMessage, getLang, user, `💡 Recommendations based on: ${sourceTitle}`, isSlash);
    },

    showMediaList: async function (mediaList, sentMessage, getLang, user, title, isSlash, pageInfo = null) {
        const options = mediaList.slice(0, 25).map((media, index) => {
            const mediaTitle = media.title.english || media.title.romaji || media.title.native;
            const type = media.type === 'ANIME' ? '📺' : '📖';
            const score = media.averageScore ? `⭐${media.averageScore}%` : 'N/A';
            
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${mediaTitle.substring(0, 80)}${mediaTitle.length > 80 ? '...' : ''}`)
                .setDescription(`${type} ${media.format || media.type} | ${score}`)
                .setValue(`${index}`)
                .setEmoji(type);
        });

        const menuId = `al_select_${Date.now()}_${user.id}`;
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuId)
            .setPlaceholder('Select to view detailed information')
            .addOptions(options);

        const row1 = new ActionRowBuilder().addComponents(selectMenu);
        const components = [row1];

        const mediaListText = mediaList.slice(0, 15)
            .map((m, i) => {
                const mediaTitle = m.title.english || m.title.romaji;
                const score = m.averageScore ? `⭐${m.averageScore}%` : 'N/A';
                const type = m.type === 'ANIME' ? '📺' : '📖';
                return `**${i + 1}.** ${mediaTitle} ${type} ${score}`;
            })
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(mediaListText + `\n\n**Total Results:** ${mediaList.length}\n\n*Select from the menu below to view full details!*`)
            .setColor(0x02A9FF)
            .setFooter({ text: `${user.username} | Menu timeout: 5 minutes` })
            .setTimestamp();

        if (mediaList[0]?.bannerImage) {
            embed.setImage(mediaList[0].bannerImage);
        }

        await this.updateMessage(sentMessage, { embeds: [embed], components }, isSlash);

        global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== user.id) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const selectedIndex = parseInt(selectInteraction.values[0]);
            const selectedMedia = mediaList[selectedIndex];

            await selectInteraction.deferUpdate();
            global.RentoBot.onSelectMenu.delete(menuId);

            await this.getMediaDetails(selectedMedia.id, sentMessage, getLang, user, isSlash);
        });

        setTimeout(() => {
            global.RentoBot.onSelectMenu.delete(menuId);
        }, 300000);
    },

    getMediaDetails: async function (mediaId, sentMessage, getLang, user, isSlash) {
        const detailQuery = `
        query ($id: Int) {
            Media(id: $id) {
                id
                title {
                    romaji
                    english
                    native
                }
                type
                format
                status
                description
                startDate {
                    year
                    month
                    day
                }
                endDate {
                    year
                    month
                    day
                }
                season
                seasonYear
                episodes
                chapters
                volumes
                duration
                source
                averageScore
                meanScore
                popularity
                favourites
                trending
                genres
                tags {
                    name
                    rank
                }
                studios {
                    nodes {
                        name
                    }
                }
                coverImage {
                    large
                    extraLarge
                }
                bannerImage
                siteUrl
                characters(perPage: 25, sort: ROLE) {
                    edges {
                        role
                        node {
                            id
                            name {
                                full
                            }
                            image {
                                large
                            }
                        }
                    }
                }
                relations {
                    edges {
                        relationType
                        node {
                            id
                            title {
                                romaji
                                english
                            }
                            siteUrl
                        }
                    }
                }
                recommendations(perPage: 20, sort: RATING_DESC) {
                    nodes {
                        mediaRecommendation {
                            id
                            title {
                                romaji
                                english
                            }
                            averageScore
                        }
                    }
                }
                studios {
                    nodes {
                        name
                        isAnimationStudio
                    }
                }
            }
        }`;

        const data = await this.anilistQuery(detailQuery, { id: mediaId });

        if (!data.data?.Media) {
            return this.updateMessage(sentMessage, {
                embeds: [new EmbedBuilder().setDescription("❌ Failed to load details.").setColor(0xED4245)]
            }, isSlash);
        }

        await this.showMediaDetails(data.data.Media, sentMessage, getLang, user, isSlash);
    },

    showMediaDetails: async function (media, sentMessage, getLang, user, isSlash, section = 'overview') {
        const title = media.title.english || media.title.romaji || media.title.native;
        
        const embed = new EmbedBuilder()
            .setColor(0x02A9FF)
            .setURL(media.siteUrl);

        if (media.coverImage?.extraLarge || media.coverImage?.large) {
            embed.setThumbnail(media.coverImage.extraLarge || media.coverImage.large);
        }

        if (media.bannerImage) {
            embed.setImage(media.bannerImage);
        }

        if (section === 'overview') {
            embed.setTitle(`📖 ${title} - Overview`);
            
            const description = media.description 
                ? media.description.replace(/<[^>]*>/g, '').substring(0, 600) + '...'
                : 'No description available.';
            
            const titleLinks = [];
            if (media.title.romaji) titleLinks.push(`[Romaji: ${media.title.romaji}](${media.siteUrl})`);
            if (media.title.english && media.title.english !== media.title.romaji) {
                titleLinks.push(`[English: ${media.title.english}](${media.siteUrl})`);
            }
            if (media.title.native) titleLinks.push(`Native: ${media.title.native}`);
            
            const titleInfo = titleLinks.length > 0 ? `**Titles:**\n${titleLinks.join('\n')}\n\n` : '';
            
            embed.setDescription(`${titleInfo}${description}`);

            const fields = [];
            
            if (media.averageScore || media.meanScore) {
                const scoreText = media.averageScore ? `⭐ **${media.averageScore}%**` : '';
                const meanText = media.meanScore && media.meanScore !== media.averageScore ? ` (Mean: ${media.meanScore}%)` : '';
                fields.push({ name: '📊 Score', value: `${scoreText}${meanText}`, inline: true });
            }

            if (media.popularity) {
                fields.push({ name: '❤️ Popularity', value: `**${media.popularity.toLocaleString()}** users`, inline: true });
            }

            if (media.favourites) {
                fields.push({ name: '⭐ Favourites', value: `**${media.favourites.toLocaleString()}** users`, inline: true });
            }

            if (media.format) {
                fields.push({ name: '📝 Format', value: media.format.replace(/_/g, ' '), inline: true });
            }

            if (media.status) {
                fields.push({ name: '📡 Status', value: media.status.replace(/_/g, ' '), inline: true });
            }

            if (media.episodes || media.chapters || media.volumes) {
                const content = [];
                if (media.episodes) content.push(`📺 ${media.episodes} episodes`);
                if (media.chapters) content.push(`📖 ${media.chapters} chapters`);
                if (media.volumes) content.push(`📚 ${media.volumes} volumes`);
                if (media.duration) content.push(`⏱️ ${media.duration} min/ep`);
                fields.push({ name: '📊 Content', value: content.join('\n'), inline: true });
            }

            if (media.season && media.seasonYear) {
                fields.push({ name: '📅 Season', value: `${media.season} ${media.seasonYear}`, inline: true });
            }

            if (media.startDate?.year || media.endDate?.year) {
                const dates = [];
                if (media.startDate?.year) {
                    const start = `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, '0')}-${String(media.startDate.day || 1).padStart(2, '0')}`;
                    dates.push(`🎬 Started: ${start}`);
                }
                if (media.endDate?.year) {
                    const end = `${media.endDate.year}-${String(media.endDate.month || 1).padStart(2, '0')}-${String(media.endDate.day || 1).padStart(2, '0')}`;
                    dates.push(`🏁 Ended: ${end}`);
                }
                fields.push({ name: '📆 Air Dates', value: dates.join('\n'), inline: true });
            }

            if (media.source) {
                fields.push({ name: '📚 Source', value: media.source.replace(/_/g, ' '), inline: true });
            }

            if (media.genres && media.genres.length > 0) {
                fields.push({ name: '🎭 Genres', value: media.genres.join(' • '), inline: false });
            }

            if (media.tags && media.tags.length > 0) {
                const topTags = media.tags
                    .filter(t => t.rank >= 60)
                    .slice(0, 8)
                    .map(t => `\`${t.name}\``)
                    .join(' ');
                if (topTags) {
                    fields.push({ name: '🏷️ Tags', value: topTags, inline: false });
                }
            }

            embed.addFields(fields);
        }
        else if (section === 'characters') {
            embed.setTitle(`👥 ${title} - Characters`);
            
            if (!media.characters?.edges || media.characters.edges.length === 0) {
                embed.setDescription('❌ No character information available.');
            } else {
                const mainChars = media.characters.edges.filter(e => e.role === 'MAIN');
                const supportChars = media.characters.edges.filter(e => e.role === 'SUPPORTING');
                
                const charSections = [];
                
                if (mainChars.length > 0) {
                    const mainList = mainChars.slice(0, 10).map(e => {
                        const charName = e.node.name.full;
                        return `• **[${charName}](https://anilist.co/character/${e.node.id})**`;
                    }).join('\n');
                    charSections.push(`**🌟 Main Characters:**\n${mainList}`);
                }
                
                if (supportChars.length > 0) {
                    const supportList = supportChars.slice(0, 10).map(e => {
                        const charName = e.node.name.full;
                        return `• [${charName}](https://anilist.co/character/${e.node.id})`;
                    }).join('\n');
                    charSections.push(`**💫 Supporting Characters:**\n${supportList}`);
                }
                
                embed.setDescription(charSections.join('\n\n'));
                
                if (media.characters.edges.length > 20) {
                    embed.setFooter({ text: `Showing 20 of ${media.characters.edges.length} characters | View all on AniList` });
                }
            }
        }
        else if (section === 'relations') {
            embed.setTitle(`🔗 ${title} - Relations & Connections`);
            
            if (!media.relations?.edges || media.relations.edges.length === 0) {
                embed.setDescription('❌ No related media found.');
            } else {
                const relationGroups = {};
                
                media.relations.edges.forEach(edge => {
                    const relType = edge.relationType.replace(/_/g, ' ');
                    if (!relationGroups[relType]) {
                        relationGroups[relType] = [];
                    }
                    const relTitle = edge.node.title.english || edge.node.title.romaji;
                    relationGroups[relType].push(`• **[${relTitle}](${edge.node.siteUrl || media.siteUrl})**`);
                });
                
                const relationText = Object.entries(relationGroups)
                    .map(([type, items]) => `**${type.toUpperCase()}:**\n${items.slice(0, 5).join('\n')}`)
                    .join('\n\n');
                
                embed.setDescription(relationText);
                
                const totalRelations = media.relations.edges.length;
                if (totalRelations > 0) {
                    embed.setFooter({ text: `Total Relations: ${totalRelations} | Explore the full universe on AniList` });
                }
            }
        }
        else if (section === 'recommendations') {
            embed.setTitle(`💡 ${title} - Recommendations`);
            
            if (!media.recommendations?.nodes || media.recommendations.nodes.length === 0) {
                embed.setDescription('❌ No recommendations available yet.');
            } else {
                const recs = media.recommendations.nodes
                    .filter(n => n.mediaRecommendation)
                    .slice(0, 15)
                    .map((n, index) => {
                        const recMedia = n.mediaRecommendation;
                        const recTitle = recMedia.title.english || recMedia.title.romaji;
                        const score = recMedia.averageScore ? ` ⭐ ${recMedia.averageScore}%` : '';
                        return `**${index + 1}.** [${recTitle}](https://anilist.co/anime/${recMedia.id})${score}`;
                    })
                    .join('\n');
                
                embed.setDescription(`*If you enjoyed this, you might also like:*\n\n${recs}`);
                
                const totalRecs = media.recommendations.nodes.filter(n => n.mediaRecommendation).length;
                if (totalRecs > 15) {
                    embed.setFooter({ text: `Showing 15 of ${totalRecs} recommendations` });
                }
            }
        }
        else if (section === 'staff') {
            embed.setTitle(`🎨 ${title} - Staff & Production`);
            
            const staffSections = [];
            
            if (media.studios?.nodes && media.studios.nodes.length > 0) {
                const studioList = media.studios.nodes
                    .map(s => `• **${s.name}**${s.isAnimationStudio ? ' (Animation Studio)' : ' (Producer)'}`)
                    .join('\n');
                staffSections.push(`**🏢 Studios:**\n${studioList}`);
            }
            
            if (staffSections.length === 0) {
                embed.setDescription('❌ No staff information available.');
            } else {
                embed.setDescription(staffSections.join('\n\n'));
            }
            
            if (media.source) {
                embed.addFields({ name: '📚 Source Material', value: media.source.replace(/_/g, ' '), inline: true });
            }
            
            if (media.season && media.seasonYear) {
                embed.addFields({ name: '📅 Season', value: `${media.season} ${media.seasonYear}`, inline: true });
            }
        }
        else if (section === 'stats') {
            embed.setTitle(`📊 ${title} - Statistics & Info`);
            
            const fields = [];
            
            if (media.averageScore) {
                fields.push({ name: '⭐ Average Score', value: `**${media.averageScore}%**`, inline: true });
            }
            
            if (media.meanScore) {
                fields.push({ name: '📊 Mean Score', value: `**${media.meanScore}%**`, inline: true });
            }
            
            if (media.popularity) {
                fields.push({ name: '❤️ Popularity Rank', value: `**#${media.popularity.toLocaleString()}**`, inline: true });
            }
            
            if (media.favourites) {
                fields.push({ name: '⭐ Total Favourites', value: `**${media.favourites.toLocaleString()}** users`, inline: true });
            }
            
            if (media.trending) {
                fields.push({ name: '🔥 Trending Rank', value: `**#${media.trending}**`, inline: true });
            }
            
            if (media.format) {
                fields.push({ name: '📝 Format', value: media.format.replace(/_/g, ' '), inline: true });
            }
            
            if (media.status) {
                fields.push({ name: '📡 Release Status', value: media.status.replace(/_/g, ' '), inline: true });
            }
            
            if (media.episodes) {
                fields.push({ name: '📺 Total Episodes', value: media.episodes.toString(), inline: true });
            }
            
            if (media.chapters) {
                fields.push({ name: '📖 Total Chapters', value: media.chapters.toString(), inline: true });
            }
            
            if (media.volumes) {
                fields.push({ name: '📚 Total Volumes', value: media.volumes.toString(), inline: true });
            }
            
            if (media.duration) {
                fields.push({ name: '⏱️ Episode Duration', value: `${media.duration} minutes`, inline: true });
            }
            
            if (media.startDate?.year) {
                const start = `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, '0')}-${String(media.startDate.day || 1).padStart(2, '0')}`;
                fields.push({ name: '🎬 Start Date', value: start, inline: true });
            }
            
            if (media.endDate?.year) {
                const end = `${media.endDate.year}-${String(media.endDate.month || 1).padStart(2, '0')}-${String(media.endDate.day || 1).padStart(2, '0')}`;
                fields.push({ name: '🏁 End Date', value: end, inline: true });
            }
            
            embed.addFields(fields);
            embed.setDescription(`**AniList ID:** \`${media.id}\`\n**[🔗 View Full Stats on AniList](${media.siteUrl})**`);
        }

        embed.setFooter({ text: `${user.username} | ${section.toUpperCase()} • Use dropdown to explore` });
        embed.setTimestamp();

        const sectionMenuId = `al_section_${Date.now()}_${user.id}_${media.id}`;
        const sectionMenu = new StringSelectMenuBuilder()
            .setCustomId(sectionMenuId)
            .setPlaceholder('📑 Select a section to view')
            .addOptions([
                new StringSelectMenuOptionBuilder()
                    .setLabel('Overview')
                    .setValue('overview')
                    .setDescription('Basic information and synopsis')
                    .setEmoji('📖')
                    .setDefault(section === 'overview'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Characters')
                    .setValue('characters')
                    .setDescription('Main and supporting characters')
                    .setEmoji('👥')
                    .setDefault(section === 'characters'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Relations')
                    .setValue('relations')
                    .setDescription('Related anime/manga (sequels, prequels, etc.)')
                    .setEmoji('🔗')
                    .setDefault(section === 'relations'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Recommendations')
                    .setValue('recommendations')
                    .setDescription('Similar titles you might enjoy')
                    .setEmoji('💡')
                    .setDefault(section === 'recommendations'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Staff & Production')
                    .setValue('staff')
                    .setDescription('Studios and production details')
                    .setEmoji('🎨')
                    .setDefault(section === 'staff'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Statistics')
                    .setValue('stats')
                    .setDescription('Scores, popularity, and detailed stats')
                    .setEmoji('📊')
                    .setDefault(section === 'stats')
            ]);

        const row1 = new ActionRowBuilder().addComponents(sectionMenu);
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('View on AniList')
                .setStyle(ButtonStyle.Link)
                .setURL(media.siteUrl)
                .setEmoji('🔗')
        );

        await this.updateMessage(sentMessage, { embeds: [embed], components: [row1, row2] }, isSlash);

        global.RentoBot.onSelectMenu.set(sectionMenuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== user.id) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const selectedSection = selectInteraction.values[0];
            await selectInteraction.deferUpdate();
            
            await this.showMediaDetails(media, sentMessage, getLang, user, isSlash, selectedSection);
        });

        setTimeout(() => {
            global.RentoBot.onSelectMenu.delete(sectionMenuId);
        }, 600000);
    },

    showCharacterList: async function (characters, sentMessage, getLang, user, title, isSlash) {
        const options = characters.slice(0, 25).map((char, index) => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${char.name.full.substring(0, 90)}`)
                .setDescription(`❤️ ${char.favourites.toLocaleString()} favourites`)
                .setValue(`${index}`)
                .setEmoji('👤');
        });

        const menuId = `al_char_select_${Date.now()}_${user.id}`;
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuId)
            .setPlaceholder('Select a character to view details')
            .addOptions(options);

        const row1 = new ActionRowBuilder().addComponents(selectMenu);

        const charListText = characters.slice(0, 10)
            .map((c, i) => `**${i + 1}.** ${c.name.full} (❤️ ${c.favourites.toLocaleString()})`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(charListText + `\n\n*Select from the menu below to view full details!*`)
            .setColor(0x02A9FF)
            .setFooter({ text: `${user.username} | Menu timeout: 5 minutes` })
            .setTimestamp();

        if (characters[0]?.image?.large) {
            embed.setThumbnail(characters[0].image.large);
        }

        await this.updateMessage(sentMessage, { embeds: [embed], components: [row1] }, isSlash);

        global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== user.id) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const selectedIndex = parseInt(selectInteraction.values[0]);
            const selectedChar = characters[selectedIndex];

            await selectInteraction.deferUpdate();
            global.RentoBot.onSelectMenu.delete(menuId);

            await this.showCharacterDetails(selectedChar, sentMessage, getLang, user, isSlash);
        });

        setTimeout(() => {
            global.RentoBot.onSelectMenu.delete(menuId);
        }, 300000);
    },

    showCharacterDetails: async function (character, sentMessage, getLang, user, isSlash) {
        const description = character.description 
            ? character.description.replace(/<[^>]*>/g, '').substring(0, 800) + '...'
            : 'No description available.';

        const embed = new EmbedBuilder()
            .setTitle(character.name.full)
            .setDescription(description)
            .setColor(0x02A9FF)
            .setURL(character.siteUrl);

        if (character.image?.large) {
            embed.setThumbnail(character.image.large);
        }

        embed.addFields(
            { name: '❤️ Favourites', value: character.favourites.toLocaleString(), inline: true },
            { name: '🌏 Native Name', value: character.name.native || 'N/A', inline: true }
        );

        if (character.media?.nodes && character.media.nodes.length > 0) {
            const mediaList = character.media.nodes
                .slice(0, 5)
                .map(m => `${m.type === 'ANIME' ? '📺' : '📖'} ${m.title.romaji}`)
                .join('\n');
            embed.addFields({ name: '🎬 Appears In', value: mediaList, inline: false });
        }

        embed.setFooter({ text: `${user.username} | Character ID: ${character.id}` });
        embed.setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('View on AniList')
                .setStyle(ButtonStyle.Link)
                .setURL(character.siteUrl)
                .setEmoji('🔗')
        );

        await this.updateMessage(sentMessage, { embeds: [embed], components: [row] }, isSlash);
    },

    showStaffList: async function (staffList, sentMessage, getLang, user, title, isSlash) {
        const options = staffList.slice(0, 25).map((staff, index) => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${staff.name.full.substring(0, 90)}`)
                .setDescription(`❤️ ${staff.favourites.toLocaleString()} favourites`)
                .setValue(`${index}`)
                .setEmoji('🎨');
        });

        const menuId = `al_staff_select_${Date.now()}_${user.id}`;
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuId)
            .setPlaceholder('Select a staff member to view details')
            .addOptions(options);

        const row1 = new ActionRowBuilder().addComponents(selectMenu);

        const staffListText = staffList.slice(0, 10)
            .map((s, i) => `**${i + 1}.** ${s.name.full} (❤️ ${s.favourites.toLocaleString()})`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(staffListText + `\n\n*Select from the menu below to view full details!*`)
            .setColor(0x02A9FF)
            .setFooter({ text: `${user.username} | Menu timeout: 5 minutes` })
            .setTimestamp();

        if (staffList[0]?.image?.large) {
            embed.setThumbnail(staffList[0].image.large);
        }

        await this.updateMessage(sentMessage, { embeds: [embed], components: [row1] }, isSlash);

        global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== user.id) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const selectedIndex = parseInt(selectInteraction.values[0]);
            const selectedStaff = staffList[selectedIndex];

            await selectInteraction.deferUpdate();
            global.RentoBot.onSelectMenu.delete(menuId);

            await this.showStaffDetails(selectedStaff, sentMessage, getLang, user, isSlash);
        });

        setTimeout(() => {
            global.RentoBot.onSelectMenu.delete(menuId);
        }, 300000);
    },

    showStaffDetails: async function (staff, sentMessage, getLang, user, isSlash) {
        const description = staff.description 
            ? staff.description.replace(/<[^>]*>/g, '').substring(0, 800) + '...'
            : 'No description available.';

        const embed = new EmbedBuilder()
            .setTitle(staff.name.full)
            .setDescription(description)
            .setColor(0x02A9FF)
            .setURL(staff.siteUrl);

        if (staff.image?.large) {
            embed.setThumbnail(staff.image.large);
        }

        embed.addFields(
            { name: '❤️ Favourites', value: staff.favourites.toLocaleString(), inline: true },
            { name: '🌏 Native Name', value: staff.name.native || 'N/A', inline: true }
        );

        if (staff.primaryOccupations && staff.primaryOccupations.length > 0) {
            embed.addFields({ name: '💼 Occupations', value: staff.primaryOccupations.join(', '), inline: false });
        }

        if (staff.staffMedia?.nodes && staff.staffMedia.nodes.length > 0) {
            const mediaList = staff.staffMedia.nodes
                .slice(0, 5)
                .map(m => `${m.type === 'ANIME' ? '📺' : '📖'} ${m.title.romaji}`)
                .join('\n');
            embed.addFields({ name: '🎬 Works', value: mediaList, inline: false });
        }

        embed.setFooter({ text: `${user.username} | Staff ID: ${staff.id}` });
        embed.setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('View on AniList')
                .setStyle(ButtonStyle.Link)
                .setURL(staff.siteUrl)
                .setEmoji('🔗')
        );

        await this.updateMessage(sentMessage, { embeds: [embed], components: [row] }, isSlash);
    },

    showStudioList: async function (studios, sentMessage, getLang, user, title, isSlash) {
        const studioListText = studios.slice(0, 10)
            .map((s, i) => {
                const type = s.isAnimationStudio ? '🎬' : '🏢';
                return `**${i + 1}.** ${type} ${s.name} (❤️ ${s.favourites.toLocaleString()})`;
            })
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(studioListText)
            .setColor(0x02A9FF)
            .setFooter({ text: `${user.username}` })
            .setTimestamp();

        if (studios[0]?.media?.nodes && studios[0].media.nodes.length > 0) {
            const topWorks = studios[0].media.nodes
                .slice(0, 5)
                .map(m => `${m.title.romaji} (⭐${m.averageScore || 'N/A'}%)`)
                .join('\n');
            embed.addFields({ name: `🏆 Top Works by ${studios[0].name}`, value: topWorks, inline: false });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('View on AniList')
                .setStyle(ButtonStyle.Link)
                .setURL(studios[0].siteUrl)
                .setEmoji('🔗')
        );

        await this.updateMessage(sentMessage, { embeds: [embed], components: [row] }, isSlash);
    },

    showUserProfile: async function (userProfile, sentMessage, getLang, user, isSlash) {
        const embed = new EmbedBuilder()
            .setTitle(`👤 ${userProfile.name}'s AniList Profile`)
            .setColor(0x02A9FF)
            .setURL(userProfile.siteUrl);

        if (userProfile.avatar?.large) {
            embed.setThumbnail(userProfile.avatar.large);
        }

        if (userProfile.bannerImage) {
            embed.setImage(userProfile.bannerImage);
        }

        if (userProfile.about) {
            const about = userProfile.about.replace(/<[^>]*>/g, '').substring(0, 300);
            embed.setDescription(about + '...');
        }

        const animeStats = userProfile.statistics.anime;
        const mangaStats = userProfile.statistics.manga;

        embed.addFields(
            { name: '📺 Anime Count', value: animeStats.count.toLocaleString(), inline: true },
            { name: '🎬 Episodes Watched', value: animeStats.episodesWatched.toLocaleString(), inline: true },
            { name: '⏱️ Watch Time', value: `${Math.floor(animeStats.minutesWatched / 60 / 24)} days`, inline: true },
            { name: '⭐ Anime Mean Score', value: `${animeStats.meanScore}/100`, inline: true },
            { name: '📖 Manga Count', value: mangaStats.count.toLocaleString(), inline: true },
            { name: '📚 Chapters Read', value: mangaStats.chaptersRead.toLocaleString(), inline: true }
        );

        if (userProfile.favourites?.anime?.nodes && userProfile.favourites.anime.nodes.length > 0) {
            const favAnime = userProfile.favourites.anime.nodes
                .slice(0, 3)
                .map(a => a.title.romaji)
                .join(', ');
            embed.addFields({ name: '❤️ Favorite Anime', value: favAnime, inline: false });
        }

        if (userProfile.favourites?.manga?.nodes && userProfile.favourites.manga.nodes.length > 0) {
            const favManga = userProfile.favourites.manga.nodes
                .slice(0, 3)
                .map(m => m.title.romaji)
                .join(', ');
            embed.addFields({ name: '❤️ Favorite Manga', value: favManga, inline: false });
        }

        if (userProfile.favourites?.characters?.nodes && userProfile.favourites.characters.nodes.length > 0) {
            const favChars = userProfile.favourites.characters.nodes
                .slice(0, 3)
                .map(c => c.name.full)
                .join(', ');
            embed.addFields({ name: '❤️ Favorite Characters', value: favChars, inline: false });
        }

        embed.setFooter({ text: `${user.username} | User ID: ${userProfile.id}` });
        embed.setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('View Full Profile on AniList')
                .setStyle(ButtonStyle.Link)
                .setURL(userProfile.siteUrl)
                .setEmoji('🔗')
        );

        await this.updateMessage(sentMessage, { embeds: [embed], components: [row] }, isSlash);
    },

    sendMessage: async function (message, interaction, content, isSlash) {
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(content);
                return { interaction, isSlash: true };
            } else {
                await interaction.reply(content);
                return { interaction, isSlash: true };
            }
        } else {
            const sent = await message.reply(content);
            return { message: sent, isSlash: false };
        }
    },

    updateMessage: async function (sentMessage, content, isSlash) {
        if (isSlash) {
            await sentMessage.interaction.editReply(content);
        } else {
            await sentMessage.message.edit(content);
        }
    },

    sendError: function (message, interaction, errorText, isSlash) {
        const errorEmbed = new EmbedBuilder()
            .setDescription(errorText)
            .setColor(0xED4245);

        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                return interaction.editReply({ embeds: [errorEmbed], components: [] });
            } else {
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        } else {
            return message.reply({ embeds: [errorEmbed] });
        }
    }

}