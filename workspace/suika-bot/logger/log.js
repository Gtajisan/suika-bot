const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

function formatLog(type, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${type}] ${message}`;
}

module.exports = {
    info: (msg) => {
        const formatted = formatLog("INFO", msg);
        console.log('\x1b[36m%s\x1b[0m', formatted);
        fs.appendFileSync(path.join(LOG_DIR, "bot.log"), formatted + "\n");
    },
    error: (msg) => {
        const formatted = formatLog("ERROR", msg);
        console.error('\x1b[31m%s\x1b[0m', formatted);
        fs.appendFileSync(path.join(LOG_DIR, "bot.log"), formatted + "\n");
    },
    warn: (msg) => {
        const formatted = formatLog("WARN", msg);
        console.warn('\x1b[33m%s\x1b[0m', formatted);
        fs.appendFileSync(path.join(LOG_DIR, "bot.log"), formatted + "\n");
    },
    debug: (msg) => {
        const formatted = formatLog("DEBUG", msg);
        console.log('\x1b[35m%s\x1b[0m', formatted);
    }
};
