const { colors } = require("../func/colors");

function colorize(text, color) {
    return `${colors[color] || ""}${text}${colors.reset}`;
}

module.exports = { colorize };
