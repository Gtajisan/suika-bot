const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    config: {
        name: "meme",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Get a random meme from Reddit",
            ne: "Reddit बाट अनियमित meme प्राप्त गर्नुहोस्"
        },
        category: "fun",
        guide: {
            en: "{prefix}meme\n"
                + "Example: {prefix}meme\n"
                + "Get a random meme from various subreddits",
            ne: "{prefix}meme\n"
                + "उदाहरण: {prefix}meme\n"
                + "विभिन्न subreddits बाट अनियमित meme प्राप्त गर्नुहोस्"
        },
        slash: true
    },

    langs: {
        en: {
            error: "❌ An error occurred while fetching the meme: %1",
            loading: "🎲 Fetching a fresh meme for you...",
            nsfwWarning: "⚠️ This meme is marked as NSFW",
            spoilerWarning: "⚠️ This meme contains spoilers"
        },
        ne: {
            error: "❌ Meme प्राप्त गर्दा त्रुटि देखा पर्यो: %1",
            loading: "🎲 तपाईंको लागि नयाँ meme प्राप्त गर्दै...",
            nsfwWarning: "⚠️ यो meme NSFW को रूपमा चिन्ह लगाइएको छ",
            spoilerWarning: "⚠️ यो meme मा spoilers छन्"
        }
    },

    onStart: async ({ message, interaction, getLang }) => {
        try {
            // Defer the interaction immediately to prevent timeout
            if (interaction && !interaction.deferred && !interaction.replied) {
                await interaction.deferReply();
            }

            // Fetch meme from API
            const response = await axios.get('https://meme-api.com/gimme', {
                timeout: 10000
            });

            const memeData = response.data;

            // Validate response
            if (!memeData || !memeData.url) {
                const errorMsg = getLang('error', 'Invalid response from API');
                return message 
                    ? message.reply(errorMsg) 
                    : interaction.editReply(errorMsg);
            }

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(`😂 ${memeData.title || 'Random Meme'}`)
                .setDescription(
                    `**Subreddit:** r/${memeData.subreddit || 'unknown'}\n` +
                    `**Author:** u/${memeData.author || 'unknown'}\n` +
                    `**Upvotes:** ⬆️ ${memeData.ups || 0}`
                )
                .setImage(memeData.url)
                .setColor(0xFF6B6B)
                .setURL(memeData.postLink || memeData.url)
                .setFooter({ 
                    text: memeData.nsfw ? '⚠️ NSFW Content' : 'Click the title to view on Reddit',
                    iconURL: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png'
                })
                .setTimestamp();

            // Add warnings if needed
            if (memeData.nsfw) {
                embed.addFields({ 
                    name: '⚠️ Content Warning', 
                    value: getLang('nsfwWarning'), 
                    inline: false 
                });
            }

            if (memeData.spoiler) {
                embed.addFields({ 
                    name: '⚠️ Spoiler Warning', 
                    value: getLang('spoilerWarning'), 
                    inline: false 
                });
            }

            // Create button for generating another meme
            const userId = message ? message.author.id : interaction.user.id;
            const buttonId = `meme_another_${userId}_${Date.now()}`;
            
            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(buttonId)
                        .setLabel('🎲 Another Meme')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎲')
                );

            // Send the meme
            const replyOptions = {
                embeds: [embed],
                components: [buttonRow]
            };

            let sentMessage;
            if (message) {
                sentMessage = await message.reply(replyOptions);
            } else {
                sentMessage = await interaction.editReply(replyOptions);
            }

            // Create button handler function
            const createButtonHandler = (currentButtonId) => {
                return async (btnInteraction) => {
                    // Check if it's the right user
                    if (btnInteraction.user.id !== userId) {
                        return btnInteraction.reply({ 
                            content: "❌ This button is not for you!", 
                            ephemeral: true 
                        });
                    }

                    // Defer to prevent timeout
                    await btnInteraction.deferUpdate();

                    try {
                        // Fetch new meme
                        const newResponse = await axios.get('https://meme-api.com/gimme', {
                            timeout: 10000
                        });

                        const newMemeData = newResponse.data;

                        if (!newMemeData || !newMemeData.url) {
                            const errorEmbed = new EmbedBuilder()
                                .setDescription(getLang('error', 'Invalid response from API'))
                                .setColor(0xED4245)
                                .setTimestamp();

                            // Clean up handler
                            global.RentoBot.onButton.delete(currentButtonId);
                            
                            return btnInteraction.editReply({ 
                                embeds: [errorEmbed], 
                                components: [] 
                            });
                        }

                        // Create new embed
                        const newEmbed = new EmbedBuilder()
                            .setTitle(`😂 ${newMemeData.title || 'Random Meme'}`)
                            .setDescription(
                                `**Subreddit:** r/${newMemeData.subreddit || 'unknown'}\n` +
                                `**Author:** u/${newMemeData.author || 'unknown'}\n` +
                                `**Upvotes:** ⬆️ ${newMemeData.ups || 0}`
                            )
                            .setImage(newMemeData.url)
                            .setColor(0xFF6B6B)
                            .setURL(newMemeData.postLink || newMemeData.url)
                            .setFooter({ 
                                text: newMemeData.nsfw ? '⚠️ NSFW Content' : 'Click the title to view on Reddit',
                                iconURL: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png'
                            })
                            .setTimestamp();

                        // Add warnings if needed
                        if (newMemeData.nsfw) {
                            newEmbed.addFields({ 
                                name: '⚠️ Content Warning', 
                                value: getLang('nsfwWarning'), 
                                inline: false 
                            });
                        }

                        if (newMemeData.spoiler) {
                            newEmbed.addFields({ 
                                name: '⚠️ Spoiler Warning', 
                                value: getLang('spoilerWarning'), 
                                inline: false 
                            });
                        }

                        // Create new button with new ID
                        const newButtonId = `meme_another_${userId}_${Date.now()}`;
                        const newButtonRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(newButtonId)
                                    .setLabel('🎲 Another Meme')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('🎲')
                            );

                        // Update message
                        await btnInteraction.editReply({
                            embeds: [newEmbed],
                            components: [newButtonRow]
                        });

                        // Clean up old handler
                        global.RentoBot.onButton.delete(currentButtonId);
                        
                        // Create and register new handler
                        const newHandler = createButtonHandler(newButtonId);
                        global.RentoBot.onButton.set(newButtonId, newHandler);

                        // Auto-cleanup new handler after 5 minutes
                        setTimeout(() => {
                            global.RentoBot.onButton.delete(newButtonId);
                        }, 300000);

                    } catch (error) {
                        console.error('[MEME] Error fetching new meme:', error);
                        
                        const errorEmbed = new EmbedBuilder()
                            .setDescription(getLang('error', error.message || 'Unknown error'))
                            .setColor(0xED4245)
                            .setTimestamp();

                        await btnInteraction.editReply({ 
                            embeds: [errorEmbed], 
                            components: [] 
                        });

                        // Clean up handler
                        global.RentoBot.onButton.delete(currentButtonId);
                    }
                };
            };

            // Create initial button handler
            const buttonHandler = createButtonHandler(buttonId);

            // Register the button handler
            global.RentoBot.onButton.set(buttonId, buttonHandler);

            // Auto-cleanup handler after 5 minutes to prevent memory leaks
            setTimeout(() => {
                global.RentoBot.onButton.delete(buttonId);
            }, 300000); // 5 minutes

        } catch (error) {
            console.error('[MEME] Error:', error);
            
            const errorMsg = getLang('error', error.message || 'Unknown error');
            
            if (message) {
                return message.reply(errorMsg);
            } else {
                if (interaction.deferred) {
                    return interaction.editReply(errorMsg);
                } else {
                    return interaction.reply({ content: errorMsg, ephemeral: true });
                }
            }
        }
    }
};

