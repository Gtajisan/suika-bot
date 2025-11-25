const axios = require("axios");
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "terabox",
    aliases: ["tera", "tbox"],
    version: "1.3",
    author: "Samir",
    countDown: 15,
    role: 0,
    description: {
      en: "Download files from Terabox",
      ne: "टेराबक्सबाट फाइलहरू डाउनलोड गर्नुहोस्",
    },
    category: "downloader",
    guide: {
      en: "{prefix}terabox <terabox url or short code>\nExample: {prefix}terabox https://1024terabox.com/s/1xXk8FGVFmFe9kKvGxfP2ow",
      ne: "{prefix}terabox <terabox url वा छोटो कोड>\nउदाहरण: {prefix}terabox https://1024terabox.com/s/1xXk8FGVFmFe9kKvGxfP2ow",
    },
    slash: true,
    options: [
      {
        name: "url",
        description: "Terabox URL or short code",
        type: 3,
        required: true,
      },
    ],
  },

  langs: {
    en: {
      noUrl: "❌ Please provide a Terabox URL or short code!",
      invalidUrl: "❌ Invalid Terabox URL or short code!",
      loading: "⏳ Fetching file information...",
      downloading: "⬇️ Downloading: **%1**\nSize: **%2**",
      downloadFailed: "❌ Failed to download file. Please check the URL and try again.",
      success: "✅ Downloaded: **%1**",
      apiError: "❌ API Error: %1",
      fileTooLarge: "❌ File is too large to send (max 25MB for Discord)\nFile size: **%1**",
      noFileFound: "❌ No file found at the provided URL.",
      retryNeeded: "⚠️ Download link expired, retrying...",
    },
    ne: {
      noUrl: "❌ कृपया टेराबक्स URL वा छोटो कोड प्रदान गर्नुहोस्!",
      invalidUrl: "❌ अवैध टेराबक्स URL वा छोटो कोड!",
      loading: "⏳ फाइल जानकारी प्राप्त गर्दै...",
      downloading: "⬇️ डाउनलोड गर्दै: **%1**\nआकार: **%2**",
      downloadFailed: "❌ फाइल डाउनलोड गर्न असफल भयो। कृपया URL जाँच गर्नुहोस् र पुन: प्रयास गर्नुहोस्।",
      success: "✅ डाउनलोड भयो: **%1**",
      apiError: "❌ API त्रुटि: %1",
      fileTooLarge: "❌ फाइल पठाउन धेरै ठूलो छ (Discord को लागि अधिकतम 25MB)\nफाइल आकार: **%1**",
      noFileFound: "❌ प्रदान गरिएको URL मा कुनै फाइल फेला परेन।",
      retryNeeded: "⚠️ डाउनलोड लिङ्क समाप्त भयो, पुन: प्रयास गर्दै...",
    },
  },

  onStart: async function ({ message, interaction, args, getLang }) {
    const isSlash = !!interaction;
    const user = isSlash ? interaction.user : message.author;
    const url = isSlash ? interaction.options.getString("url") : args.join(" ");

    if (!url) {
      const resp = getLang("noUrl");
      return isSlash ? interaction.reply({ content: resp, ephemeral: true }) : message.reply(resp);
    }

    const loadingEmbed = new EmbedBuilder()
      .setDescription(getLang("loading"))
      .setColor(0x1e90ff)
      .setFooter({ text: user.username });

    let sentMessage;
    if (isSlash) {
      await interaction.reply({ embeds: [loadingEmbed] });
      sentMessage = await interaction.fetchReply();
      sentMessage.isSlash = true; // Add a flag to identify if it's a slash command reply
    } else {
      sentMessage = await message.reply({ embeds: [loadingEmbed] });
      sentMessage.isSlash = false; // Add a flag
    }

    try {
      const fileData = await fetchTeraBox(url);

      if (!fileData || !fileData.downloadUrl) {
        const errEmbed = new EmbedBuilder().setDescription(getLang("noFileFound")).setColor(0xed4245);
        return sentMessage.isSlash ? interaction.editReply({ embeds: [errEmbed] }) : sentMessage.edit({ embeds: [errEmbed] });
      }

      const filename = fileData.filename || fileData.server_filename || `terabox_file_${Date.now()}`;
      const declaredSize = typeof fileData.size === "number" ? fileData.size : 0;
      const sizeText = declaredSize ? formatBytes(declaredSize) : "Unknown";

      const MAX = 25 * 1024 * 1024;
      if (declaredSize && declaredSize > MAX) {
        const errEmbed = new EmbedBuilder()
          .setDescription(getLang("fileTooLarge", formatBytes(declaredSize)))
          .setColor(0xed4245);
        return sentMessage.isSlash ? interaction.editReply({ embeds: [errEmbed] }) : sentMessage.edit({ embeds: [errEmbed] });
      }

      const downloadingEmbed = new EmbedBuilder()
        .setDescription(getLang("downloading", filename, sizeText))
        .setColor(0xffa500);

      if (sentMessage.isSlash) {
        await interaction.editReply({ embeds: [downloadingEmbed] });
      } else {
        await sentMessage.edit({ embeds: [downloadingEmbed] });
      }

      // Download using chunked streaming
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      const filePath = path.join(tmpDir, `${Date.now()}_${sanitizeFilename(filename)}`);

      await downloadFileChunked(fileData.downloadUrl, filePath, MAX);

      // Check file size after download
      const stats = await fs.stat(filePath);
      if (stats.size > MAX) {
        await fs.unlink(filePath);
        const errEmbed = new EmbedBuilder()
          .setDescription(getLang("fileTooLarge", formatBytes(stats.size)))
          .setColor(0xed4245);
        return sentMessage.isSlash ? interaction.editReply({ embeds: [errEmbed] }) : sentMessage.edit({ embeds: [errEmbed] });
      }

      const attachment = new AttachmentBuilder(filePath, { name: filename });

      const successEmbed = new EmbedBuilder()
        .setDescription(getLang("success", filename))
        .setColor(0x00ff00)
        .addFields(
          { name: "File Name", value: filename, inline: true },
          { name: "Size", value: formatBytes(stats.size), inline: true }
        )
        .setFooter({ text: user.username })
        .setTimestamp();

      await sentMessage.edit({ embeds: [successEmbed], files: [attachment] });

      // cleanup
      setTimeout(() => fs.unlink(filePath).catch(() => {}), 15000);
    } catch (error) {
      console.error("Terabox Error:", error);
      const msg =
        error.message && error.message.includes("Invalid Terabox")
          ? getLang("invalidUrl")
          : getLang("apiError", error.message || getLang("downloadFailed"));

      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('../adapters/discord-to-telegram.js');
      const errorEmbed = new EmbedBuilder()
        .setDescription(msg + "\n\n**Try opening the original link:**")
        .setColor(0xed4245);

      let components = [];
      let fileDataForButton = typeof fileData !== 'undefined' ? fileData : null; // Ensure fileData is accessible here

      try {
        if (fileDataForButton && fileDataForButton.downloadUrl) {
          const button = new ButtonBuilder()
            .setLabel('Click Here to Download')
            .setURL(fileDataForButton.downloadUrl)
            .setStyle(ButtonStyle.Link)
            .setEmoji('⬇️');

          const row = new ActionRowBuilder().addComponents(button);
          components = [row];
        } else if (url) {
          const teraboxUrl = url.includes('http') ? url : `https://terabox.com/s/${url}`;
          const button = new ButtonBuilder()
            .setLabel('Open Terabox Link')
            .setURL(teraboxUrl)
            .setStyle(ButtonStyle.Link)
            .setEmoji('🔗');

          const row = new ActionRowBuilder().addComponents(button);
          components = [row];
        }
      } catch (btnError) {
        console.error('Button creation error:', btnError);
      }

      try {
        if (sentMessage.isSlash) {
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed], components });
          } else {
            await interaction.reply({ embeds: [errorEmbed], components, ephemeral: true });
          }
        } else {
          await sentMessage.edit({ embeds: [errorEmbed], components });
        }
      } catch (editErr) {
        if (!isSlash) await message.reply({ embeds: [errorEmbed], components });
      }
    }
  },
};

// Download file using chunked streaming with better error handling
async function downloadFileChunked(url, filepath, maxSize) {
  const writer = fs.createWriteStream(filepath);
  let downloadedBytes = 0;

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
    });

    return new Promise((resolve, reject) => {
      let lastActivity = Date.now();
      const activityTimeout = 30000; // 30 seconds of no data = timeout

      const activityChecker = setInterval(() => {
        if (Date.now() - lastActivity > activityTimeout) {
          clearInterval(activityChecker);
          response.data.destroy();
          writer.close();
          fs.unlinkSync(filepath);
          reject(new Error('Download timeout - no data received'));
        }
      }, 5000);

      response.data.on('data', (chunk) => {
        lastActivity = Date.now();
        downloadedBytes += chunk.length;

        // Check if file is getting too large
        if (maxSize && downloadedBytes > maxSize) {
          clearInterval(activityChecker);
          response.data.destroy();
          writer.close();
          fs.unlinkSync(filepath);
          reject(new Error(`File too large: ${formatBytes(downloadedBytes)}`));
        }
      });

      response.data.on('error', (err) => {
        clearInterval(activityChecker);
        writer.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(err);
      });

      writer.on('error', (err) => {
        clearInterval(activityChecker);
        response.data.destroy();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(err);
      });

      writer.on('finish', () => {
        clearInterval(activityChecker);
        resolve(filepath);
      });

      response.data.pipe(writer);
    });
  } catch (error) {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    throw error;
  }
}

async function fetchTeraBox(inputUrl) {
  try {
    const shortUrl = extractShortUrl(inputUrl);
    if (!shortUrl) throw new Error("Invalid Terabox URL or short code.");

    const apiBase = "https://terabox.hnn.workers.dev";

    // Fetch file info
    const infoRes = await axios.get(
      `${apiBase}/api/get-info-new?shorturl=${encodeURIComponent(shortUrl)}`,
      {
        headers: getHeaders(apiBase),
        timeout: 30000
      }
    );

    const info = infoRes.data;
    if (!info.ok || !info.list?.length) {
      throw new Error("Failed to retrieve file info from Terabox.");
    }

    const file = info.list[0];

    const payload = {
      shareid: info.shareid,
      uk: info.uk,
      sign: info.sign,
      timestamp: info.timestamp,
      fs_id: file.fs_id,
    };

    // Fetch download link
    const downloadRes = await axios.post(`${apiBase}/api/get-download`, payload, {
      headers: {
        ...getHeaders(apiBase),
        "Content-Type": "application/json",
      },
      timeout: 30000
    });

    const data = downloadRes.data;
    if (!data.ok) throw new Error("Failed to get download URL from Terabox.");

    const dl =
      data.downloadLink ||
      data.link ||
      data.url ||
      (Array.isArray(data.list) && data.list[0] && (data.list[0].dlink || data.list[0].url));

    return {
      filename: file.server_filename || file.filename || file.serverFilename || `terabox_${file.fs_id}`,
      size: file.size || 0,
      downloadUrl: dl,
    };
  } catch (error) {
    throw new Error(`Terabox API request failed: ${error.message}`);
  }
}

function extractShortUrl(input) {
  if (/^[A-Za-z0-9_-]+$/.test(input)) return input;
  const match = input.match(/(?:\/s\/|shorturl=)([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

function getHeaders(origin) {
  return {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Origin: origin,
    Referer: origin + "/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  };
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024,
    dm = decimals < 0 ? 0 : decimals,
    sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, "_");
}