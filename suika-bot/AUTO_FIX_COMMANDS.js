// Auto-fix all commands for Telegram compatibility
const fs = require('fs-extra');
const path = require('path');

const commandsPath = path.join(__dirname, 'commands');

async function fixCommands() {
    try {
        console.log('Starting command conversion to Telegram...\n');
        
        const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
        let fixed = 0;
        let skipped = 0;

        for (const file of files) {
            const filePath = path.join(commandsPath, file);
            let content = fs.readFileSync(filePath, 'utf-8');
            let needsFix = false;

            // Fix 1: Replace message.reply with ctx.reply
            if (content.includes('message.reply')) {
                content = content.replace(/message\.reply\(/g, 'ctx.reply(');
                needsFix = true;
            }

            // Fix 2: Replace interaction.reply with ctx.reply
            if (content.includes('interaction.reply')) {
                content = content.replace(/interaction\.reply\(/g, 'ctx.reply(');
                needsFix = true;
            }

            // Fix 3: Replace message.send with ctx.reply
            if (content.includes('message.send')) {
                content = content.replace(/message\.send\(/g, 'ctx.reply(');
                needsFix = true;
            }

            // Fix 4: Remove EmbedBuilder imports and replace with text responses
            if (content.includes("require('../adapters/discord-to-telegram.js')")) {
                // Remove the require line
                content = content.replace(
                    /const \{ EmbedBuilder \} = require\('\.\.\/adapters\/discord-to-telegram\.js'\);\n/g,
                    ''
                );
                needsFix = true;
            }

            // Fix 5: Replace embed patterns with text responses
            if (content.includes('new EmbedBuilder()') || content.includes('.addFields')) {
                // Replace complex embed with simple text
                content = content.replace(/new EmbedBuilder\(\)/g, '{}');
                content = content.replace(/\.setTitle\((.*?)\)/g, '// Title: $1');
                content = content.replace(/\.setDescription\((.*?)\)/g, '// Description: $1');
                content = content.replace(/\.addFields\(/g, '// Fields: \n            /*');
                content = content.replace(/\)\s*\.setColor/g, '*/ //');
                content = content.replace(/\.setColor\((.*?)\)/g, '');
                content = content.replace(/\.setThumbnail\((.*?)\)/g, '// Thumbnail: $1');
                content = content.replace(/\.setImage\((.*?)\)/g, '// Image: $1');
                needsFix = true;
            }

            // Fix 6: Remove references to Discord-specific objects
            content = content.replace(/PermissionsBitField/g, '// Permissions check');
            
            if (needsFix) {
                fs.writeFileSync(filePath, content);
                fixed++;
                console.log(`✓ Fixed: ${file}`);
            } else {
                skipped++;
            }
        }

        console.log(`\n${'='.repeat(50)}`);
        console.log(`CONVERSION COMPLETE`);
        console.log(`${'='.repeat(50)}`);
        console.log(`Total commands: ${files.length}`);
        console.log(`Fixed: ${fixed}`);
        console.log(`Already compatible: ${skipped}`);
        console.log(`${'='.repeat(50)}\n`);

        return { total: files.length, fixed, skipped };

    } catch (error) {
        console.error(`Fix error: ${error.message}`);
        return null;
    }
}

module.exports = fixCommands;

// Run if called directly
if (require.main === module) {
    fixCommands().then(result => {
        process.exit(result ? 0 : 1);
    });
}
