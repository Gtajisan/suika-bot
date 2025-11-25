const { colors } = require('../func/colors');
const moment = require('moment-timezone');
const config = require('../loadConfig');

function getTime() {
    const timezone = config.bot.timezone || "Asia/Kathmandu";
    return colors.cyan + moment().tz(timezone).format("HH:mm:ss") + colors.reset;
}

function logMessage(message) {
    try {
        const time = getTime();
        const author = message.author;
        const userName = `${author.username}${author.discriminator !== '0' ? '#' + author.discriminator : ''}`;
        const userID = author.id;
        
        let location = "";
        let locationID = "";
        
        if (message.guild) {
            location = message.guild.name;
            locationID = message.guild.id;
        } else {
            location = "DM";
            locationID = message.channelId;
        }
        
        const messageContent = message.content || "[attachment/embed]";
        const maxLength = 100;
        const truncatedContent = messageContent.length > maxLength 
            ? messageContent.substring(0, maxLength) + "..." 
            : messageContent;
        
        console.log(
            `${time} ${colors.magenta}[${location}]${colors.reset} ` +
            `${colors.green}${userName}${colors.reset}${colors.dim} (${userID})${colors.reset}: ` +
            `${colors.white}${truncatedContent}${colors.reset}`
        );
    } catch (error) {
        console.error(`${colors.red}[ERROR]${colors.reset} Failed to log message:`, error.message);
    }
}

module.exports = logMessage;
