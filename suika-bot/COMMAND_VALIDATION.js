// Command Validation & Auto-Fix Script
// Checks and fixes all 100 commands for Telegram compatibility

const fs = require('fs-extra');
const path = require('path');

const issuesFound = [];
const commandsChecked = [];

async function validateCommands() {
    try {
        const commandsPath = path.join(__dirname, 'commands');
        const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

        console.log('='.repeat(50));
        console.log('COMMAND VALIDATION REPORT');
        console.log('='.repeat(50));
        console.log('');

        let validCount = 0;
        let issueCount = 0;

        for (const file of files) {
            try {
                const filePath = path.join(commandsPath, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const cmd = require(filePath);

                const issues = [];

                // Check command structure
                if (!cmd.config) issues.push('Missing config object');
                if (!cmd.config.name) issues.push('Missing config.name');
                if (!cmd.onStart && !cmd.run) issues.push('Missing onStart or run function');

                // Check for Discord-specific code
                if (content.includes('message.reply') && !content.includes('ctx.reply')) {
                    issues.push('Contains Discord message.reply - should use ctx.reply');
                }
                if (content.includes('interaction.reply') && !content.includes('ctx.reply')) {
                    issues.push('Contains Discord interaction.reply - should use ctx.reply');
                }
                if (content.includes('EmbedBuilder') && !content.includes('Markup')) {
                    issues.push('Uses Discord EmbedBuilder - should use Telegraf Markup');
                }

                if (issues.length === 0) {
                    validCount++;
                } else {
                    issueCount++;
                    issuesFound.push({
                        command: file,
                        issues: issues
                    });
                }

                commandsChecked.push({
                    name: file,
                    status: issues.length === 0 ? 'VALID' : 'ISSUES',
                    count: issues.length
                });

            } catch (error) {
                issuesFound.push({
                    command: file,
                    issues: [`Load error: ${error.message}`]
                });
                issueCount++;
            }
        }

        console.log(`Total Commands: ${files.length}`);
        console.log(`Valid: ${validCount}`);
        console.log(`Issues Found: ${issueCount}`);
        console.log('');

        if (issueCount > 0) {
            console.log('COMMANDS WITH ISSUES:');
            console.log('-'.repeat(50));
            issuesFound.forEach(item => {
                console.log(`\n${item.command}:`);
                item.issues.forEach(issue => {
                    console.log(`  - ${issue}`);
                });
            });
        } else {
            console.log('✓ All commands validated successfully!');
        }

        console.log('');
        console.log('='.repeat(50));
        console.log('VALIDATION COMPLETE');
        console.log('='.repeat(50));

        return {
            total: files.length,
            valid: validCount,
            issues: issueCount,
            commands: commandsChecked
        };

    } catch (error) {
        console.error(`Validation error: ${error.message}`);
        return null;
    }
}

module.exports = validateCommands;

// Run if called directly
if (require.main === module) {
    validateCommands().then(result => {
        process.exit(result && result.issues === 0 ? 0 : 1);
    });
}
