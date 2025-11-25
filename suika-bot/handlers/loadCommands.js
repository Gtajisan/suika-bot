const fs = require("fs");
const path = require("path");
const console2 = require("../logger/console.js");

module.exports = async () => {
    const commandsPath = path.join(__dirname, "..", "commands");
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
    
    for (let i = 0; i < commandFiles.length; i++) {
        try {
            const file = commandFiles[i];
            const filePath = path.join(commandsPath, file);
            const cmd = require(filePath);

            const cmdName = cmd.config.name;
            global.SuikaBot.commands.set(cmdName, cmd);

            if (cmd.config.aliases && Array.isArray(cmd.config.aliases)) {
                cmd.config.aliases.forEach(alias => {
                    global.SuikaBot.aliases.set(alias, cmdName);
                });
            }

            console2.command(cmdName, i + 1, commandFiles.length);
        } catch (error) {
            console2.error(`Failed to load command ${commandFiles[i]}: ${error.message}`, '❌');
        }
    }

    console2.blank();
};
