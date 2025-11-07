const axios = require("axios");

async function search(keyWord) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyWord)}`;
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      },
    });

    // Extract ytInitialData safely
    const match = res.data.match(/ytInitialData"\]\s*=\s*(\{.*?\});/s) ||
                  res.data.match(/var ytInitialData\s*=\s*(\{.*?\});/s);

    if (!match) throw new Error("ytInitialData not found in page");

    const json = JSON.parse(match[1]);

    // Navigate to video list safely
    const contents =
      json.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    const videos = [];
    for (const section of contents) {
      const items = section.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const v = item.videoRenderer;
        if (!v) continue;
        if (!v.lengthText?.simpleText) continue; // skip live, playlists, etc.

        videos.push({
          id: v.videoId,
          url: `https://www.youtube.com/watch?v=${v.videoId}`,
          title: v.title?.runs?.[0]?.text,
          thumbnail: v.thumbnail?.thumbnails?.pop()?.url,
          duration: v.lengthText?.simpleText,
          views: v.viewCountText?.simpleText || "N/A",
          published: v.publishedTimeText?.simpleText || "N/A",
          channel: {
            id: v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId,
            name: v.ownerText?.runs?.[0]?.text,
            url: `https://www.youtube.com${v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || ""}`,
            thumbnail:
              v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer
                ?.thumbnail?.thumbnails?.pop()?.url?.replace(/s\d+-c/, "-c") || null,
          },
        });
      }
    }

    return videos;
  } catch (err) {
    console.error("Error while searching:", err.message);
    throw new Error("SEARCH_VIDEO_ERROR");
  }
}

// Example usage
(async () => {
  const results = await search("Fallen Kingdom");
  console.log(results.slice(0, 10)); // show first 10 results
})();
