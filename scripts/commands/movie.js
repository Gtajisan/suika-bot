
const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    config: {
        name: "movie",
        aliases: ["film", "imdb"],
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Search for movies and get watch links",
            ne: "चलचित्रहरू खोज्नुहोस् र हेर्न लिङ्कहरू प्राप्त गर्नुहोस्"
        },
        category: "entertainment",
        guide: {
            en: "{prefix}movie <movie name>\nExample: {prefix}movie iron man",
            ne: "{prefix}movie <चलचित्र नाम>\nउदाहरण: {prefix}movie iron man"
        },
        slash: true,
        options: [
            {
                name: "query",
                description: "Movie name to search for",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noQuery: "❌ Please provide a movie name to search!",
            searching: "🔍 Searching for movies...",
            noResults: "❌ No movies found for: **%1**",
            error: "❌ An error occurred while searching: %1",
            selectMovie: "🎬 **Found %1 movies!**\n\nSelect a movie from the dropdown below:",
            timeout: "⏰ Time's up! Search cancelled.",
            invalidChoice: "❌ This is not your selection!",
            loadingDetails: "⏳ Loading movie details...",
            watchNow: "Watch Now",
            director: "Director",
            writers: "Writers",
            stars: "Stars",
            runtime: "Runtime",
            genres: "Genres",
            plot: "Plot",
            languages: "Languages",
            country: "Country"
        },
        ne: {
            noQuery: "❌ कृपया खोज्नको लागि चलचित्र नाम प्रदान गर्नुहोस्!",
            searching: "🔍 चलचित्रहरू खोज्दै...",
            noResults: "❌ कुनै चलचित्र फेला परेन: **%1**",
            error: "❌ खोज गर्दा त्रुटि देखा पर्यो: %1",
            selectMovie: "🎬 **%1 चलचित्रहरू फेला पर्यो!**\n\nतलको ड्रपडाउनबाट चलचित्र चयन गर्नुहोस्:",
            timeout: "⏰ समय सकियो! खोज रद्द गरियो।",
            invalidChoice: "❌ यो तपाईंको छनोट होइन!",
            loadingDetails: "⏳ चलचित्र विवरण लोड गर्दै...",
            watchNow: "अहिले हेर्नुहोस्",
            director: "निर्देशक",
            writers: "लेखक",
            stars: "कलाकार",
            runtime: "अवधि",
            genres: "विधा",
            plot: "कथानक",
            languages: "भाषा",
            country: "देश"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        let query = isSlash ? interaction.options.getString('query') : args.join(" ");

        try {
            if (!query) {
                const response = getLang("noQuery");
                return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }

            const searchingEmbed = new EmbedBuilder()
                .setDescription(getLang("searching"))
                .setColor(0xF5C518)
                .setFooter({ text: user.username });

            let sentMessage;
            if (isSlash) {
                await interaction.reply({ embeds: [searchingEmbed] });
                sentMessage = { interaction, isSlash: true };
            } else {
                sentMessage = await message.reply({ embeds: [searchingEmbed] });
                sentMessage.isSlash = false;
            }

            // Fetch movies from IMDb API
            const apiUrl = `https://api.imdbapi.dev/search/titles?query=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl);

            if (!response.data || !response.data.titles || response.data.titles.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(getLang("noResults", query))
                    .setColor(0xED4245);
                if (sentMessage.isSlash) {
                    return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    return await sentMessage.edit({ embeds: [errorEmbed] });
                }
            }

            // Filter out TV series - only keep movies
            const movies = response.data.titles.filter(title => title.type === 'movie');

            if (movies.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(getLang("noResults", query))
                    .setColor(0xED4245);
                if (sentMessage.isSlash) {
                    return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    return await sentMessage.edit({ embeds: [errorEmbed] });
                }
            }

            // If only one movie, show it directly
            if (movies.length === 1) {
                return await showMovieEmbed(movies[0].id, sentMessage, getLang, user);
            }

            // Multiple movies - show selection menu (limit to 25 for Discord)
            const moviesToShow = movies.slice(0, 25);
            
            const options = moviesToShow.map((movie, index) => {
                const title = movie.primaryTitle.substring(0, 90);
                const year = movie.startYear || 'N/A';
                const rating = movie.rating?.aggregateRating ? `⭐ ${movie.rating.aggregateRating}` : 'No rating';
                
                return new StringSelectMenuOptionBuilder()
                    .setLabel(`${title}${title.length >= 90 ? '...' : ''}`)
                    .setDescription(`${year} | ${rating}`)
                    .setValue(`${movie.id}`)
                    .setEmoji('🎬');
            });

            const menuId = sentMessage.isSlash ? `movie_select_${Date.now()}_${user.id}` : `movie_select_${sentMessage.id}`;
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(menuId)
                .setPlaceholder('Select a movie to watch')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const movieList = moviesToShow
                .map((m, i) => `**${i + 1}.** ${m.primaryTitle} (${m.startYear || 'N/A'}) ${m.rating?.aggregateRating ? `⭐ ${m.rating.aggregateRating}` : ''}`)
                .join('\n');

            const selectEmbed = new EmbedBuilder()
                .setTitle("🎬 Movie Search Results")
                .setDescription(`${getLang("selectMovie", moviesToShow.length)}\n\n${movieList}`)
                .setColor(0xF5C518)
                .setFooter({ text: `${user.username} | Timeout: 60s` })
                .setTimestamp();

            if (sentMessage.isSlash) {
                await sentMessage.interaction.editReply({ embeds: [selectEmbed], components: [row] });
            } else {
                await sentMessage.edit({ embeds: [selectEmbed], components: [row] });
            }

            // Set up select menu handler
            global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
                if (selectInteraction.user.id !== user.id) {
                    return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
                }

                const selectedMovieId = selectInteraction.values[0];
                
                await selectInteraction.deferUpdate();
                await showMovieEmbed(selectedMovieId, sentMessage, getLang, user);
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

        } catch (error) {
            console.error('Movie command error:', error);
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
    }
};

async function showMovieEmbed(movieId, sentMessage, getLang, user) {
    try {
        // Show loading message
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loadingDetails"))
            .setColor(0xF5C518);
        
        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [loadingEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [loadingEmbed], components: [] });
        }

        // Fetch detailed movie information
        const detailsUrl = `https://api.imdbapi.dev/titles/${movieId}`;
        const detailsResponse = await axios.get(detailsUrl);
        const movie = detailsResponse.data;

        // Video server options
        const videoServers = [
            { name: 'VidLink', url: `https://vidlink.pro/movie/${movieId}`, emoji: '🎬' },
            { name: 'VidSrc', url: `https://vidsrc.xyz/embed/movie/${movieId}`, emoji: '📺' },
            { name: 'VidSrc.to', url: `https://vidsrc.to/embed/movie/${movieId}`, emoji: '🎥' },
            { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${movieId}&tmdb=1`, emoji: '⭐' },
            { name: '2Embed', url: `https://www.2embed.cc/embed/${movieId}`, emoji: '🎞️' }
        ];

        // Create buttons for video servers
        const buttons = videoServers.map(server => 
            new ButtonBuilder()
                .setLabel(server.name)
                .setURL(server.url)
                .setStyle(ButtonStyle.Link)
                .setEmoji(server.emoji)
        );

        // Split buttons into rows (max 5 per row)
        const rows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        // Create main embed
        const embed = new EmbedBuilder()
            .setTitle(`🎬 ${movie.primaryTitle}${movie.originalTitle && movie.originalTitle !== movie.primaryTitle ? ` (${movie.originalTitle})` : ''}`)
            .setColor(0xF5C518)
            .setURL(`https://www.imdb.com/title/${movieId}`)
            .setFooter({ text: `_⚠️Note: The watch link contains many ads. We suggest using Brave Browser._\nIMDb ID: ${movieId} | Type: ${movie.type || 'Movie'} | Requested by ${user.username}` })
            .setTimestamp();

        if (movie.primaryImage?.url) {
            embed.setImage(movie.primaryImage.url);
        }

        // Build comprehensive description
        let description = '';
        if (movie.plot) {
            description += `📖 **Plot**\n${movie.plot}\n\n`;
        }
        if (movie.plotSummary && movie.plotSummary.length > 0) {
            description += `📝 **Summary**\n${movie.plotSummary[0].text.substring(0, 200)}${movie.plotSummary[0].text.length > 200 ? '...' : ''}\n\n`;
        }
        description += `🔗 **Click any button below to watch this movie!**`;
        embed.setDescription(description);

        // Add comprehensive movie details as fields
        const fields = [];

        // Year and Type
        const yearInfo = [];
        if (movie.startYear) yearInfo.push(`Start: ${movie.startYear}`);
        if (movie.endYear) yearInfo.push(`End: ${movie.endYear}`);
        if (yearInfo.length > 0) {
            fields.push({ name: '📅 Release', value: yearInfo.join(' | '), inline: true });
        }

        // Runtime
        if (movie.runtimeSeconds) {
            const hours = Math.floor(movie.runtimeSeconds / 3600);
            const minutes = Math.floor((movie.runtimeSeconds % 3600) / 60);
            fields.push({ name: '⏱️ Runtime', value: `${hours}h ${minutes}m`, inline: true });
        }

        // Certificate/Rating
        if (movie.certificate) {
            fields.push({ name: '🔞 Certificate', value: movie.certificate, inline: true });
        }

        // IMDb Rating
        if (movie.rating?.aggregateRating) {
            const ratingText = `⭐ ${movie.rating.aggregateRating}/10`;
            const votesText = movie.rating.voteCount ? `\n📊 ${movie.rating.voteCount.toLocaleString()} votes` : '';
            fields.push({ name: '⭐ IMDb Rating', value: ratingText + votesText, inline: true });
        }

        // Metacritic Score
        if (movie.metacritic?.score) {
            const metaText = `${movie.metacritic.score}/100`;
            const reviewText = movie.metacritic.reviewCount ? `\n📝 ${movie.metacritic.reviewCount} reviews` : '';
            fields.push({ name: '🎯 Metacritic', value: metaText + reviewText, inline: true });
        }

        // Genres
        if (movie.genres && movie.genres.length > 0) {
            fields.push({ name: '🎭 Genres', value: movie.genres.join(', '), inline: true });
        }

        // Director(s)
        if (movie.directors && movie.directors.length > 0) {
            const directors = movie.directors.map(d => d.displayName).join(', ');
            fields.push({ name: '🎬 Director(s)', value: directors, inline: false });
        }

        // Writers
        if (movie.writers && movie.writers.length > 0) {
            const writers = movie.writers.slice(0, 5).map(w => w.displayName).join(', ');
            const moreWriters = movie.writers.length > 5 ? ` +${movie.writers.length - 5} more` : '';
            fields.push({ name: '✍️ Writer(s)', value: writers + moreWriters, inline: false });
        }

        // Stars/Cast
        if (movie.stars && movie.stars.length > 0) {
            const stars = movie.stars.slice(0, 5).map(s => s.displayName).join(', ');
            const moreStars = movie.stars.length > 5 ? ` +${movie.stars.length - 5} more` : '';
            fields.push({ name: '⭐ Cast', value: stars + moreStars, inline: false });
        }

        // Production Companies
        if (movie.productionCompanies && movie.productionCompanies.length > 0) {
            const companies = movie.productionCompanies.slice(0, 3).map(c => c.name).join(', ');
            const moreCompanies = movie.productionCompanies.length > 3 ? ` +${movie.productionCompanies.length - 3} more` : '';
            fields.push({ name: '🏢 Production', value: companies + moreCompanies, inline: false });
        }

        // Languages
        if (movie.spokenLanguages && movie.spokenLanguages.length > 0) {
            const languages = movie.spokenLanguages.map(l => l.name).join(', ');
            fields.push({ name: '🗣️ Languages', value: languages, inline: true });
        }

        // Countries
        if (movie.originCountries && movie.originCountries.length > 0) {
            const countries = movie.originCountries.map(c => c.name).join(', ');
            fields.push({ name: '🌍 Country', value: countries, inline: true });
        }

        // Filming Locations
        if (movie.filmingLocations && movie.filmingLocations.length > 0) {
            const locations = movie.filmingLocations.slice(0, 3).map(l => l.displayName).join(', ');
            const moreLocations = movie.filmingLocations.length > 3 ? ` +${movie.filmingLocations.length - 3} more` : '';
            fields.push({ name: '📍 Filming Locations', value: locations + moreLocations, inline: false });
        }

        // Budget
        if (movie.budget?.amount) {
            const budgetAmount = movie.budget.amount.toLocaleString();
            const currency = movie.budget.currency || 'USD';
            fields.push({ name: '💰 Budget', value: `${currency} ${budgetAmount}`, inline: true });
        }

        // Box Office
        if (movie.boxOffice?.gross?.total?.amount) {
            const grossAmount = movie.boxOffice.gross.total.amount.toLocaleString();
            const currency = movie.boxOffice.gross.total.currency || 'USD';
            fields.push({ name: '💵 Box Office', value: `${currency} ${grossAmount}`, inline: true });
        }

        // Opening Weekend
        if (movie.boxOffice?.openingWeekend?.total?.amount) {
            const openingAmount = movie.boxOffice.openingWeekend.total.amount.toLocaleString();
            const currency = movie.boxOffice.openingWeekend.total.currency || 'USD';
            fields.push({ name: '🎟️ Opening Weekend', value: `${currency} ${openingAmount}`, inline: true });
        }

        // Awards
        if (movie.awards && movie.awards.length > 0) {
            const awardText = movie.awards.slice(0, 2).map(a => `${a.text || a.eventName || 'Award'}`).join(', ');
            const moreAwards = movie.awards.length > 2 ? ` +${movie.awards.length - 2} more` : '';
            fields.push({ name: '🏆 Awards', value: awardText + moreAwards, inline: false });
        }

        // Keywords/Tags
        if (movie.keywords && movie.keywords.length > 0) {
            const keywords = movie.keywords.slice(0, 10).map(k => k.text || k).join(', ');
            fields.push({ name: '🏷️ Keywords', value: keywords, inline: false });
        }

        // Tagline
        if (movie.tagline) {
            fields.push({ name: '💬 Tagline', value: `"${movie.tagline}"`, inline: false });
        }

        // Content Rating
        if (movie.contentRating) {
            fields.push({ name: '🔖 Content Rating', value: movie.contentRating, inline: true });
        }

        // Release Date
        if (movie.releaseDate) {
            fields.push({ name: '📆 Release Date', value: movie.releaseDate, inline: true });
        }

        // Popularity
        if (movie.popularity) {
            fields.push({ name: '📈 Popularity', value: movie.popularity.toString(), inline: true });
        }

        embed.addFields(fields);

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [embed], components: rows });
        } else {
            await sentMessage.edit({ embeds: [embed], components: rows });
        }

    } catch (error) {
        console.error('Error fetching movie details:', error);
        
        // Fallback to basic embed if API fails
        const fallbackEmbed = new EmbedBuilder()
            .setTitle(`🎬 Movie`)
            .setDescription(`⚠️ Could not load detailed information.\n\n🔗 [${getLang("watchNow")}](https://vidlink.pro/movie/${movieId})`)
            .setColor(0xF5C518)
            .setFooter({ text: `IMDb ID: ${movieId} | Requested by ${user.username}` });

        const fallbackButton = new ButtonBuilder()
            .setLabel('Watch on VidLink')
            .setURL(`https://vidlink.pro/movie/${movieId}`)
            .setStyle(ButtonStyle.Link)
            .setEmoji('🎬');

        const row = new ActionRowBuilder().addComponents(fallbackButton);

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [fallbackEmbed], components: [row] });
        } else {
            await sentMessage.edit({ embeds: [fallbackEmbed], components: [row] });
        }
    }
}
