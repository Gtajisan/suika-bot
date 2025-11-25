
const axios = require("axios");
const { createWriteStream, unlinkSync } = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");

module.exports = {
  config: {
    name: "spotify",
    version: "5.0",
    author: "Samir",
    countDown: 60,
    role: 0,
    description: {
      en: "Download Spotify tracks",
      ne: "स्पोटिफाइ ट्र्याकहरू डाउनलोड गर्नुहोस्",
    },
    category: "downloader",
    guide: {
      en: "{prefix}spotify <url or search query>",
      ne: "{prefix}spotify <URL वा खोजी>",
    },
    slash: true,
    options: [
      {
        name: "query",
        description: "Spotify URL or search query",
        type: 3,
        required: true
      }
    ]
  },

  langs: {
    en: {
      noInput: "❌ Please provide a Spotify track URL or search query.",
      loading: "🎵 Fetching Spotify track info...",
      processing: "⏬ Downloading track...",
      error: "❌ Sorry, I couldn't download the Spotify track.",
      noMediaFound: "❌ No tracks found for your query.",
      downloadFailed: "❌ Download failed. The track may be unavailable.",
      chooseTrack: "🎵 **Found %1 tracks!**\n\nSelect from the dropdown below or reply with the number (1-%1) to download:",
      invalidChoice: "❌ Invalid choice! Please reply with a number between 1 and %1.",
      timeout: "⏰ Time's up! Command cancelled.",
      downloading: "⏬ Downloading: **%1 - %2**",
      success: "✅ Downloaded: **%1 - %2**"
    },
    ne: {
      noInput: "❌ कृपया स्पोटिफाइ ट्र्याक URL वा खोजी प्रदान गर्नुहोस्।",
      loading: "🎵 स्पोटिफाइ ट्र्याक जानकारी ल्याउँदै...",
      processing: "⏬ ट्र्याक डाउनलोड गर्दै...",
      error: "❌ माफ गर्नुहोस्, म स्पोटिफाइ ट्र्याक डाउनलोड गर्न सकिन।",
      noMediaFound: "❌ तपाईंको खोजीको लागि कुनै ट्र्याक फेला परेन।",
      downloadFailed: "❌ डाउनलोड असफल भयो। ट्र्याक उपलब्ध नहुन सक्छ।",
      chooseTrack: "🎵 **%1 ट्र्याकहरू फेला पर्यो!**\n\nडाउनलोड गर्न तलको ड्रपडाउनबाट चयन गर्नुहोस् वा संख्या (1-%1) संग जवाफ दिनुहोस्:",
      invalidChoice: "❌ अवैध छनोट! कृपया 1 र %1 बीचको संख्यासँग जवाफ दिनुहोस्।",
      timeout: "⏰ समय सकियो! आदेश रद्द गरियो।",
      downloading: "⏬ डाउनलोड गर्दै: **%1 - %2**",
      success: "✅ डाउनलोड भयो: **%1 - %2**"
    },
  },

  onChat: async function ({ message, guildData, getLang }) {
    // Check if auto download is enabled
    if (!guildData?.settings?.autoDownload) return;

    // Check for Spotify URLs (track links only)
    const spotifyUrlRegex = /(https?:\/\/)?(open\.)?spotify\.com\/track\/[^\s]+/gi;
    const matches = message.content.match(spotifyUrlRegex);
    
    if (!matches || matches.length === 0) return;

    // Process the first URL found
    const query = matches[0];
    await this.processDownload({ message, query, getLang, user: message.author, isSlash: false });
  },

  onStart: async function ({ message, interaction, args, getLang }) {
    const isSlash = !!interaction;
    const user = isSlash ? interaction.user : message.author;

    let query = isSlash ? interaction.options.getString('query') : args.join(" ");

    await this.processDownload({ message, interaction, query, getLang, user, isSlash });
  },

  processDownload: async function ({ message, interaction, query, getLang, user, isSlash }) {

    try {
      if (!query) {
        const response = getLang("noInput");
        return isSlash ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
      }

      const loadingEmbed = {}
        // Description: getLang("loading"*/ //(0x1DB954)
        .setFooter({ text: user.username });

      let sentMessage;
      if (isSlash) {
        await ctx.reply({ embeds: [loadingEmbed] });
        sentMessage = await interaction.fetchReply();
        sentMessage.isSlash = true;
        sentMessage.interaction = interaction;
      } else {
        sentMessage = await ctx.reply({ embeds: [loadingEmbed] });
        sentMessage.isSlash = false;
      }

      // Fetch track details
      const infoRes = await axios.get(
        `https://spotimp3.com/api/song-details?url=${encodeURIComponent(query)}`,
        { headers: { accept: "application/json, text/plain, */*" } }
      );

      const songs = infoRes.data?.songs;
      if (!songs || songs.length === 0) {
        const errorEmbed = {}
          // Description: getLang("noMediaFound"*/ //(0xED4245);
        
        if (sentMessage.isSlash) {
          return sentMessage.interaction.editReply({ embeds: [errorEmbed] });
        } else {
          return sentMessage.edit({ embeds: [errorEmbed] });
        }
      }

      // If only one track, download directly
      if (songs.length === 1) {
        return await downloadTrack(songs[0], sentMessage, getLang, user);
      }

      // Multiple results - show both select menu and text options
      const trackList = songs
        .map((s, i) => `**${i + 1}.** ${s.title} - ${s.artist} (${s.duration})`)
        .join("\n");

      // Create select menu options (max 25 options for Discord)
      const options = songs.slice(0, 25).map((song, index) => 
        new StringSelectMenuOptionBuilder()
          .setLabel(`${song.title.substring(0, 90)}${song.title.length > 90 ? '...' : ''}`)
          // Description: `${song.artist.substring(0, 90} - ${song.duration}`)
          .setValue(`${index}`)
          .setEmoji('🎵')
      );

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`spotify_select_${sentMessage.id}`)
        .setPlaceholder('Select a track to download')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const chooseEmbed = {}
        // Title: "🎵 Spotify Search Results"
        // Description: `${getLang("chooseTrack", songs.length}\n\n${trackList}`*/ //(0x1DB954)
        .setFooter({ text: `${user.username} | Select from dropdown or reply with a number (1-${songs.length}) • Timeout: 60s` })
        .setTimestamp();

      if (sentMessage.isSlash) {
        await sentMessage.interaction.editReply({ embeds: [chooseEmbed], components: [row] });
      } else {
        await sentMessage.edit({ embeds: [chooseEmbed], components: [row] });
      }

      // Set up select menu handler
      const selectMenuId = `spotify_select_${sentMessage.id}`;
      global.RentoBot.onSelectMenu.set(selectMenuId, async (selectInteraction) => {
        if (selectInteraction.user.id !== user.id) {
          return selectInteraction.reply({ content: "❌ This is not your selection!", ephemeral: true });
        }

        const selectedIndex = parseInt(selectInteraction.values[0]);
        const selectedTrack = songs[selectedIndex];
        
        await selectInteraction.deferUpdate();
        await downloadTrack(selectedTrack, sentMessage, getLang, user);
        global.RentoBot.onSelectMenu.delete(selectMenuId);
      });

      // Set up onReply handler for text-based selection
      global.RentoBot.onReply.set(sentMessage.id, {
        commandName: "spotify",
        messageId: sentMessage.id,
        author: user.id,
        songs,
        handler: async ({ message: replyMsg, getLang }) => {
          const choice = parseInt(replyMsg.content.trim());

          if (isNaN(choice) || choice < 1 || choice > songs.length) {
            const errorEmbed = {}
              // Description: getLang("invalidChoice", songs.length*/ //(0xED4245);

            await replyMsg.reply({ embeds: [errorEmbed] }).catch(() => {});
            setTimeout(() => replyMsg.delete().catch(() => {}), 3000);
            return;
          }

          const selectedTrack = songs[choice - 1];
          setTimeout(() => replyMsg.delete().catch(() => {}), 500);
          await downloadTrack(selectedTrack, sentMessage, getLang, user);
          global.RentoBot.onReply.delete(sentMessage.id);
          global.RentoBot.onSelectMenu.delete(selectMenuId);
        }
      });

      // Timeout cleanup
      setTimeout(() => {
        if (global.RentoBot.onReply.has(sentMessage.id)) {
          const timeoutEmbed = {}
            // Description: getLang("timeout"*/ //(0x95A5A6);

          if (sentMessage.isSlash) {
            sentMessage.interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
          } else {
            sentMessage.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
          }
          global.RentoBot.onReply.delete(sentMessage.id);
          global.RentoBot.onSelectMenu.delete(selectMenuId);
        }
      }, 60000);
    } catch (error) {
      console.error("Spotify command error:", error);
      const errorEmbed = {}
        // Description: `${getLang("error"}\n\`${error.message}\``*/ //(0xED4245);

      if (isSlash) {
        const reply = await interaction.fetchReply().catch(() => null);
        if (reply) await interaction.editReply({ embeds: [errorEmbed] });
        else await ctx.reply({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await ctx.reply({ embeds: [errorEmbed] });
      }
    }
  },
};

// Updated Track Downloader with new API
async function downloadTrack(track, sentMessage, getLang, user) {
  let tempFilePath = null;

  try {
    const downloadingEmbed = {}
      // Description: getLang("downloading", track.title, track.artist*/ //(0x1DB954)
      .setFooter({ text: user.username })
      .setTimestamp();

    if (sentMessage.isSlash) {
      await sentMessage.interaction.editReply({ embeds: [downloadingEmbed], components: [] });
    } else {
      await sentMessage.edit({ embeds: [downloadingEmbed], components: [] });
    }

    // Fetch new download URL from Universal Downloader API
    const apiUrl = `https://universaldownloaderapi.vercel.app/api/spotify/download?url=${encodeURIComponent(track.url)}`;
    const { data } = await axios.get(apiUrl, { timeout: 60000 });

    if (!data?.success || !data?.data?.downloadLinks?.[0]?.url) {
      throw new Error("No download link found.");
    }

    const downloadUrl = data.data.downloadLinks[0].url;
    tempFilePath = join(tmpdir(), `spotify_${Date.now()}.mp3`);

    // Stream download
    const response = await axios.get(downloadUrl, { responseType: "stream", timeout: 120000 });
    const writer = createWriteStream(tempFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
      response.data.on("error", reject);
    });

    // Success Embed
    const successEmbed = {}
      // Description: getLang("success", track.title, track.artist*/ //(0x57F287)
      .setFooter({ text: user.username })
      // Thumbnail: data.data.thumbnail
      .setTimestamp();

    if (sentMessage.isSlash) {
      await sentMessage.interaction.editReply({
        embeds: [successEmbed],
        files: [{ attachment: tempFilePath, name: `${track.title} - ${track.artist}.mp3` }],
      });
    } else {
      await sentMessage.edit({
        embeds: [successEmbed],
        files: [{ attachment: tempFilePath, name: `${track.title} - ${track.artist}.mp3` }],
      });
    }

  } catch (error) {
    console.error("Download track error:", error);
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('../adapters/discord-to-telegram.js');
    
    const errorEmbed = {}
      // Description: `${getLang("downloadFailed"}\n\`${error.message}\`\n\n**Listen on Spotify:**`*/ //(0xED4245);

    const button = new ButtonBuilder()
      .setLabel('Open in Spotify')
      .setURL(track.url)
      .setStyle(ButtonStyle.Link)
      .setEmoji('🎵');
    
    const row = new ActionRowBuilder().addComponents(button);

    if (sentMessage.isSlash) {
      await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [row] });
    } else {
      await sentMessage.edit({ embeds: [errorEmbed], components: [row] });
    }
  } finally {
    if (tempFilePath) {
      try { unlinkSync(tempFilePath); } catch {}
    }
  }
}
