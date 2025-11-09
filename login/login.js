
process.stdout.write("\x1b]2;Rento Bot - inspired by Goat-Bot-V2\x1b\x5c");

const gradient = require("gradient-string").default || require("gradient-string");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require('child_process');
const ora = require('ora');
const log = require('../logger/log.js');
const axios = require('axios');
const { colors } = require('../func/colors.js');
const mongoose = require('mongoose');

const packageJson = require(`${process.cwd()}/package.json`);
const currentVersion = packageJson.version;

function centerText(text, length) {
    const width = process.stdout.columns || 80;
    const textLength = length || text.length;
    const leftPadding = Math.max(0, Math.floor((width - textLength) / 2));
    const rightPadding = Math.max(0, width - leftPadding - textLength);
    const paddedString = ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
    console.log(paddedString);
}

const titles = [
    [
        "██████╗ ███████╗███╗   ██╗████████╗ ██████╗     ██████╗  ██████╗ ████████╗",
        "██╔══██╗██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝",
        "██████╔╝█████╗  ██╔██╗ ██║   ██║   ██║   ██║    ██████╔╝██║   ██║   ██║   ",
        "██╔══██╗██╔══╝  ██║╚██╗██║   ██║   ██║   ██║    ██╔══██╗██║   ██║   ██║   ",
        "██║  ██║███████╗██║ ╚████║   ██║   ╚██████╔╝    ██████╔╝╚██████╔╝   ██║   ",
        "╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝     ╚═════╝  ╚═════╝    ╚═╝   "
    ],
    [
        "█▀█ █▀▀ █▄░█ ▀█▀ █▀█   █▄▄ █▀█ ▀█▀",
        "█▀▄ ██▄ █░▀█ ░█░ █▄█   █▄█ █▄█ ░█░"
    ],
    [
        "Rento BOT V" + currentVersion
    ],
    [
        "BOT"
    ]
];

function createLine(content, isMaxWidth = false) {
    const width = process.stdout.columns || 80;
    const widthConsole = width > 50 ? 50 : width;
    
    if (!content) {
        const lineWidth = isMaxWidth ? width : widthConsole;
        return "─".repeat(lineWidth);
    }
    
    const trimmedContent = ` ${content.trim()} `;
    const contentLength = trimmedContent.length;
    const lineWidth = isMaxWidth ? width : widthConsole;
    const availableWidth = lineWidth - contentLength;
    const left = Math.max(0, Math.floor(availableWidth / 2));
    const right = Math.max(0, availableWidth - left);
    
    return "─".repeat(left) + trimmedContent + "─".repeat(right);
}

function displayBanner() {
    const maxWidth = process.stdout.columns || 80;
    const title = maxWidth > 85 ?
        titles[0] :
        maxWidth > 36 ?
            titles[1] :
            maxWidth > 26 ?
                titles[2] :
                titles[3];

    console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
    console.log();
    for (const text of title) {
        const textColor = gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(text);
        centerText(textColor, text.length);
    }
    
    let subTitle = `Rento Bot V${currentVersion} - A powerful modular Discord bot`;
    const subTitleArray = [];
    if (subTitle.length > maxWidth) {
        while (subTitle.length > maxWidth) {
            let lastSpace = subTitle.slice(0, maxWidth).lastIndexOf(' ');
            lastSpace = lastSpace === -1 ? maxWidth : lastSpace;
            subTitleArray.push(subTitle.slice(0, lastSpace).trim());
            subTitle = subTitle.slice(lastSpace).trim();
        }
        if (subTitle) {
            subTitleArray.push(subTitle);
        }
    } else {
        subTitleArray.push(subTitle);
    }
    
    const author = "Created with ♡ | Samir Badaila";
    const srcUrl = "Source: https://github.com/notsopreety/Rento-Bot";
    
    for (const t of subTitleArray) {
        const textColor2 = gradient("#9F98E8", "#AFF6CF")(t);
        centerText(textColor2, t.length);
    }
    centerText(gradient("#9F98E8", "#AFF6CF")(author), author.length);
    centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);
    console.log();
    console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
    console.log();
}

function scanAllPackages() {
    // Match both require() and import statements
    const regExpRequire = /require\s*\(\s*[`'"]([^`'"]+)[`'"]\s*\)/g;
    const regExpImport = /import\s+(?:.*\s+from\s+)?[`'"]([^`'"]+)[`'"]/g;
    const regExpImportDynamic = /import\s*\(\s*[`'"]([^`'"]+)[`'"]\s*\)/g;
    const allPackages = new Set();
    
    // Node.js built-in modules to exclude
    const builtInModules = new Set([
        'fs', 'path', 'http', 'https', 'crypto', 'os', 'util', 'stream',
        'events', 'child_process', 'cluster', 'dgram', 'dns', 'net',
        'readline', 'repl', 'tls', 'tty', 'url', 'v8', 'vm', 'zlib',
        'assert', 'buffer', 'constants', 'domain', 'module', 'process',
        'querystring', 'string_decoder', 'sys', 'timers', 'punycode',
        'fs/promises', 'path/posix', 'path/win32', 'stream/promises',
        'util/types', 'util/promises', 'worker_threads', 'perf_hooks',
        'inspector', 'trace_events', 'async_hooks', 'wasi'
    ]);
    
    const dirsToScan = [
        'handlers',
        'scripts/commands',
        'scripts/events',
        'login',
        'logger',
        'database',
        'utils',
        'dashboard',
        'func'
    ];
    
    const filesToScan = [
        'Bot.js',
        'index.js',
        'loadConfig.js',
        'utils.js',
        'updater.js',
        'update.js'
    ];
    
    function extractPackageName(packageName) {
        // Skip relative imports
        if (packageName.startsWith('./') || packageName.startsWith('../') || packageName.startsWith('/')) {
            return null;
        }
        
        // Skip if contains variables or template syntax
        if (packageName.includes('$') || packageName.includes('{') || packageName.includes('}')) {
            return null;
        }
        
        // Skip if it's a data URL or protocol
        if (packageName.startsWith('http://') || packageName.startsWith('https://') || packageName.startsWith('data:')) {
            return null;
        }
        
        // Handle scoped packages
        let normalizedName;
        if (packageName.startsWith('@')) {
            normalizedName = packageName.split('/').slice(0, 2).join('/');
        } else {
            normalizedName = packageName.split('/')[0];
        }
        
        // Skip built-in Node.js modules
        if (builtInModules.has(normalizedName)) {
            return null;
        }
        
        // Skip if package name looks invalid
        if (normalizedName.length === 0 || normalizedName.length > 214) {
            return null;
        }
        
        return normalizedName;
    }
    
    function scanFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) return;
            
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Scan for require() statements
            let matches = content.match(regExpRequire);
            if (matches) {
                matches.forEach(match => {
                    const pkgMatch = match.match(/[`'"]([^`'"]+)[`'"]/);
                    if (pkgMatch && pkgMatch[1]) {
                        const packageName = extractPackageName(pkgMatch[1]);
                        if (packageName) {
                            allPackages.add(packageName);
                        }
                    }
                });
            }
            
            // Scan for ES6 import statements
            matches = content.match(regExpImport);
            if (matches) {
                matches.forEach(match => {
                    const pkgMatch = match.match(/[`'"]([^`'"]+)[`'"]/);
                    if (pkgMatch && pkgMatch[1]) {
                        const packageName = extractPackageName(pkgMatch[1]);
                        if (packageName) {
                            allPackages.add(packageName);
                        }
                    }
                });
            }
            
            // Scan for dynamic import() statements
            matches = content.match(regExpImportDynamic);
            if (matches) {
                matches.forEach(match => {
                    const pkgMatch = match.match(/[`'"]([^`'"]+)[`'"]/);
                    if (pkgMatch && pkgMatch[1]) {
                        const packageName = extractPackageName(pkgMatch[1]);
                        if (packageName) {
                            allPackages.add(packageName);
                        }
                    }
                });
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }
    
    function scanDirectory(dirPath) {
        try {
            if (!fs.existsSync(dirPath)) return;
            
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if ((item.endsWith('.js') || item.endsWith('.mjs') || item.endsWith('.cjs')) && !item.endsWith('.eg.js')) {
                    scanFile(fullPath);
                }
            }
        } catch (error) {
            // Skip directories that can't be read
        }
    }
    
    // Scan individual files
    for (const file of filesToScan) {
        scanFile(path.join(process.cwd(), file));
    }
    
    // Scan directories
    for (const dir of dirsToScan) {
        scanDirectory(path.join(process.cwd(), dir));
    }
    
    return Array.from(allPackages).filter(pkg => pkg && pkg.length > 0);
}

async function checkPackages() {
    console.log(gradient("#FF6B6B", "#4ECDC4")(createLine("PACKAGE VERIFICATION", true)));
    console.log();
    
    const scanSpinner = ora({
        text: gradient.pastel('Scanning bot files for package dependencies...'),
        spinner: 'bouncingBar'
    }).start();
    
    const detectedPackages = scanAllPackages();
    scanSpinner.succeed(gradient.pastel(`Found ${detectedPackages.length} unique packages used in bot`));
    console.log();
    
    const missingPackages = [];
    const installedPackages = [];
    
    const checkSpinner = ora({
        text: gradient.cristal('Verifying package installations...'),
        spinner: 'dots12'
    }).start();
    
    detectedPackages.forEach((pkg, index) => {
        checkSpinner.text = gradient.cristal(`Checking [${index + 1}/${detectedPackages.length}] ${pkg}`);
        
        try {
            require.resolve(pkg);
            installedPackages.push(pkg);
        } catch (error) {
            missingPackages.push(pkg);
        }
    });
    
    checkSpinner.stop();
    
    if (installedPackages.length > 0) {
        console.log(gradient("#06FFA5", "#09FBD3")(`✓ Verified ${installedPackages.length} packages: ${installedPackages.slice(0, 5).join(', ')}${installedPackages.length > 5 ? '...' : ''}`));
    }
    
    if (missingPackages.length > 0) {
        console.log(gradient("#FF6B6B", "#FFE66D")(`✗ Missing ${missingPackages.length} packages: ${missingPackages.join(', ')}`));
        console.log();
        
        const installSpinner = ora({
            text: gradient.rainbow('Installing missing packages...'),
            spinner: 'aesthetic'
        }).start();
        
        const failedPackages = [];
        const installedPackagesList = [];
        
        for (let i = 0; i < missingPackages.length; i++) {
            const pkg = missingPackages[i];
            try {
                installSpinner.text = gradient.rainbow(`Installing [${i + 1}/${missingPackages.length}] ${pkg}...`);
                execSync(`npm install ${pkg} --save --silent`, { 
                    stdio: 'pipe',
                    cwd: process.cwd()
                });
                installedPackagesList.push(pkg);
                installSpinner.text = gradient.rainbow(`✓ Installed ${pkg} [${i + 1}/${missingPackages.length}]`);
            } catch (error) {
                failedPackages.push({ pkg, error: error.message });
                log.warn("PKG CHECK", `Failed to install ${pkg}: ${error.message}`);
                installSpinner.text = gradient.rainbow(`⚠ Failed ${pkg} [${i + 1}/${missingPackages.length}]`);
            }
        }
        
        installSpinner.stop();
        
        if (installedPackagesList.length > 0) {
            console.log(gradient("#06FFA5", "#09FBD3")(`✓ Successfully installed ${installedPackagesList.length} package(s): ${installedPackagesList.slice(0, 5).join(', ')}${installedPackagesList.length > 5 ? '...' : ''}`));
        }
        
        if (failedPackages.length > 0) {
            console.log(gradient("#FF6B6B", "#FFE66D")(`⚠ Failed to install ${failedPackages.length} package(s): ${failedPackages.map(f => f.pkg).join(', ')}`));
            console.log(gradient("#FFE66D", "#FF6B6B")(`   You may need to install them manually: npm install ${failedPackages.map(f => f.pkg).join(' ')}`));
            log.warn("PKG CHECK", `Some packages failed to install automatically. Manual installation may be required.`);
        } else if (installedPackagesList.length === missingPackages.length) {
            console.log(gradient("#06FFA5", "#09FBD3")(`✓ All ${missingPackages.length} missing packages installed successfully!`));
        }
    }
    
    console.log();
    console.log(gradient("#06FFA5", "#09FBD3")(`✓ All ${detectedPackages.length} packages verified and ready!`));
    console.log();
    console.log(gradient("#FF6B6B", "#4ECDC4")(createLine(null, true)));
    console.log();
}

async function loadDatabase() {
    const config = require('../loadConfig.js');
    
    console.log(gradient("#A8E6CF", "#FFD3B6")(createLine("DATABASE CONNECTION", true)));
    console.log();
    
    const dbSpinner = ora({
        text: gradient.mind('Connecting to MongoDB...'),
        spinner: 'arc'
    }).start();
    
    try {
        await mongoose.connect(config.database.mongodbUri);
        dbSpinner.succeed(gradient.mind('Connected to MongoDB successfully'));
        
        const controllerSpinner = ora({
            text: gradient.vice('Initializing database controllers...'),
            spinner: 'simpleDots'
        }).start();
        
        await require('../database/controller/index.js')();
        controllerSpinner.succeed(gradient.vice('Database controllers initialized'));
        
        console.log();
        console.log(gradient("#A8E6CF", "#FFD3B6")(createLine(null, true)));
        console.log();
    } catch (error) {
        dbSpinner.fail(gradient("#FF6B6B", "#C44569")(`Failed to connect: ${error.message}`));
        throw error;
    }
}

async function loadCommands(client) {
    console.log(gradient("#FFEAA7", "#FDCB6E")(createLine("LOADING COMMANDS", true)));
    console.log();
    
    try {
        await require('../handlers/loadCommands.js')(client);
        
        console.log();
        console.log(gradient("#FFEAA7", "#FDCB6E")(createLine(null, true)));
        console.log();
    } catch (error) {
        log.error("COMMANDS", `Critical error: ${error.message}`);
        throw error;
    }
}

async function loadEvents(client) {
    console.log(gradient("#74B9FF", "#A29BFE")(createLine("LOADING EVENTS", true)));
    console.log();
    
    try {
        await require('../handlers/loadEvents.js')(client);
        
        console.log();
        console.log(gradient("#74B9FF", "#A29BFE")(createLine(null, true)));
        console.log();
    } catch (error) {
        log.error("EVENTS", `Critical error: ${error.message}`);
        throw error;
    }
}

async function loginBot(client, config) {
    console.log(gradient("#FF7675", "#FD79A8")(createLine("BOT LOGIN", true)));
    console.log();
    
    const loginSpinner = ora({
        text: gradient.retro('Connecting to Discord Gateway...'),
        spinner: 'line'
    }).start();
    
    try {
        await client.login(config.discord.token);
        loginSpinner.succeed(gradient.retro(`Logged in as ${client.user.tag}`));
        console.log();
        console.log(gradient("#FF7675", "#FD79A8")(createLine(null, true)));
        console.log();
    } catch (error) {
        loginSpinner.fail(gradient("#FF6B6B", "#C44569")(`Failed to login: ${error.message}`));
        throw error;
    }
}

async function checkRestartNotification(client) {
    const restartFilePath = path.join(process.cwd(), 'scripts', 'commands', 'tmp', 'restart.txt');
    
    if (fs.existsSync(restartFilePath)) {
        try {
            const data = await fs.readFile(restartFilePath, 'utf-8');
            const [channelId, userId, messageId, timestamp] = data.trim().split('|');
            
            if (channelId && userId && messageId && timestamp) {
                const channel = await client.channels.fetch(channelId).catch(() => null);
                
                if (channel) {
                    const restartTime = ((Date.now() - parseInt(timestamp)) / 1000).toFixed(2);
                    const successMessage = `✅ Bot successfully restarted! <@${userId}>\n⏰ Restart completed in **${restartTime}s**`;
                    
                    try {
                        const originalMessage = await channel.messages.fetch(messageId).catch(() => null);
                        if (originalMessage) {
                            await originalMessage.edit(successMessage);
                            log.success("RESTART", `Restart notification edited in channel ${channelId} (${restartTime}s)`);
                        } else {
                            await channel.send(successMessage);
                            log.success("RESTART", `Restart notification sent to channel ${channelId} (${restartTime}s)`);
                        }
                    } catch (editError) {
                        await channel.send(successMessage);
                        log.success("RESTART", `Restart notification sent to channel ${channelId} (${restartTime}s)`);
                    }
                }
            }
            
            await fs.unlink(restartFilePath);
        } catch (error) {
            log.error("RESTART", `Failed to send restart notification: ${error.message}`);
            try {
                await fs.unlink(restartFilePath);
            } catch (unlinkError) {
                // Ignore unlink errors
            }
        }
    }
}

async function initializePresence(client) {
    console.log(gradient("#DDA15E", "#BC6C25")(createLine("PRESENCE MANAGER", true)));
    console.log();
    
    const presenceSpinner = ora({
        text: gradient.morning('Initializing presence manager...\n'),
        spinner: 'point'
    }).start();
    
    try {
        const PresenceManager = require('../utils/presenceManager.js');
        global.RentoBot.presenceManager = new PresenceManager(client);
        await global.RentoBot.presenceManager.loadFromConfig();
        presenceSpinner.succeed(gradient.morning('Presence manager initialized'));
        console.log();
        console.log(gradient("#DDA15E", "#BC6C25")(createLine(null, true)));
        console.log();
    } catch (error) {
        presenceSpinner.fail(gradient("#FF6B6B", "#C44569")(`Failed to initialize presence: ${error.message}`));
    }
}

async function startDashboard(client, config) {
    if (config.dashboard.enabled) {
        console.log(gradient("#E056FD", "#F7797D")(createLine("DASHBOARD", true)));
        console.log();
        
        const dashboardSpinner = ora({
            text: gradient.passion('Starting web dashboard...'),
            spinner: 'clock'
        }).start();
        
        try {
            require('../dashboard/app.js')(client);
            dashboardSpinner.succeed(gradient.passion(`Dashboard started on port ${config.dashboard.port}`));
            console.log();
            console.log(gradient("#E056FD", "#F7797D")(createLine(null, true)));
            console.log();
        } catch (error) {
            dashboardSpinner.fail(gradient("#FF6B6B", "#C44569")(`Failed to start dashboard: ${error.message}`));
        }
    }
}

/**
 * Compare two version strings
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersion(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        
        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }
    
    return 0;
}

async function checkForUpdatesOnStartup() {
    try {
        console.log(gradient("#A8E6CF", "#FFD3B6")(createLine("VERSION CHECK", true)));
        console.log();
        
        const checkSpinner = ora({
            text: gradient.mind('Checking for updates...'),
            spinner: 'dots12'
        }).start();
        
        // Get latest version from GitHub
        const { data: latestPackageJson } = await axios.get('https://raw.githubusercontent.com/notsopreety/Rento-Bot/main/package.json', {
            timeout: 10000
        });
        const latestVersion = latestPackageJson.version;
        
        const comparison = compareVersion(latestVersion, currentVersion);
        
        checkSpinner.stop();
        
        if (comparison > 0) {
            // Update available
            console.log(gradient("#FFE66D", "#FF6B6B")(`⚠️  Update Available!`));
            console.log(`${colors.yellow}   Current Version: ${currentVersion}${colors.reset}`);
            console.log(`${colors.green}   Latest Version:  ${latestVersion}${colors.reset}`);
            console.log(`${colors.cyan}   Use !update command to update the bot${colors.reset}`);
            console.log();
            log.warn("UPDATE", `Update available! Current: ${currentVersion}, Latest: ${latestVersion}`);
        } else if (comparison < 0) {
            // Current version is newer (shouldn't happen, but handle it)
            console.log(gradient("#06FFA5", "#09FBD3")(`✓ You are on a development version`));
            console.log(`${colors.yellow}  Version: ${currentVersion}${colors.reset}`);
            console.log(`${colors.green}  Latest stable: ${latestVersion}${colors.reset}`);
            console.log();
            log.info("UPDATE", `Development version detected: ${currentVersion}`);
        } else {
            // Up to date
            console.log(gradient("#06FFA5", "#09FBD3")(`✓ You are on the latest version`));
            console.log(`${colors.green}  Version: ${currentVersion}${colors.reset}`);
            console.log();
            log.success("UPDATE", `Bot is up to date: ${currentVersion}`);
        }
        
        console.log(gradient("#A8E6CF", "#FFD3B6")(createLine(null, true)));
        console.log();
        
    } catch (error) {
        // Don't fail startup if update check fails
        console.log(gradient("#FFE66D", "#FF6B6B")(`⚠️  Could not check for updates: ${error.message}`));
        console.log();
        log.warn("UPDATE", `Failed to check for updates: ${error.message}`);
    }
}

async function login(client, config) {
    try {
        displayBanner();
        
        await checkForUpdatesOnStartup();
        await checkPackages();
        await loadDatabase();
        await loadCommands(client);
        await loadEvents(client);
        await loginBot(client, config);
        await initializePresence(client);
        await checkRestartNotification(client);
        await startDashboard(client, config);
        
        console.log(gradient("#00B4DB", "#0083B0")(createLine(null, true)));
        console.log();
        
        const readyText = "🚀 BOT IS NOW ONLINE AND READY TO SERVE! 🚀";
        const readyGradient = gradient.rainbow(readyText);
        centerText(readyGradient, readyText.length);
        
        console.log();
        console.log(gradient("#00B4DB", "#0083B0")(createLine(null, true)));
        console.log();
        
    } catch (error) {
        log.error("STARTUP", `Critical error during startup: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

module.exports = login;

