const Canvas = require("canvas");
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

const defaultFontName = "BeVietnamPro-SemiBold";
const defaultPathFontName = `${__dirname}/assets/font/BeVietnamPro-SemiBold.ttf`;

Canvas.registerFont(`${__dirname}/assets/font/BeVietnamPro-Bold.ttf`, {
    family: "BeVietnamPro-Bold"
});
Canvas.registerFont(defaultPathFontName, {
    family: defaultFontName
});

const percentage = total => total / 100;

const defaultDesignCard = {
    widthCard: 2000,
    heightCard: 500,
    main_color: "#474747",
    sub_color: "rgba(255, 255, 255, 0.5)",
    alpha_subcard: 0.9,
    exp_color: "#e1e1e1",
    expNextLevel_color: "#3f3f3f",
    text_color: "#000000"
};

// Global persistent image cache directory
const CACHE_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Global image cache map (URL -> local file path)
const globalImageCache = new Map();

// Fast image loader with persistent disk cache
async function loadImageFast(src) {
    // If it's not a URL, load directly
    if (!src.match(/^https?:\/\//)) {
        return await Canvas.loadImage(src);
    }

    // Check if already in memory cache
    if (globalImageCache.has(src)) {
        const cachedPath = globalImageCache.get(src);
        if (fs.existsSync(cachedPath)) {
            return await Canvas.loadImage(cachedPath);
        }
    }

    // Generate cache filename from URL hash
    const hash = crypto.createHash('md5').update(src).digest('hex');
    const ext = path.extname(new URL(src).pathname) || '.png';
    const cachedPath = path.join(CACHE_DIR, `${hash}${ext}`);

    // Check if file exists on disk
    if (fs.existsSync(cachedPath)) {
        globalImageCache.set(src, cachedPath);
        return await Canvas.loadImage(cachedPath);
    }

    // Download and cache the image
    try {
        const response = await axios.get(src, {
            responseType: 'arraybuffer',
            timeout: 15000,
            maxContentLength: 10 * 1024 * 1024 // 10MB max
        });

        // Save to disk
        fs.writeFileSync(cachedPath, Buffer.from(response.data));
        
        // Add to memory cache
        globalImageCache.set(src, cachedPath);
        
        // Load and return
        return await Canvas.loadImage(cachedPath);
    } catch (error) {
        console.error(`Error downloading image: ${src}`, error.message);
        throw error;
    }
}

module.exports = {
    config: {
        name: "rankcard",
        aliases: ["card", "profile", "rank"],
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Display your rank card with level, EXP, and money (Canvas-based)",
            ne: "स्तर, EXP र पैसासहित आफ्नो रैंक कार्ड प्रदर्शन गर्नुहोस् (Canvas-आधारित)"
        },
        category: "economy",
        guide: {
            en: "{prefix}rankcard [@user]",
            ne: "{prefix}rankcard [@प्रयोगकर्ता]"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "The user to view rank card for",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            error: "❌ An error occurred while generating rank card"
        },
        ne: {
            error: "❌ रैंक कार्ड उत्पन्न गर्दा त्रुटि देखा पर्यो"
        }
    },

    onStart: async ({ message, interaction, usersData, getLang }) => {
        try {
            // Defer reply for slash commands to prevent timeout
            if (interaction) {
                await interaction.deferReply();
            }

            const targetUser = message ? 
                (message.mentions.users.first() || message.author) : 
                (interaction.options.getUser('user') || interaction.user);

            const userData = await usersData.get(targetUser.id);
            const allUsers = await usersData.getAll();

            const sortedUsers = allUsers
                .filter(u => u.exp > 0)
                .sort((a, b) => b.exp - a.exp);

            const userRank = sortedUsers.findIndex(u => u.userID === targetUser.id) + 1;
            const currentLevel = global.utils.calculateLevel(userData.exp);
            const expNeeded = global.utils.getExpForNextLevel(userData.exp);
            const expInCurrentLevel = userData.exp - global.utils.getExpForLevel(currentLevel);

            const customCard = userData.data?.customRankCard || {};
            const configRankCard = {
                ...defaultDesignCard,
                ...customCard
            };

            const dataLevel = {
                exp: expInCurrentLevel,
                expNextLevel: expNeeded,
                name: targetUser.username,
                rank: `#${userRank}/${sortedUsers.length}`,
                level: currentLevel,
                avatar: targetUser.displayAvatarURL({ extension: 'png', size: 512 })
            };

            const rankCard = new RankCard({
                ...configRankCard,
                ...dataLevel
            });

            const buffer = await rankCard.buildCard();
            const attachment = new AttachmentBuilder(buffer, { name: 'rankcard.png' });

            return message ? 
                message.reply({ files: [attachment] }) : 
                interaction.editReply({ files: [attachment] });
        } catch (error) {
            console.error('Rankcard error:', error);
            const response = getLang("error");
            return message ? 
                message.reply(response) : 
                (interaction.deferred ? interaction.editReply(response) : interaction.reply(response));
        }
    }
};

class RankCard {
    constructor(options) {
        this.widthCard = 2000;
        this.heightCard = 500;
        this.main_color = "#474747";
        this.sub_color = "rgba(255, 255, 255, 0.5)";
        this.alpha_subcard = 0.9;
        this.exp_color = "#e1e1e1";
        this.expNextLevel_color = "#3f3f3f";
        this.text_color = "#000000";
        this.fontName = "BeVietnamPro-Bold";
        this.textSize = 0;

        for (const key in options)
            this[key] = options[key];
    }

    async buildCard() {
        let {
            widthCard,
            heightCard
        } = this;
        const {
            main_color,
            sub_color,
            alpha_subcard,
            exp_color,
            expNextLevel_color,
            text_color,
            name_color,
            level_color,
            rank_color,
            line_color,
            exp_text_color,
            exp,
            expNextLevel,
            name,
            level,
            rank,
            avatar
        } = this;

        widthCard = Number(widthCard);
        heightCard = Number(heightCard);

        const canvas = Canvas.createCanvas(widthCard, heightCard);
        const ctx = canvas.getContext("2d");

        const alignRim = 3 * percentage(widthCard);
        const Alpha = parseFloat(alpha_subcard || 0);

        ctx.globalAlpha = Alpha;
        await checkColorOrImageAndDraw(alignRim, alignRim, widthCard - alignRim * 2, heightCard - alignRim * 2, ctx, sub_color, 20, alpha_subcard);
        ctx.globalAlpha = 1;

        ctx.globalCompositeOperation = "destination-out";

        const xyAvatar = heightCard / 2;
        const resizeAvatar = 60 * percentage(heightCard);

        const widthLineBetween = 58 * percentage(widthCard);
        const heightLineBetween = 2 * percentage(heightCard);

        const angleLineCenter = 40;
        const edge = heightCard / 2 * Math.tan(angleLineCenter * Math.PI / 180);

        if (line_color) {
            if (!isUrl(line_color)) {
                ctx.fillStyle = ctx.strokeStyle = checkGradientColor(ctx,
                    Array.isArray(line_color) ? line_color : [line_color],
                    xyAvatar - resizeAvatar / 2 - heightLineBetween,
                    0,
                    xyAvatar + resizeAvatar / 2 + widthLineBetween + edge,
                    0
                );
                ctx.globalCompositeOperation = "source-over";
            }
            else {
                ctx.save();
                const img = await loadImageFast(line_color);
                ctx.globalCompositeOperation = "source-over";

                ctx.beginPath();
                ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
                ctx.fill();

                ctx.rect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);
                ctx.fill();

                ctx.translate(xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
                ctx.rotate(angleLineCenter * Math.PI / 180);
                ctx.rect(0, 0, heightLineBetween, 1000);
                ctx.fill();
                ctx.rotate(-angleLineCenter * Math.PI / 180);
                ctx.translate(-xyAvatar - resizeAvatar / 2 - widthLineBetween - edge, 0);

                ctx.clip();
                ctx.drawImage(img, 0, 0, widthCard, heightCard);
                ctx.restore();
            }
        }

        ctx.beginPath();
        if (!isUrl(line_color))
            ctx.rect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);
        ctx.fill();

        ctx.beginPath();
        if (!isUrl(line_color)) {
            ctx.moveTo(xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
            ctx.lineTo(xyAvatar + resizeAvatar / 2 + widthLineBetween - edge, heightCard);
            ctx.lineWidth = heightLineBetween;
            ctx.stroke();
        }

        ctx.beginPath();
        if (!isUrl(line_color))
            ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalCompositeOperation = "destination-out";

        ctx.fillRect(0, 0, widthCard, alignRim);
        ctx.fillRect(0, heightCard - alignRim, widthCard, alignRim);

        const radius = 6 * percentage(heightCard);
        const xStartExp = (25 + 1.5) * percentage(widthCard),
            yStartExp = 67 * percentage(heightCard),
            widthExp = 40.5 * percentage(widthCard),
            heightExp = radius * 2;
        ctx.globalCompositeOperation = "source-over";
        centerImage(ctx, await loadImageFast(avatar), xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);

        if (!isUrl(expNextLevel_color)) {
            ctx.beginPath();
            ctx.fillStyle = checkGradientColor(ctx, expNextLevel_color, xStartExp, yStartExp, xStartExp + widthExp, yStartExp);
            ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
            ctx.fill();
            ctx.fillRect(xStartExp, yStartExp, widthExp, heightExp);
            ctx.arc(xStartExp + widthExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, false);
            ctx.fill();
        }
        else {
            ctx.save();
            ctx.beginPath();

            ctx.moveTo(xStartExp, yStartExp);
            ctx.lineTo(xStartExp + widthExp, yStartExp);
            ctx.arcTo(xStartExp + widthExp + radius, yStartExp, xStartExp + widthExp + radius, yStartExp + radius, radius);
            ctx.lineTo(xStartExp + widthExp + radius, yStartExp + heightExp - radius);
            ctx.arcTo(xStartExp + widthExp + radius, yStartExp + heightExp, xStartExp + widthExp, yStartExp + heightExp, radius);
            ctx.lineTo(xStartExp, yStartExp + heightExp);
            ctx.arcTo(xStartExp, yStartExp + heightExp, xStartExp - radius, yStartExp + heightExp - radius, radius);
            ctx.lineTo(xStartExp - radius, yStartExp + radius);
            ctx.arcTo(xStartExp, yStartExp, xStartExp, yStartExp, radius);

            ctx.closePath();
            ctx.clip();
            ctx.drawImage(await loadImageFast(expNextLevel_color), xStartExp, yStartExp, widthExp + radius, heightExp);
            ctx.restore();
        }

        const widthExpCurrent = (100 / expNextLevel * exp) * percentage(widthExp);
        if (!isUrl(exp_color)) {
            ctx.fillStyle = checkGradientColor(ctx, exp_color, xStartExp, yStartExp, xStartExp + widthExp, yStartExp);
            ctx.beginPath();
            ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
            ctx.fill();

            ctx.fillRect(xStartExp, yStartExp, widthExpCurrent, heightExp);

            ctx.beginPath();
            ctx.arc(xStartExp + widthExpCurrent - 1, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI);
            ctx.fill();
        }
        else {
            const imgExp = await loadImageFast(exp_color);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xStartExp, yStartExp);
            ctx.lineTo(xStartExp + widthExpCurrent, yStartExp);
            ctx.arc(xStartExp + widthExpCurrent, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, false);
            ctx.lineTo(xStartExp + widthExpCurrent + radius, yStartExp + heightExp - radius);
            ctx.arcTo(xStartExp + widthExpCurrent + radius, yStartExp + heightExp, xStartExp + widthExpCurrent, yStartExp + heightExp, radius);
            ctx.lineTo(xStartExp, yStartExp + heightExp);
            ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
            ctx.lineTo(xStartExp - radius, yStartExp + radius);
            ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(imgExp, xStartExp - radius, yStartExp, widthExp + radius * 2, heightExp);
            ctx.restore();
        }

        const maxSizeFont_Name = 4 * percentage(widthCard) + this.textSize;
        const maxSizeFont_Exp = 2 * percentage(widthCard) + this.textSize;
        const maxSizeFont_Level = 3.25 * percentage(widthCard) + this.textSize;
        const maxSizeFont_Rank = 4 * percentage(widthCard) + this.textSize;

        ctx.textAlign = "end";

        ctx.font = autoSizeFont(18.4 * percentage(widthCard), maxSizeFont_Rank, rank, ctx, this.fontName);
        const metricsRank = ctx.measureText(rank);
        ctx.fillStyle = checkGradientColor(ctx, rank_color || text_color,
            94 * percentage(widthCard) - metricsRank.width,
            76 * percentage(heightCard) + metricsRank.emHeightDescent,
            94 * percentage(widthCard),
            76 * percentage(heightCard) - metricsRank.actualBoundingBoxAscent
        );
        ctx.fillText(rank, 94 * percentage(widthCard), 76 * percentage(heightCard));

        const textLevel = `Lv ${level}`;
        ctx.font = autoSizeFont(9.8 * percentage(widthCard), maxSizeFont_Level, textLevel, ctx, this.fontName);
        const metricsLevel = ctx.measureText(textLevel);
        const xStartLevel = 94 * percentage(widthCard);
        const yStartLevel = 32 * percentage(heightCard);
        ctx.fillStyle = checkGradientColor(ctx, level_color || text_color,
            xStartLevel - ctx.measureText(textLevel).width,
            yStartLevel + metricsLevel.emHeightDescent,
            xStartLevel,
            yStartLevel - metricsLevel.actualBoundingBoxAscent
        );
        ctx.fillText(textLevel, xStartLevel, yStartLevel);
        ctx.font = autoSizeFont(52.1 * percentage(widthCard), maxSizeFont_Name, name, ctx, this.fontName);
        ctx.textAlign = "center";

        const metricsName = ctx.measureText(name);
        ctx.fillStyle = checkGradientColor(ctx, name_color || text_color,
            47.5 * percentage(widthCard) - metricsName.width / 2,
            40 * percentage(heightCard) + metricsName.emHeightDescent,
            47.5 * percentage(widthCard) + metricsName.width / 2,
            40 * percentage(heightCard) - metricsName.actualBoundingBoxAscent
        );
        ctx.fillText(name, 47.5 * percentage(widthCard), 40 * percentage(heightCard));

        const textExp = `Exp ${exp}/${expNextLevel}`;
        ctx.font = autoSizeFont(49 * percentage(widthCard), maxSizeFont_Exp, textExp, ctx, this.fontName);
        const metricsExp = ctx.measureText(textExp);
        ctx.fillStyle = checkGradientColor(ctx, exp_text_color || text_color,
            47.5 * percentage(widthCard) - metricsExp.width / 2,
            61.4 * percentage(heightCard) + metricsExp.emHeightDescent,
            47.5 * percentage(widthCard) + metricsExp.width / 2,
            61.4 * percentage(heightCard) - metricsExp.actualBoundingBoxAscent
        );
        ctx.fillText(textExp, 47.5 * percentage(widthCard), 61.4 * percentage(heightCard));

        ctx.globalCompositeOperation = "destination-over";
        if (main_color.match?.(/^https?:\/\//) || Buffer.isBuffer(main_color)) {
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(widthCard - radius, 0);
            ctx.quadraticCurveTo(widthCard, 0, widthCard, radius);
            ctx.lineTo(widthCard, heightCard - radius);
            ctx.quadraticCurveTo(widthCard, heightCard, widthCard - radius, heightCard);
            ctx.lineTo(radius, heightCard);
            ctx.quadraticCurveTo(0, heightCard, 0, heightCard - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(await loadImageFast(main_color), 0, 0, widthCard, heightCard);
        }
        else {
            ctx.fillStyle = checkGradientColor(ctx, main_color, 0, 0, widthCard, heightCard);
            drawSquareRounded(ctx, 0, 0, widthCard, heightCard, radius, main_color, false, Array.isArray(main_color));
        }

        return canvas.toBuffer();
    }
}

async function checkColorOrImageAndDraw(xStart, yStart, width, height, ctx, colorOrImage, r) {
    if (!colorOrImage.match?.(/^https?:\/\//)) {
        if (Array.isArray(colorOrImage)) {
            const gradient = ctx.createLinearGradient(xStart, yStart, xStart + width, yStart + height);
            colorOrImage.forEach((color, index) => {
                gradient.addColorStop(index / (colorOrImage.length - 1), color);
            });
            ctx.fillStyle = gradient;
            drawSquareRounded(ctx, xStart, yStart, width, height, r, colorOrImage, false, true);
        } else {
            drawSquareRounded(ctx, xStart, yStart, width, height, r, colorOrImage);
        }
    }
    else {
        const imageLoad = await loadImageFast(colorOrImage);
        ctx.save();
        roundedImage(xStart, yStart, width, height, r, ctx);
        ctx.clip();
        ctx.drawImage(imageLoad, xStart, yStart, width, height);
        ctx.restore();
    }
}

function drawSquareRounded(ctx, x, y, w, h, r, color, defaultGlobalCompositeOperation, notChangeColor) {
    ctx.save();
    if (defaultGlobalCompositeOperation)
        ctx.globalCompositeOperation = "source-over";
    if (w < 2 * r)
        r = w / 2;
    if (h < 2 * r)
        r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (!notChangeColor)
        ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function roundedImage(x, y, width, height, radius, ctx) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function centerImage(ctx, img, xCenter, yCenter, w, h) {
    const x = xCenter - w / 2;
    const y = yCenter - h / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(xCenter, yCenter, w / 2, 0, 2 * Math.PI);
    ctx.clip();
    ctx.closePath();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
}

function autoSizeFont(maxWidthText, maxSizeFont, text, ctx, fontName) {
    let sizeFont = 0;
    while (true) {
        sizeFont += 1;
        ctx.font = sizeFont + "px " + fontName;
        const widthText = ctx.measureText(text).width;
        if (widthText > maxWidthText || sizeFont > maxSizeFont) break;
    }
    return sizeFont + "px " + fontName;
}

function checkGradientColor(ctx, color, x1, y1, x2, y2) {
    if (Array.isArray(color)) {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        color.forEach((c, index) => {
            gradient.addColorStop(index / (color.length - 1), c);
        });
        return gradient;
    }
    else {
        return color;
    }
}

function isUrl(string) {
    try {
        new URL(string);
        return true;
    }
    catch (err) {
        return false;
    }
}

module.exports.RankCard = RankCard;
module.exports.defaultDesignCard = defaultDesignCard;
