
const axios = require('axios');
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "wiki",
        aliases: ["wikipedia", "w"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and browse Wikipedia articles with detailed information",
            ne: "विस्तृत जानकारी सहित Wikipedia लेखहरू खोज्नुहोस् र ब्राउज गर्नुहोस्"
        },
        category: "utility",
        guide: {
            en: "{prefix}wiki <search query> - Search Wikipedia\n{prefix}wiki <search query> -lang <language code> - Search in specific language\n\nExamples:\n• {prefix}wiki Albert Einstein\n• {prefix}wiki Python -lang en\n• {prefix}wiki Tokyo -lang ja",
            ne: "{prefix}wiki <खोजी> - Wikipedia खोज्नुहोस्\n{prefix}wiki <खोजी> -lang <भाषा कोड> - विशिष्ट भाषामा खोज्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "query",
                description: "Search query for Wikipedia",
                type: 3,
                required: true
            },
            {
                name: "language",
                description: "Language code (en, es, fr, de, ja, etc.)",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noQuery: "❌ Please provide a search query!",
            searching: "🔍 Searching Wikipedia...",
            noResults: "❌ No Wikipedia articles found for: **%1**",
            error: "❌ An error occurred: %1",
            selectArticle: "📚 **Found %1 articles!**\n\nSelect an article from the dropdown:",
            timeout: "⏰ Selection timeout! Command cancelled.",
            invalidChoice: "❌ This is not your selection!",
            loadingArticle: "⏳ Loading article details...",
            summary: "Summary",
            fullArticle: "Full Article",
            categories: "Categories",
            coordinates: "Coordinates",
            lastModified: "Last Modified",
            pageId: "Page ID",
            viewOnWiki: "View on Wikipedia",
            relatedArticles: "Related Articles",
            languages: "Available in %1 languages"
        },
        ne: {
            noQuery: "❌ कृपया खोजी प्रदान गर्नुहोस्!",
            searching: "🔍 Wikipedia खोज्दै...",
            noResults: "❌ कुनै Wikipedia लेख फेला परेन: **%1**",
            error: "❌ त्रुटि देखा पर्यो: %1",
            selectArticle: "📚 **%1 लेखहरू फेला पर्यो!**\n\nड्रपडाउनबाट लेख चयन गर्नुहोस्:",
            timeout: "⏰ चयन समय समाप्त! आदेश रद्द गरियो।",
            invalidChoice: "❌ यो तपाईंको छनोट होइन!",
            loadingArticle: "⏳ लेख विवरण लोड गर्दै...",
            summary: "सारांश",
            fullArticle: "पूर्ण लेख",
            categories: "श्रेणीहरू",
            coordinates: "निर्देशांक",
            lastModified: "अन्तिम संशोधन",
            pageId: "पृष्ठ ID",
            viewOnWiki: "Wikipedia मा हेर्नुहोस्",
            relatedArticles: "सम्बन्धित लेखहरू",
            languages: "%1 भाषाहरूमा उपलब्ध"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        let query = '';
        let language = 'en';

        if (isSlash) {
            query = interaction.options.getString('query');
            language = interaction.options.getString('language') || 'en';
        } else {
            if (args.length === 0) {
                return message.reply(getLang("noQuery"));
            }

            const langIndex = args.findIndex(arg => arg === '-lang');
            if (langIndex !== -1 && args[langIndex + 1]) {
                language = args[langIndex + 1];
                args.splice(langIndex, 2);
            }

            query = args.join(' ');
        }

        if (!query) {
            const msg = getLang("noQuery");
            return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
        }

        try {
            const searchingEmbed = new EmbedBuilder()
                .setDescription(getLang("searching"))
                .setColor(0x000000)
                .setFooter({ text: user.username, iconURL: user.displayAvatarURL() });

            let sentMessage;
            if (isSlash) {
                await interaction.reply({ embeds: [searchingEmbed] });
                sentMessage = { interaction, isSlash: true };
            } else {
                sentMessage = await message.reply({ embeds: [searchingEmbed] });
                sentMessage.isSlash = false;
            }

            const searchResults = await searchWikipedia(query, language);

            if (!searchResults || searchResults.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(getLang("noResults", query))
                    .setColor(0xED4245);
                
                if (sentMessage.isSlash) {
                    return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    return await sentMessage.edit({ embeds: [errorEmbed] });
                }
            }

            if (searchResults.length === 1) {
                await this.showArticle(searchResults[0], sentMessage, getLang, user, language);
            } else {
                await this.showSearchResults(searchResults, sentMessage, getLang, user, language);
            }

        } catch (error) {
            console.error('Wikipedia command error:', error);
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

    showSearchResults: async function (results, sentMessage, getLang, user, language) {
        const options = results.slice(0, 25).map((article, index) => {
            const title = article.title.substring(0, 90);
            const description = (article.description || 'Wikipedia article').substring(0, 100);
            
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${title}${title.length >= 90 ? '...' : ''}`)
                .setDescription(description)
                .setValue(`${index}`)
                .setEmoji('📄');
        });

        const menuId = sentMessage.isSlash ? 
            `wiki_select_${Date.now()}_${user.id}` : 
            `wiki_select_${sentMessage.id}`;

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuId)
            .setPlaceholder('Select an article to read')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const articleList = results.slice(0, 10)
            .map((a, i) => {
                const desc = a.description ? ` - ${a.description}` : '';
                return `**${i + 1}.** ${a.title}${desc}`;
            })
            .join('\n');

        const selectEmbed = new EmbedBuilder()
            .setTitle("📚 Wikipedia Search Results")
            .setDescription(`${getLang("selectArticle", results.length)}\n\n${articleList}`)
            .setColor(0x000000)
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png')
            .setFooter({ text: `${user.username} | Language: ${language.toUpperCase()} | Timeout: 60s`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [selectEmbed], components: [row] });
        } else {
            await sentMessage.edit({ embeds: [selectEmbed], components: [row] });
        }

        global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
            if (selectInteraction.user.id !== user.id) {
                return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            const selectedIndex = parseInt(selectInteraction.values[0]);
            const selectedArticle = results[selectedIndex];

            await selectInteraction.deferUpdate();
            global.RentoBot.onSelectMenu.delete(menuId);

            await this.showArticle(selectedArticle, sentMessage, getLang, user, language);
        });

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
    },

    showArticle: async function (article, sentMessage, getLang, user, language) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("loadingArticle"))
            .setColor(0x000000);

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [loadingEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [loadingEmbed], components: [] });
        }

        const details = await getArticleDetails(article.pageid, language);

        const embed = new EmbedBuilder()
            .setTitle(`📖 ${details.title}`)
            .setURL(details.url)
            .setColor(0x000000);

        if (details.thumbnail) {
            embed.setThumbnail(details.thumbnail);
        }

        if (details.image) {
            embed.setImage(details.image);
        }

        let description = details.extract || 'No description available.';
        if (description.length > 2000) {
            description = description.substring(0, 1997) + '...';
        }
        embed.setDescription(description);

        const fields = [];

        if (details.description) {
            fields.push({ name: '📝 Description', value: details.description, inline: false });
        }

        if (details.categories && details.categories.length > 0) {
            const categories = details.categories.slice(0, 5).join(', ');
            fields.push({ name: '🏷️ Categories', value: categories, inline: false });
        }

        if (details.coordinates) {
            const coords = `${details.coordinates.lat}, ${details.coordinates.lon}`;
            fields.push({ name: '📍 Coordinates', value: coords, inline: true });
        }

        if (details.pageprops?.wikibase_item) {
            fields.push({ name: '🆔 Wikidata ID', value: details.pageprops.wikibase_item, inline: true });
        }

        fields.push({ name: '📄 Page ID', value: details.pageid.toString(), inline: true });

        if (details.touched) {
            const lastModified = new Date(details.touched).toLocaleDateString();
            fields.push({ name: '🕐 Last Modified', value: lastModified, inline: true });
        }

        if (details.langlinks && details.langlinks.length > 0) {
            fields.push({ name: '🌍 Languages', value: getLang("languages", details.langlinks.length), inline: true });
        }

        if (details.length) {
            const words = Math.floor(details.length / 6);
            fields.push({ name: '📊 Article Length', value: `${words.toLocaleString()} words (approx.)`, inline: true });
        }

        embed.addFields(fields);

        embed.setFooter({ 
            text: `Wikipedia ${language.toUpperCase()} | Requested by ${user.username}`, 
            iconURL: user.displayAvatarURL() 
        });
        embed.setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('View on Wikipedia')
                .setURL(details.url)
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔗'),
            new ButtonBuilder()
                .setLabel('Mobile View')
                .setURL(details.mobileUrl)
                .setStyle(ButtonStyle.Link)
                .setEmoji('📱')
        );

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [embed], components: [row] });
        } else {
            await sentMessage.edit({ embeds: [embed], components: [row] });
        }
    }
};

async function searchWikipedia(query, language = 'en') {
    try {
        const searchUrl = `https://${language}.wikipedia.org/w/api.php`;
        const params = {
            action: 'query',
            list: 'search',
            srsearch: query,
            format: 'json',
            srlimit: 10,
            srprop: 'snippet|titlesnippet|sectionsnippet'
        };

        const { data } = await axios.get(searchUrl, { 
            params,
            headers: {
                'User-Agent': 'RentoBot Discord Bot/1.0 (https://github.com/notsopreety; contact@samirb.com.np)'
            }
        });

        if (!data.query || !data.query.search || data.query.search.length === 0) {
            return [];
        }

        return data.query.search.map(result => ({
            pageid: result.pageid,
            title: result.title,
            description: result.snippet.replace(/<[^>]*>/g, '').substring(0, 100)
        }));
    } catch (error) {
        console.error('Wikipedia search error:', error);
        throw new Error('Failed to search Wikipedia');
    }
}

async function getArticleDetails(pageid, language = 'en') {
    try {
        const apiUrl = `https://${language}.wikipedia.org/w/api.php`;
        const params = {
            action: 'query',
            pageids: pageid,
            prop: 'extracts|pageimages|info|categories|langlinks|pageprops|coordinates',
            exintro: true,
            explaintext: true,
            piprop: 'thumbnail|original',
            pithumbsize: 500,
            inprop: 'url|displaytitle',
            cllimit: 10,
            lllimit: 500,
            format: 'json'
        };

        const { data } = await axios.get(apiUrl, { 
            params,
            headers: {
                'User-Agent': 'RentoBot Discord Bot/1.0 (https://github.com/notsopreety; contact@samirb.com.np)'
            }
        });

        const page = data.query.pages[pageid];

        return {
            pageid: page.pageid,
            title: page.title,
            url: page.fullurl,
            mobileUrl: page.fullurl.replace('wikipedia.org', 'm.wikipedia.org'),
            extract: page.extract,
            description: page.pageprops?.['wikibase-shortdesc'] || null,
            thumbnail: page.thumbnail?.source || null,
            image: page.original?.source || null,
            categories: page.categories ? page.categories.map(c => c.title.replace('Category:', '')) : [],
            langlinks: page.langlinks || [],
            coordinates: page.coordinates ? page.coordinates[0] : null,
            pageprops: page.pageprops || {},
            touched: page.touched,
            length: page.length
        };
    } catch (error) {
        console.error('Wikipedia article details error:', error);
        throw new Error('Failed to fetch article details');
    }
}
