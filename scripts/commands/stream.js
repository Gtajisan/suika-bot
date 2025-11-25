const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: "stream",
        aliases: ["steamapp", "steamgame"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Get detailed information about a Steam game or app.",
            ne: "Steam गेम वा एपको बारेमा विस्तृत जानकारी प्राप्त गर्नुहोस्।"
        },
        category: "info",
        guide: {
            en: "{pn} <game name> — Get info about a Steam game",
            ne: "{pn} <game name> — Steam गेमको बारेमा जानकारी पाउनुहोस्"
        },
        slash: true,
        options: [
            {
                name: "query",
                description: "Name of the Steam game or application",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            loading: "🔍 Searching Steam for **%1**...",
            notFound: "❌ No results found for **%1** on Steam.",
            error: "⚠️ Failed to fetch data from Steam. Please try again later."
        },
        ne: {
            loading: "🔍 Steam मा **%1** खोज्दैछु...",
            notFound: "❌ Steam मा **%1** को परिणाम भेटिएन।",
            error: "⚠️ Steam बाट डेटा ल्याउन सकिन। कृपया पछि प्रयास गर्नुहोस्।"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const query = isSlash ? interaction.options.getString("query") : args.join(" ");
        const user = isSlash ? interaction.user : message.author;

        if (!query) {
            const msg = isSlash ? "Please provide a game name!" : "⚠️ Usage: {pn} <game name>";
            return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
        }

        const loadingMsg = getLang("loading", query);
        let sentMsg;

        try {
            if (isSlash) {
                await interaction.reply(loadingMsg);
                sentMsg = await interaction.fetchReply();
            } else {
                sentMsg = await message.reply(loadingMsg);
            }

            const { data } = await axios.get(`https://api.popcat.xyz/v2/steam?q=${encodeURIComponent(query)}`);

            if (data.error || !data.message) {
                const notFoundMsg = getLang("notFound", query);
                return sentMsg.edit(notFoundMsg);
            }

            const app = data.message;

            // Build embed
            const embed = new EmbedBuilder()
                .setColor("#1b2838")
                .setTitle(app.name || "Unknown Application")
                .setURL(app.website || "https://store.steampowered.com/")
                .setDescription(app.description || "No description available.")
                .setThumbnail(app.thumbnail || null)
                .setImage(app.banner || null)
                .addFields(
                    { name: "🧩 Type", value: app.type ? `\`${app.type}\`` : "Unknown", inline: true },
                    { name: "🎮 Controller Support", value: app.controller_support ? `\`${app.controller_support}\`` : "None", inline: true },
                    { name: "💰 Price", value: app.price ? `**${app.price}**` : "Free / Unknown", inline: true },
                    { 
                        name: "👨‍💻 Developer(s)", 
                        value: app.developers?.length ? app.developers.join(", ") : "Unknown" 
                    },
                    { 
                        name: "🏢 Publisher(s)", 
                        value: app.publishers?.length ? app.publishers.join(", ") : "Unknown" 
                    }
                )
                .setFooter({ 
                    text: `Requested by ${user.username}`, 
                    iconURL: user.displayAvatarURL({ dynamic: true }) 
                })
                .setTimestamp();

            if (isSlash) {
                    await interaction.editReply({ content: "", embeds: [embed] });
                } else {
                    await sentMsg.edit({ content: "", embeds: [embed] });
                }

        } catch (error) {
            console.error("Steam command error:", error);
            const errorMsg = getLang("error");
            if (isSlash) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply(errorMsg);
                } else {
                    await interaction.reply(errorMsg);
                }
            } else {
                if (sentMsg) {
                    await sentMsg.edit(errorMsg);
                } else {
                    await message.reply(errorMsg);
                }
            }
        }
    }
};
