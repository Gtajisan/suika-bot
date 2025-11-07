
const fs = require('fs');
const path = require('path');
const log = require('../logger/log');
const { execSync } = require('child_process');

const regExpCheckPackage = /require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;
const packageAlready = [];
let eventLoadedCount = 0;
let eventErrorCount = 0;
const eventErrors = [];

async function checkAndInstallPackages(filePath, fileName) {
    const contentFile = fs.readFileSync(filePath, 'utf8');
    let allPackage = contentFile.match(regExpCheckPackage);
    
    if (allPackage) {
        allPackage = allPackage
            .map(p => p.match(/[`'"]([^`'"]+)[`'"]/)[1])
            .filter(p => p.indexOf("/") !== 0 && p.indexOf("./") !== 0 && p.indexOf("../") !== 0 && p.indexOf(__dirname) !== 0);
        
        for (let packageName of allPackage) {
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
    const eventsPath = path.join(__dirname, '../scripts/events');
    
    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
        log.warn("EVENTS", "Events directory created");
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => 
        file.endsWith('.js') && 
        !file.endsWith('.eg.js')
    );

    log.info("EVENTS", `Found ${eventFiles.length} event files`);
    console.log();

    const loadedNames = [];
    const failedNames = [];

    for (let i = 0; i < eventFiles.length; i++) {
        const file = eventFiles[i];
        const filePath = path.join(eventsPath, file);
        const eventName = file.replace('.js', '');
        
        try {
            // Show loading progress
            process.stdout.write(`\r\x1b[K\x1b[36m[LOADING]\x1b[0m [\x1b[33m${i + 1}\x1b[0m/\x1b[33m${eventFiles.length}\x1b[0m] Loading: \x1b[35m${eventName}\x1b[0m...`);
            
            // Check and install packages
            await checkAndInstallPackages(filePath, file);
            
            // Clear cache and load event
            delete require.cache[require.resolve(filePath)];
            const event = require(filePath);

            if (!event.config || !event.config.name) {
                throw new Error("Missing config or name");
            }

            // Events can have onStart, onChat, or both
            if (!event.onStart && !event.onChat) {
                throw new Error("Missing onStart or onChat function");
            }

            global.RentoBot.eventCommands.set(event.config.name, event);
            
            // Register event with onChat functionality
            if (event.onChat && typeof event.onChat === 'function') {
                global.RentoBot.onChatEvents.push(event.config.name);
            }
            
            global.RentoBot.eventCommandsFilesPath.push({
                filePath: filePath,
                commandName: event.config.name
            });

            // Only call onStart if it exists
            if (event.onStart && typeof event.onStart === 'function') {
                await event.onStart({ client });
            }

            loadedNames.push(event.config.name);
            eventLoadedCount++;
            
        } catch (error) {
            failedNames.push(eventName);
            eventErrors.push({ file, error: error.message });
            eventErrorCount++;
        }
    }

    process.stdout.write(`\r\x1b[K`);
    
    if (loadedNames.length > 0) {
        console.log(`\x1b[36m[EVENT]\x1b[0m [\x1b[33m${eventFiles.length}\x1b[0m/\x1b[33m${eventFiles.length}\x1b[0m] ✓ Loaded: \x1b[32m${loadedNames.join(', ')}\x1b[0m`);
    }
    
    if (failedNames.length > 0) {
        console.log(`\x1b[36m[EVENT]\x1b[0m ✗ Failed: \x1b[31m${failedNames.join(', ')}\x1b[0m`);
    }
    
    // Summary
    if (eventErrorCount > 0) {
        log.error("EVENTS", `Failed to load ${eventErrorCount} event(s):`);
        eventErrors.forEach(({ file, error }) => {
            log.error("  └─", `\x1b[31m${file}\x1b[0m: ${error}`);
        });
        console.log();
    }
    
    log.success("EVENTS", `Successfully loaded \x1b[32m${eventLoadedCount}\x1b[0m/${eventFiles.length} events`);
    console.log();

    require('./messageHandler')(client);
    require('./interactionHandler')(client);
};
