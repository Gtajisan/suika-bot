const axios = require("axios");
const cheerio = require("cheerio");

const URL = "https://myanimelist.net/news";

async function scrapeMALNews() {
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

      // Extract data
      const title = element.find(".title a").text().trim();
      const newsLink = element.find(".title a").attr("href");
      const image = element.find("a.image-link img").attr("src");
      const text = element.find(".text").text().trim();

      // Extract time and author
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

    console.log(JSON.stringify(newsList, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function scrapeNewsMarkdown(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const $ = cheerio.load(data);

    // Extract title, author, time, image
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

    // Clean and format article content
    const contentEl = $(".content").clone();

    // Remove unwanted elements (socials, imgs)
    contentEl.find("script, style, .sns-unit, img").remove();

    // Replace links with markdown-style links
    contentEl.find("a").each((_, a) => {
      const text = $(a).text().trim();
      const href = $(a).attr("href");
      if (text && href) {
        $(a).replaceWith(`[${text}](${href})`);
      } else {
        $(a).replaceWith(text);
      }
    });

    // Convert <br> tags to double line breaks
    contentEl.find("br").replaceWith("\n\n");

    // Extract and clean text
    let content = contentEl.text().trim();
    content = content.replace(/\n{3,}/g, "\n\n"); // normalize spacing

    // Optional markdown touchups
    content = content
      .replace(/Staff\s*\n/, "**Staff**\n") // make "Staff" bold
      .replace(/^Source:/m, "**Source:**"); // make Source bold

    // Prepare structured result
    const result = {
      title,
      author,
      time,
      image,
      content,
    };

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Example usage:
scrapeMALNews(); // Scrape list of news
/* Response example:
[
  {
    "title": "'Aishiteru Game wo Owarasetai' Announces Main Cast, Staff, April 2026 Airing",
    "link": "https://myanimelist.net/news/73458033",
    "image": "https://cdn.myanimelist.net/r/100x156/s/common/uploaded_files/1762051800-d7f502cb61d03d6c69dcc05fde69da0a.jpeg?s=3459e0eac882cd0cd19d86c4d32661c6",
    "text": "Production company Nikkatsu opened an official website for the Aishiteru Game wo Owarasetai (I Want to End This Love Game) television anime on Sunday, revealing the main cast, staff, and a teaser visual (pictured). The anime series adapting Yuuki Doumoto's school comedy manga wil...",
    "time": "6 hours ago",
    "author": "Vindstot"
  },
 */
scrapeNewsMarkdown("https://myanimelist.net/news/73458033"); // Scrape specific news article
/* Response example:
{
  "title": "'Aishiteru Game wo Owarasetai' Announces Main Cast, Staff, April 2026 Airing",
  "author": "Vindstot",
  "time": "6 hours ago",
  "image": "https://cdn.myanimelist.net/s/common/uploaded_files/1762051800-d7f502cb61d03d6c69dcc05fde69da0a.jpeg",
  "content": "Production company [Nikkatsu](https://myanimelist.net/anime/producer/513/) opened an official website for the [Aishiteru Game wo Owarasetai](https://myanimelist.net/anime/61839/) (I Want to End This Love Game) television anime on Sunday, revealing the main cast, staff, and a teaser visual (pictured). The anime series adapting [Yuuki Doumoto](https://myanimelist.net/people/15485/)'s [school comedy manga](https://myanimelist.net/manga/143031/) will begin airing in April 2026.\n\nVoice actors [Kaito Ishikawa](https://myanimelist.net/people/20156/) (Shiro Seijo to Kuro Bokushi) and [Miku Itou](https://myanimelist.net/people/24413/) (Adachi to Shimamura) are starring as Yukiya Asagi and Miku Sakura, respectively.\n\n**Staff**\nDirector: [Azuma Tani](https://myanimelist.net/people/12546/) (Thermae Romae)\n\nSeries Composition, Script: [Keiichirou Oochi](https://myanimelist.net/people/25383/) (Otonari no Tenshi-sama ni Itsunomanika Dame Ningen ni Sareteita Ken)\n\nCharacter Design: [Yuuki Fukuchi](https://myanimelist.net/people/61359/) (Plunderer)\n\nMusic: [Akito Matsuda](https://myanimelist.net/people/14045/) (Hibike! Euphonium)\n\nStudio: [Felix Film](https://myanimelist.net/anime/producer/1440/)\n\nDoumoto began drawing the manga on the [Sunday Webry](https://myanimelist.net/manga/magazine/1410/) platform in December 2021. Shogakukan published the seventh volume on June 18.\n\nVIZ Media [licensed](https://myanimelist.net/news/68911555) the manga in English in June 2023 and released the sixth volume on May 13. The seventh volume is planned for a July 14, 2026 release.\n\nOfficial site: [https://www.aishiteru-game.com/](https://www.aishiteru-game.com/)\n\nOfficial X: @[aishiterugame](https://x.com/aishiterugame)\n\n**Source:** Press Release"
}
*/