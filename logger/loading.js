const ora = require("ora");

function createLoading(text) {
    const spinner = ora({
        text: text,
        spinner: {
            interval: 80,
            frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        }
    });

    return spinner;
}

module.exports = { createLoading };
