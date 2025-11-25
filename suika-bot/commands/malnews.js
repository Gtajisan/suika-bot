
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    config: {
        name: "malnews",
        aliases: ["animenews", "mal"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Get latest MyAnimeList anime news",
            ne: "पछिल्लो MyAnimeList एनिमे समाचार प्राप्त गर्नुहोस्"
        },
        category: "anime",
        guide: {
            en: "{prefix}malnews - Get latest anime news from MyAnimeList",
            ne: "{prefix}malnews - MyAnimeList बाट पछिल्लो एनिमे समाचार प्राप्त गर्नुहोस्"
        },
        slash: true
    },

    langs: {
        en: {
            fetching: "🔍 Fetching latest anime news from MyAnimeList...",
            error: "❌ An error occurred while fetching news: %1",
            noNews: "❌ No news articles found!",
            newsTitle: "📰 MyAnimeList Latest News",
            selectNews: "📰 **Found %1 news articles!**\n\nSelect an article from the dropdown below to read more:",
            timeout: "⏰ Time's up! News selection cancelled.",
            invalidChoice: "❌ This is not your selection!",
            loadingArticle: "⏳ Loading article...",
            readMore: "Read Full Article",
            page: "Page %1/%2"
        },
        ne: {
            fetching: "🔍 MyAnimeList बाट पछिल्लो एनिमे समाचार ल्याउँदै...",
            error: "❌ समाचार ल्याउँदा त्रुटि देखा पर्यो: %1",
            noNews: "❌ कुनै समाचार लेखहरू फेला परेन!",
            newsTitle: "📰 MyAnimeList पछिल्लो समाचार",
            selectNews: "📰 **%1 समाचार लेखहरू फेला पर्यो!**\n\nथप पढ्न तलको ड्रपडाउनबाट लेख चयन गर्नुहोस्:",
            timeout: "⏰ समय सकियो! समाचार चयन रद्द गरियो।",
            invalidChoice: "❌ यो तपाईंको छनोट होइन!",
            loadingArticle: "⏳ लेख लोड गर्दै...",
            readMore: "पूर्ण लेख पढ्नुहोस्",
            page: "पृष्ठ %1/%2"
        }
    },

    onStart: async function ({ message, interaction, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        try {
            const fetchingEmbed = {}
                // Description: getLang("fetching"*/ //(0x2E51A2)
                .setFooter({ text: user.username });

            let sentMessage;
            if (isSlash) {
                await ctx.reply({ embeds: [fetchingEmbed] });
                sentMessage = await interaction.fetchReply();
                sentMessage.isSlash = true;
                sentMessage.interaction = interaction;
            } else {
                sentMessage = await ctx.reply({ embeds: [fetchingEmbed] });
                sentMessage.isSlash = false;
            }

            // Fetch news from MyAnimeList
            const newsList = await scrapeMALNews();

            if (!newsList || newsList.length === 0) {
                const errorEmbed = {}
                    // Description: getLang("noNews"*/ //(0xED4245);
                
                if (isSlash) {
                    return interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    return sentMessage.edit({ embeds: [errorEmbed] });
                }
            }

            // Show paginated news list
            await showNewsPage(newsList, sentMessage, getLang, user, 0);

        } catch (error) {
            console.error('MAL News command error:', error);
            const errorMsg = getLang("error", error.message || "Unknown error");
            const errorEmbed = {}
                // Description: errorMsg
                ;

            if (isSlash) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    await ctx.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            } else {
                await ctx.reply({ embeds: [errorEmbed] });
            }
        }
    }
};

async function scrapeMALNews() {
    const URL = "https://myanimelist.net/news";
    
    try {
        const { data } = await axios.get(URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
        });

        const $ = cheerio.load(data);
        const newsList = [];

        $(".news-unit.clearfix.rect").each((_, el) => {
            const element = $(el);

            const title = element.find(".title a").text().trim();
            const newsLink = element.find(".title a").attr("href");
            const image = element.find("a.image-link img").attr("src");
            const text = element.find(".text").text().trim();

            const infoText = element.find(".info.di-ib").text().trim();
            const timeMatch = infoText.match(/^(.+?) by/);
            const time = timeMatch ? timeMatch[1].trim() : null;

            const author = element.find(".info.di-ib a").first().text().trim();

            newsList.push({
                title,
                link: newsLink,
                image,
                text,
                time,
                author,
            });
        });

        return newsList;
    } catch (error) {
        console.error('Error scraping MAL news:', error);
        throw error;
    }
}

async function scrapeNewsArticle(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
        });

        const $ = cheerio.load(data);

        const title = $(".news-container h1.title a").text().trim();
        const author = $(".news-info-block .information a").first().text().trim();
        const time = $(".news-info-block .information")
            .text()
            .split("by")[1]
            ?.split("|")[0]
            ?.replace(author, "")
            ?.trim()
            ?.replace(/\s*\|\s*$/, "");

        const image = $(".content img.userimg").attr("src") || null;

        const contentEl = $(".content").clone();
        contentEl.find("script, style, .sns-unit, img").remove();

        contentEl.find("a").each((_, a) => {
            const text = $(a).text().trim();
            const href = $(a).attr("href");
            if (text && href) {
                $(a).replaceWith(`[${text}](${href})`);
            } else {
                $(a).replaceWith(text);
            }
        });

        contentEl.find("br").replaceWith("\n\n");

        let content = contentEl.text().trim();
        content = content.replace(/\n{3,}/g, "\n\n");

        content = content
            .replace(/Staff\s*\n/, "**Staff**\n")
            .replace(/^Source:/m, "**Source:**");

        return {
            title,
            author,
            time,
            image,
            content,
        };
    } catch (error) {
        console.error('Error scraping article:', error);
        throw error;
    }
}

async function showNewsPage(newsList, sentMessage, getLang, user, page) {
    const newsPerPage = 5;
    const totalPages = Math.ceil(newsList.length / newsPerPage);
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));
    
    const startIdx = currentPage * newsPerPage;
    const endIdx = Math.min(startIdx + newsPerPage, newsList.length);
    const pageNews = newsList.slice(startIdx, endIdx);

    // Build news list description
    let description = `${getLang("selectNews", newsList.length)}\n\n`;
    
    pageNews.forEach((news, idx) => {
        const globalIdx = startIdx + idx;
        description += `**${globalIdx + 1}.** ${news.title}\n`;
        description += `📝 ${news.text.substring(0, 100)}${news.text.length > 100 ? '...' : ''}\n`;
        description += `👤 ${news.author} • 🕐 ${news.time}\n\n`;
    });

    const embed = {}
        // Title: getLang("newsTitle")
        // Description: description
        
        .setFooter({ text: `${user.username} | ${getLang("page", currentPage + 1, totalPages)} | Timeout: 60s` })
        .setTimestamp();

    if (pageNews[0]?.image) {
        embed// Thumbnail: pageNews[0].image;
    }

    // Create select menu with current page items
    const options = pageNews.map((news, idx) => {
        const globalIdx = startIdx + idx;
        const title = news.title.substring(0, 90);
        const description = `${news.author} • ${news.time}`.substring(0, 100);
        
        return new StringSelectMenuOptionBuilder()
            .setLabel(`${globalIdx + 1}. ${title}${title.length >= 90 ? '...' : ''}`)
            // Description: description
            .setValue(`${globalIdx}`)
            .setEmoji('📰');
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`malnews_select_${sentMessage.id}`)
        .setPlaceholder('Select a news article to read')
        .addOptions(options);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    // Create pagination buttons
    const buttonRow = new ActionRowBuilder();
    
    buttonRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`malnews_back_${sentMessage.id}`)
            .setLabel('◀ Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
        new ButtonBuilder()
            .setCustomId(`malnews_next_${sentMessage.id}`)
            .setLabel('Next ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === totalPages - 1),
        new ButtonBuilder()
            .setLabel('MyAnimeList')
            .setURL('https://myanimelist.net/news')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🌐')
    );

    if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [embed], components: [selectRow, buttonRow] });
    } else {
        await sentMessage.edit({ embeds: [embed], components: [selectRow, buttonRow] });
    }

    // Set up select menu handler
    const selectMenuId = `malnews_select_${sentMessage.id}`;
    global.RentoBot.onSelectMenu.set(selectMenuId, async (selectInteraction) => {
        if (selectInteraction.user.id !== user.id) {
            return selectInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        const selectedIdx = parseInt(selectInteraction.values[0]);
        const selectedNews = newsList[selectedIdx];
        
        await selectInteraction.deferUpdate();
        await showArticle(selectedNews, sentMessage, getLang, user, newsList);
    });

    // Set up button handlers
    const backButtonId = `malnews_back_${sentMessage.id}`;
    const nextButtonId = `malnews_next_${sentMessage.id}`;

    global.RentoBot.onButton.set(backButtonId, async (buttonInteraction) => {
        if (buttonInteraction.user.id !== user.id) {
            return buttonInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        await buttonInteraction.deferUpdate();
        global.RentoBot.onButton.delete(backButtonId);
        global.RentoBot.onButton.delete(nextButtonId);
        await showNewsPage(newsList, sentMessage, getLang, user, currentPage - 1);
    });

    global.RentoBot.onButton.set(nextButtonId, async (buttonInteraction) => {
        if (buttonInteraction.user.id !== user.id) {
            return buttonInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
        }

        await buttonInteraction.deferUpdate();
        global.RentoBot.onButton.delete(backButtonId);
        global.RentoBot.onButton.delete(nextButtonId);
        await showNewsPage(newsList, sentMessage, getLang, user, currentPage + 1);
    });

    // Timeout cleanup
    setTimeout(() => {
        if (global.RentoBot.onSelectMenu.has(selectMenuId)) {
            const timeoutEmbed = {}
                // Description: getLang("timeout"*/ //(0x95A5A6);

            if (sentMessage.isSlash) {
                sentMessage.interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            } else {
                sentMessage.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
            global.RentoBot.onSelectMenu.delete(selectMenuId);
            global.RentoBot.onButton.delete(backButtonId);
            global.RentoBot.onButton.delete(nextButtonId);
        }
    }, 60000);
}

async function showArticle(newsItem, sentMessage, getLang, user, newsList) {
    try {
        const loadingEmbed = {}
            // Description: getLang("loadingArticle"*/ //(0x2E51A2);
        
        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [loadingEmbed], components: [] });
        } else {
            await sentMessage.edit({ embeds: [loadingEmbed], components: [] });
        }

        // Fetch full article content
        const article = await scrapeNewsArticle(newsItem.link);

        // Truncate content to fit Discord's 4096 character limit
        let content = article.content;
        const maxContentLength = 3800;
        
        if (content.length > maxContentLength) {
            content = content.substring(0, maxContentLength) + `...\n\n*Content truncated. [${getLang("readMore")}](${newsItem.link})*`;
        }

        const embed = {}
            // Title: `📰 ${article.title || newsItem.title}`
            // Description: content
            
            .setURL(newsItem.link)
            .setFooter({ text: `By ${article.author || newsItem.author} | ${article.time || newsItem.time} | Requested by ${user.username}` })
            .setTimestamp();

        if (article.image || newsItem.image) {
            embed// Image: article.image || newsItem.image;
        }

        // Create buttons
        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`malnews_back_to_list_${sentMessage.id}`)
                .setLabel('◀ Back to List')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setLabel(getLang("readMore"))
                .setURL(newsItem.link)
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔗'),
            new ButtonBuilder()
                .setLabel('MyAnimeList')
                .setURL('https://myanimelist.net/news')
                .setStyle(ButtonStyle.Link)
                .setEmoji('🌐')
        );

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [embed], components: [buttonRow] });
        } else {
            await sentMessage.edit({ embeds: [embed], components: [buttonRow] });
        }

        // Set up back button handler
        const backButtonId = `malnews_back_to_list_${sentMessage.id}`;
        global.RentoBot.onButton.set(backButtonId, async (buttonInteraction) => {
            if (buttonInteraction.user.id !== user.id) {
                return buttonInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            await buttonInteraction.deferUpdate();
            global.RentoBot.onButton.delete(backButtonId);
            await showNewsPage(newsList, sentMessage, getLang, user, 0);
        });

    } catch (error) {
        console.error('Error showing article:', error);
        
        // Fallback embed if scraping fails
        const fallbackEmbed = {}
            // Title: `📰 ${newsItem.title}`
            // Description: `${newsItem.text}\n\n[${getLang("readMore"}](${newsItem.link})`*/ //(0x2E51A2)
            .setURL(newsItem.link)
            .setFooter({ text: `By ${newsItem.author} | ${newsItem.time} | Requested by ${user.username}` })
            .setTimestamp();

        if (newsItem.image) {
            fallbackEmbed// Image: newsItem.image;
        }

        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`malnews_back_to_list_${sentMessage.id}`)
                .setLabel('◀ Back to List')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setLabel(getLang("readMore"))
                .setURL(newsItem.link)
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔗')
        );

        if (sentMessage.isSlash) {
            await sentMessage.interaction.editReply({ embeds: [fallbackEmbed], components: [buttonRow] });
        } else {
            await sentMessage.edit({ embeds: [fallbackEmbed], components: [buttonRow] });
        }

        const backButtonId = `malnews_back_to_list_${sentMessage.id}`;
        global.RentoBot.onButton.set(backButtonId, async (buttonInteraction) => {
            if (buttonInteraction.user.id !== user.id) {
                return buttonInteraction.reply({ content: getLang("invalidChoice"), ephemeral: true });
            }

            await buttonInteraction.deferUpdate();
            global.RentoBot.onButton.delete(backButtonId);
            await showNewsPage(newsList, sentMessage, getLang, user, 0);
        });
    }
}
