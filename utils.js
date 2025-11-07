const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");
const _ = require("lodash");
const { colors } = require("./func/colors.js");
const Prism = require("./func/prism.js");
const log = require("./logger/log.js");

const { config } = global.RentoBot;

class CustomError extends Error {
    constructor(obj) {
        if (typeof obj === 'string')
            obj = { message: obj };
        if (typeof obj !== 'object' || obj === null)
            throw new TypeError('Object required');
        obj.message ? super(obj.message) : super();
        Object.assign(this, obj);
    }
}

class TaskQueue {
    constructor(worker, concurrency = 1) {
        this.worker = worker;
        this.concurrency = concurrency;
        this.queue = [];
        this.running = 0;
    }

    push(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.running >= this.concurrency || this.queue.length === 0) return;

        this.running++;
        const { task, resolve, reject } = this.queue.shift();

        try {
            const result = await this.worker(task, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            this.running--;
            this.process();
        }
    }
}

function convertTime(miliSeconds, replaceSeconds = "s", replaceMinutes = "m", replaceHours = "h", replaceDays = "d") {
    const second = Math.floor(miliSeconds / 1000 % 60);
    const minute = Math.floor(miliSeconds / 1000 / 60 % 60);
    const hour = Math.floor(miliSeconds / 1000 / 60 / 60 % 24);
    const day = Math.floor(miliSeconds / 1000 / 60 / 60 / 24);

    let formattedDate = '';
    if (day > 0) formattedDate += day + replaceDays;
    if (hour > 0) formattedDate += hour + replaceHours;
    if (minute > 0) formattedDate += minute + replaceMinutes;
    if (second > 0 || formattedDate === '') formattedDate += second + replaceSeconds;

    return formattedDate;
}

function getTime(format = "DD/MM/YYYY HH:mm:ss") {
    return moment().tz("UTC").format(format);
}

function getPrefix(guildID) {
    const guildData = global.db.allGuildData.find(g => g.guildID == guildID);
    return guildData?.prefix || config.bot.prefix || "!";
}

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

function isNumber(num) {
    return !isNaN(num) && isFinite(num);
}

function getText(data, key, ...args) {
    let text = data[key] || key;
    for (let i = 0; i < args.length; i++) {
        text = text.replace(new RegExp(`%${i + 1}`, "g"), args[i]);
    }
    return text;
}

async function uploadImgbb(file) {
    const regCheckURL = /^https?:\/\//;
    let type = "file";

    try {
        if (!file)
            throw new Error('The first argument (file) must be a buffer or an image url');
        if (regCheckURL.test(file) == true)
            type = "url";

        const res_ = await axios({
            method: 'GET',
            url: 'https://imgbb.com',
            timeout: 8000
        });

        const auth_token = res_.data.match(/auth_token="([^"]+)"/)[1];
        const timestamp = Date.now();

        const FormData = require('form-data');
        const formData = new FormData();

        if (type === "url") {
            formData.append('source', file);
            formData.append('type', 'url');
        } else {
            // Compress buffer if it's an image using Canvas
            const Canvas = require('canvas');

            let compressedBuffer = file;
            try {
                const img = await Canvas.loadImage(file);
                const canvas = Canvas.createCanvas(img.width, img.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                compressedBuffer = canvas.toBuffer('image/jpeg', { quality: 0.75 });
            } catch (err) {
                // If compression fails, use original buffer
                console.log('Image compression failed, using original buffer');
                compressedBuffer = file;
            }

            formData.append('source', compressedBuffer, {
                filename: 'image.jpg',
                contentType: 'image/jpeg'
            });
            formData.append('type', 'file');
        }

        formData.append('action', 'upload');
        formData.append('timestamp', timestamp);
        formData.append('auth_token', auth_token);

        const res = await axios({
            method: 'POST',
            url: 'https://imgbb.com/json',
            headers: formData.getHeaders(),
            data: formData,
            timeout: 20000,
            maxContentLength: 5 * 1024 * 1024,
            maxBodyLength: 5 * 1024 * 1024
        });

        if (!res.data || !res.data.image || !res.data.image.url) {
            throw new Error('Invalid response from ImgBB');
        }

        return res.data;
    } catch (err) {
        if (err.code === 'ECONNABORTED' || err.code === 'UND_ERR_CONNECT_TIMEOUT') {
            throw new Error('Upload timeout - ImgBB server is not responding. Please try again.');
        }
        throw new Error(`Failed to upload image to imgbb: ${err.message}`);
    }
}

// Add calculateLevel utility function
function calculateLevel(exp) {
    // Calculate level from total exp using progressive formula
    // Formula based on: 5 * (level^2) + 50 * level + 100
    let level = 1;
    let totalExpNeeded = 0;
    
    while (true) {
        const expForNextLevel = 5 * (level * level) + 50 * level + 100;
        if (totalExpNeeded + expForNextLevel > exp) {
            break;
        }
        totalExpNeeded += expForNextLevel;
        level++;
    }
    
    return level;
}

function getExpForLevel(level) {
    // Calculate total exp needed to reach a specific level
    let totalExp = 0;
    for (let i = 1; i < level; i++) {
        totalExp += 5 * (i * i) + 50 * i + 100;
    }
    return totalExp;
}

function getExpForNextLevel(currentExp) {
    // Get exp needed for next level based on current exp
    const currentLevel = calculateLevel(currentExp);
    return 5 * (currentLevel * currentLevel) + 50 * currentLevel + 100;
}


module.exports = {
    CustomError,
    TaskQueue,
    convertTime,
    getTime,
    calculateLevel,
    getExpForLevel,
    getExpForNextLevel,
    getPrefix,
    getType,
    isNumber,
    getText,
    uploadImgbb,
    colors,
    Prism,
    log,
    axios,
    fs,
    path,
    moment,
    _
};