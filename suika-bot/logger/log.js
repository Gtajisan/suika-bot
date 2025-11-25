const { colors } = require("../func/colors");
const moment = require("moment-timezone");
const config = require("../loadConfig");

function getTime() {
    const timezone = config.bot.timezone || "Asia/Kathmandu";
    return moment().tz(timezone).format("HH:mm:ss");
}

function info(prefix, message) {
    console.log(`${colors.cyan}[${getTime()}]${colors.reset} ${colors.blue}[${prefix}]${colors.reset} ${message}`);
}

function success(prefix, message) {
    console.log(`${colors.cyan}[${getTime()}]${colors.reset} ${colors.green}[${prefix}]${colors.reset} ${message}`);
}

function error(prefix, message) {
    console.log(`${colors.cyan}[${getTime()}]${colors.reset} ${colors.red}[${prefix}]${colors.reset} ${message}`);
}

function warn(prefix, message) {
    console.log(`${colors.cyan}[${getTime()}]${colors.reset} ${colors.yellow}[${prefix}]${colors.reset} ${message}`);
}

function err(prefix, message) {
    console.error(`${colors.cyan}[${getTime()}]${colors.reset} ${colors.red}[${prefix}]${colors.reset} ${message}`);
}

module.exports = { info, success, error, warn, err };
module.exports.debug = module.exports.debug || module.exports.info;
