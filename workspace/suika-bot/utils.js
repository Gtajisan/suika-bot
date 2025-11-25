const axios = require('axios');
const log = require('./logger/log.js');

class Utils {
    constructor() {
        this.cache = new Map();
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    formatBalance(amount) {
        return `$${this.formatNumber(amount)}`;
    }

    getTimeString(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    async fetchJSON(url, options = {}) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                ...options
            });
            return response.data;
        } catch (error) {
            log.error(`Fetch error from ${url}: ${error.message}`);
            throw error;
        }
    }

    generateRandomId() {
        return Math.random().toString(36).substr(2, 9);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    escapeMarkdown(text) {
        return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
    }

    truncate(text, length = 100) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
}

module.exports = new Utils();
