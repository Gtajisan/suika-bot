
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const log = require('../logger/log');
const config = require('../loadConfig.js');
const { execSync } = require('child_process');

const regExpCheckPackage = /require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;
const packageAlready = [];
let commandLoadedCount = 0;
let commandErrorCount = 0;
const commandErrors = [];

async function checkAndInstallPackages(filePath, fileName) {
    const contentFile = fs.readFileSync(filePath, 'utf8');
    let allPackage = contentFile.match(regExpCheckPackage);
    
    if (allPackage) {
        allPackage = allPackage
            .map(p => p.match(/[`'"]([^`'"]+)[`'"]/)[1])
            .filter(p => p.indexOf("/") !== 0 && p.indexOf("./") !== 0 && p.indexOf("../") !== 0 && p.indexOf(__dirname) !== 0);
        
        for (let packageName of allPackage) {
            // Handle scoped packages like @user/abc
            if (packageName.startsWith('@'))
                packageName = packageName.split('/').slice(0, 2).join('/');
            else
                packageName = packageName.split('/')[0];

            if (!packageAlready.includes(packageName)) {
                packageAlready.push(packageName);
                if (!fs.existsSync(`${process.cwd()}/node_modules/${packageName}`)) {
                    try {
                        process.stdout.write(`\r\x1b[K\x1b[36m[PACKAGE]\x1b[0m Installing \x1b[33m${packageName}\x1b[0m for \x1b[35m${fileName}\x1b[0m...`);
                        execSync(`npm install ${packageName} --save --silent`, { stdio: 'pipe' });
                        process.stdout.write(`\r\x1b[K\x1b[36m[PACKAGE]\x1b[0m ✓ Installed \x1b[32m${packageName}\x1b[0m for \x1b[35m${fileName}\x1b[0m\n`);
                    } catch (error) {
                        process.stdout.write(`\r\x1b[K\x1b[36m[PACKAGE]\x1b[0m ✗ Failed to install \x1b[31m${packageName}\x1b[0m for \x1b[35m${fileName}\x1b[0m\n`);
                        throw new Error(`Can't install package ${packageName}`);
                    }
                }
            }
        }
    }
}

module.exports = async (client) => {
    const commands = [];
    const commandsPath = path.join(__dirname, '../scripts/commands');
    
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        log.warn("COMMANDS", "Commands directory created");
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => 
        file.endsWith('.js') && 
        file !== 'tmp' &&
        !file.endsWith('.eg.js')
    );

    log.info("COMMANDS", `Found ${commandFiles.length} command files`);
    console.log();

    const loadedNames = [];
    const failedNames = [];

    for (let i = 0; i < commandFiles.length; i++) {
        const file = commandFiles[i];
        const filePath = path.join(commandsPath, file);
        const commandName = file.replace('.js', '');
        
        try {
            // Show loading progress
            process.stdout.write(`\r\x1b[K\x1b[36m[LOADING]\x1b[0m [\x1b[33m${i + 1}\x1b[0m/\x1b[33m${commandFiles.length}\x1b[0m] Loading: \x1b[35m${commandName}\x1b[0m...`);
            
            // Check and install packages
            await checkAndInstallPackages(filePath, file);
            
            // Clear cache and load command
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if (!command.config || !command.config.name) {
                throw new Error("Missing config or name");
            }

            global.RentoBot.commands.set(command.config.name.toLowerCase(), command);
            
            if (command.config.aliases && Array.isArray(command.config.aliases)) {
                for (const alias of command.config.aliases) {
                    global.RentoBot.aliases.set(alias.toLowerCase(), command.config.name.toLowerCase());
                }
            }

            if (command.onChat && typeof command.onChat === 'function') {
                global.RentoBot.onChat.push(command.config.name.toLowerCase());
            }

            global.RentoBot.commandFilesPath.push({
                filePath: filePath,
                commandName: command.config.name
            });

            if (command.config.slash) {
                commands.push({
                    name: command.config.name,
                    description: command.config.description?.en || "No description",
                    options: command.config.options || []
                });
            }

            loadedNames.push(command.config.name);
            commandLoadedCount++;
            
        } catch (error) {
            failedNames.push(commandName);
            commandErrors.push({ 
                file, 
                error: error.message,
                stack: error.stack,
                line: error.stack?.match(/anilist\.js:(\d+):/)?.[1] || 'unknown'
            });
            commandErrorCount++;
        }
    }

    process.stdout.write(`\r\x1b[K`);
    
    if (loadedNames.length > 0) {
        console.log(`\x1b[36m[COMMAND]\x1b[0m [\x1b[33m${commandFiles.length}\x1b[0m/\x1b[33m${commandFiles.length}\x1b[0m] ✓ Loaded: \x1b[32m${loadedNames.join(', ')}\x1b[0m`);
    }
    
    if (failedNames.length > 0) {
        console.log(`\x1b[36m[COMMAND]\x1b[0m ✗ Failed: \x1b[31m${failedNames.join(', ')}\x1b[0m`);
    }
    
    // Summary
    if (commandErrorCount > 0) {
        log.error("COMMANDS", `Failed to load ${commandErrorCount} command(s):`);
        commandErrors.forEach(({ file, error, stack, line }) => {
            log.error("  └─", `\x1b[31m${file}\x1b[0m: ${error}`);
            if (line !== 'unknown') {
                log.error("     ", `\x1b[33mLine ${line}\x1b[0m`);
            }
            if (stack) {
                const relevantStack = stack.split('\n').slice(0, 3).join('\n');
                log.error("     ", `\x1b[90m${relevantStack}\x1b[0m`);
            }
        });
        console.log();
    }
    
    log.success("COMMANDS", `Successfully loaded \x1b[32m${commandLoadedCount}\x1b[0m/${commandFiles.length} commands`);

    // Register slash commands
    const totalCommands = commandFiles.length;
    const slashCommands = commands.length;
    const nonSlashCommands = totalCommands - slashCommands;
    
    if (commands.length > 0 && config.discord.token && config.discord.clientId) {
        try {
            process.stdout.write(`\x1b[36m[SLASH]\x1b[0m Registering \x1b[33m${commands.length}\x1b[0m slash commands...`);
            
            const rest = new REST({ version: '10' }).setToken(config.discord.token);
            
            await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            
            process.stdout.write(`\r\x1b[36m[SLASH]\x1b[0m ✓ Registered \x1b[32m${commands.length}\x1b[0m slash commands globally${' '.repeat(20)}\n`);
            
            // Show non-slash commands if any
            if (nonSlashCommands > 0) {
                const nonSlashCommandNames = [];
                global.RentoBot.commands.forEach((command, name) => {
                    if (!command.config.slash) {
                        nonSlashCommandNames.push(name);
                    }
                });
                
                console.log(`\x1b[36m[SLASH]\x1b[0m ℹ Non-registered commands (\x1b[33m${nonSlashCommands}\x1b[0m): \x1b[90m${nonSlashCommandNames.join(', ')}\x1b[0m`);
            }
        } catch (error) {
            process.stdout.write(`\r\x1b[36m[SLASH]\x1b[0m ✗ Failed to register slash commands: \x1b[31m${error.message}\x1b[0m\n`);
        }
    } else if (nonSlashCommands === totalCommands && totalCommands > 0) {
        // All commands are non-slash
        const nonSlashCommandNames = [];
        global.RentoBot.commands.forEach((command, name) => {
            if (!command.config.slash) {
                nonSlashCommandNames.push(name);
            }
        });
        
        console.log(`\x1b[36m[SLASH]\x1b[0m ℹ Non-registered commands (\x1b[33m${nonSlashCommands}\x1b[0m): \x1b[90m${nonSlashCommandNames.join(', ')}\x1b[0m`);
    }
    
    console.log();
};
