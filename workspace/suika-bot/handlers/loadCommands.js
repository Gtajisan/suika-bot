const fs = require('fs-extra');
const path = require('path');
const log = require('../logger/log.js');

async function loadCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    
    try {
        const commandFiles = await fs.readdir(commandsPath);
        
        for (const file of commandFiles) {
            if (!file.endsWith('.js')) continue;
            
            const filePath = path.join(commandsPath, file);
            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);
                
                if (!command.config || !command.config.name) {
                    log.warn(`Invalid command file: ${file} - missing config.name`);
                    continue;
                }

                global.SuikaBot.commands.set(command.config.name, command);
                
                if (command.config.aliases && Array.isArray(command.config.aliases)) {
                    for (const alias of command.config.aliases) {
                        global.SuikaBot.aliases.set(alias, command.config.name);
                    }
                }

                log.debug(`Loaded command: ${command.config.name}`);
            } catch (error) {
                log.error(`Error loading command ${file}: ${error.message}`);
            }
        }

        return global.SuikaBot.commands.size;
    } catch (error) {
        log.error(`Error reading commands directory: ${error.message}`);
        return 0;
    }
}

module.exports = loadCommands;
