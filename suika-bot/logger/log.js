const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

function log(type, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);

    const logFile = path.join(LOG_DIR, "bot.log");
    fs.appendFileSync(logFile, logMessage + "\n");
}

module.exports = {
    info: (msg) => log("INFO", msg),
    error: (msg) => log("ERROR", msg),
    warn: (msg) => log("WARN", msg),
    debug: (msg) => log("DEBUG", msg)
};
