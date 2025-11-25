
const { exec } = require('child_process');
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');
const util = require('util');
const execPromise = util.promisify(exec);

// Store shell sessions per user
const shellSessions = new Map();

module.exports = {
    config: {
        name: "shell",
        aliases: ["sh", "exec", "execute"],
        version: "2.0",
        author: "Samir",
        countDown: 0,
        role: 2,
        description: {
            en: "Execute shell commands with persistent session (owner only)",
            ne: "स्थायी सत्रको साथ शेल आदेशहरू कार्यान्वयन गर्नुहोस् (मालिक मात्र)"
        },
        category: "owner",
        guide: {
            en: "{prefix}shell <command> - Execute a shell command\n{prefix}shell reset - Reset your shell session\n{prefix}shell pwd - Show current directory",
            ne: "{prefix}shell <आदेश> - शेल आदेश कार्यान्वयन गर्नुहोस्\n{prefix}shell reset - आफ्नो शेल सत्र रिसेट गर्नुहोस्\n{prefix}shell pwd - हालको डाइरेक्टरी देखाउनुहोस्"
        },
        slash: true,
        options: [
            {
                name: "command",
                description: "Shell command to execute",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noCommand: "❌ Please provide a command to execute!",
            executing: "⚙️ Executing command...",
            success: "✅ Command executed successfully",
            error: "❌ Command failed",
            sessionReset: "🔄 Shell session has been reset",
            sessionInfo: "📍 Current Working Directory"
        },
        ne: {
            noCommand: "❌ कृपया कार्यान्वयन गर्न आदेश प्रदान गर्नुहोस्!",
            executing: "⚙️ आदेश कार्यान्वयन गर्दै...",
            success: "✅ आदेश सफलतापूर्वक कार्यान्वयन गरियो",
            error: "❌ आदेश असफल भयो",
            sessionReset: "🔄 शेल सत्र रिसेट गरिएको छ",
            sessionInfo: "📍 हालको कार्य निर्देशिका"
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        const isInteraction = !!interaction;
        const userId = isInteraction ? interaction.user.id : message.author.id;
        const command = isInteraction ? 
            interaction.options.getString('command') : 
            args.join(' ');

        if (!command) {
            const response = getLang("noCommand");
            return isInteraction ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        // Initialize session for user if it doesn't exist
        if (!shellSessions.has(userId)) {
            shellSessions.set(userId, {
                cwd: process.cwd(),
                env: { ...process.env },
                history: []
            });
        }

        const session = shellSessions.get(userId);

        // Handle special commands
        if (command.trim() === 'reset') {
            shellSessions.delete(userId);
            const embed = new EmbedBuilder()
                .setTitle(getLang("sessionReset"))
                .setColor(0x00ff00)
                .setDescription(`Session reset to default directory: \`${process.cwd()}\``)
                .setTimestamp();
            return isInteraction ? 
                interaction.reply({ embeds: [embed], ephemeral: true }) : 
                message.reply({ embeds: [embed] });
        }

        if (isInteraction) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            // Parse the command to handle cd specially
            const trimmedCommand = command.trim();
            let actualCommand = trimmedCommand;
            let willChangeDir = false;
            
            // Check if it's a cd command
            if (trimmedCommand.startsWith('cd ') || trimmedCommand === 'cd') {
                willChangeDir = true;
                const cdPath = trimmedCommand.substring(3).trim() || '~';
                
                // Expand ~ to home directory
                const targetPath = cdPath === '~' ? process.env.HOME : cdPath;
                
                // Test if the directory exists and is accessible
                actualCommand = `cd "${targetPath}" && pwd`;
            }

            // Execute command in the session's working directory with session environment
            const execOptions = {
                cwd: session.cwd,
                env: session.env,
                timeout: 60000,
                maxBuffer: 1024 * 1024 * 10,
                shell: '/bin/bash'
            };

            // For cd commands, we need to capture the new directory
            if (willChangeDir) {
                const { stdout, stderr } = await execPromise(actualCommand, execOptions);
                
                if (stdout) {
                    // Update the session's working directory
                    session.cwd = stdout.trim();
                    session.history.push({
                        command: trimmedCommand,
                        cwd: session.cwd,
                        timestamp: new Date()
                    });

                    const embed = new EmbedBuilder()
                        .setTitle(getLang("success"))
                        .setColor(0x00ff00)
                        .addFields(
                            { name: '📝 Command', value: `\`\`\`bash\n${trimmedCommand}\n\`\`\`` },
                            { name: '📍 New Working Directory', value: `\`\`\`\n${session.cwd}\n\`\`\`` }
                        )
                        .setFooter({ text: `Session: ${userId.substring(0, 8)}` })
                        .setTimestamp();

                    return isInteraction ? 
                        await interaction.editReply({ embeds: [embed] }) : 
                        await message.reply({ embeds: [embed] });
                }
            } else {
                // For other commands, execute normally and capture output
                const fullCommand = `${actualCommand}; echo "::CWD::$(pwd)"`;
                const { stdout, stderr } = await execPromise(fullCommand, execOptions);

                // Extract the current working directory from output
                let output = stdout || stderr || 'No output';
                const cwdMatch = output.match(/::CWD::(.+)$/m);
                if (cwdMatch) {
                    session.cwd = cwdMatch[1].trim();
                    output = output.replace(/::CWD::.+$/m, '').trim();
                }

                session.history.push({
                    command: trimmedCommand,
                    cwd: session.cwd,
                    timestamp: new Date()
                });

                // Keep only last 20 commands in history
                if (session.history.length > 20) {
                    session.history.shift();
                }

                const truncatedOutput = output.length > 1900 ? 
                    output.substring(0, 1900) + '...\n[Output truncated]' : 
                    output;

                const embed = new EmbedBuilder()
                    .setTitle(getLang("success"))
                    .setColor(0x00ff00)
                    .addFields(
                        { name: '📝 Command', value: `\`\`\`bash\n${trimmedCommand}\n\`\`\`` },
                        { name: '📤 Output', value: `\`\`\`\n${truncatedOutput || '(no output)'}\n\`\`\`` },
                        { name: '📍 Working Directory', value: `\`${session.cwd}\``, inline: true },
                        { name: '📊 History', value: `${session.history.length} commands`, inline: true }
                    )
                    .setFooter({ text: `Session: ${userId.substring(0, 8)}` })
                    .setTimestamp();

                return isInteraction ? 
                    await interaction.editReply({ embeds: [embed] }) : 
                    await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            const errorMessage = error.message || error.stderr || error.toString();
            const truncatedError = errorMessage.length > 1900 ? 
                errorMessage.substring(0, 1900) + '...\n[Error truncated]' : 
                errorMessage;

            const embed = new EmbedBuilder()
                .setTitle(getLang("error"))
                .setColor(0xff0000)
                .addFields(
                    { name: '📝 Command', value: `\`\`\`bash\n${command}\n\`\`\`` },
                    { name: '❌ Error', value: `\`\`\`\n${truncatedError}\n\`\`\`` },
                    { name: '📍 Working Directory', value: `\`${session.cwd}\``, inline: true }
                )
                .setFooter({ text: `Session: ${userId.substring(0, 8)}` })
                .setTimestamp();

            if (isInteraction) {
                if (interaction.deferred) {
                    await interaction.editReply({ embeds: [embed] });
                } else {
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } else {
                await message.reply({ embeds: [embed] });
            }
        }
    }
};
