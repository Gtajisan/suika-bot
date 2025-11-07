const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "cmd",
        version: "1.0",
        author: "RentoBot",
        countDown: 5,
        role: 2,
        description: {
            en: "Manage bot commands",
            ne: "बट आदेशहरू व्यवस्थापन गर्नुहोस्"
        },
        category: "owner",
        guide: {
            en: "{prefix}cmd load <command>\n{prefix}cmd unload <command>\n{prefix}cmd reload <command>\n{prefix}cmd list\n{prefix}cmd info <command>",
            ne: "{prefix}cmd load <आदेश>\n{prefix}cmd unload <आदेश>\n{prefix}cmd reload <आदेश>\n{prefix}cmd list\n{prefix}cmd info <आदेश>"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform",
                type: 3,
                required: true,
                choices: [
                    { name: "load", value: "load" },
                    { name: "unload", value: "unload" },
                    { name: "reload", value: "reload" },
                    { name: "list", value: "list" },
                    { name: "info", value: "info" }
                ]
            },
            {
                name: "command",
                description: "Command name",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            invalidAction: "Invalid action! Use: load, unload, reload, list, or info",
            noCommand: "Please provide a command name!",
            commandNotFound: "Command **%1** not found!",
            loadSuccess: "✅ Successfully loaded command **%1**",
            loadError: "❌ Error loading command **%1**: %2",
            unloadSuccess: "✅ Successfully unloaded command **%1**",
            unloadError: "❌ Error unloading command: %1",
            reloadSuccess: "✅ Successfully reloaded command **%1**",
            reloadError: "❌ Error reloading command **%1**: %2",
            commandList: "**Total Commands:** %1\n\n%2",
            commandInfo: "**Command Information**",
            name: "**Name:** %1",
            version: "**Version:** %1",
            author: "**Author:** %1",
            role: "**Role:** %1",
            category: "**Category:** %1",
            description: "**Description:** %1",
            guide: "**Usage:** %1",
            aliases: "**Aliases:** %1",
            noAliases: "None",
            roleNames: ["Everyone", "Admin", "Owner"]
        },
        ne: {
            invalidAction: "अमान्य कार्य! प्रयोग गर्नुहोस्: load, unload, reload, list, वा info",
            noCommand: "कृपया आदेश नाम प्रदान गर्नुहोस्!",
            commandNotFound: "आदेश **%1** फेला परेन!",
            loadSuccess: "✅ सफलतापूर्वक आदेश **%1** लोड गरियो",
            loadError: "❌ आदेश **%1** लोड गर्दा त्रुटि: %2",
            unloadSuccess: "✅ सफलतापूर्वक आदेश **%1** अनलोड गरियो",
            unloadError: "❌ आदेश अनलोड गर्दा त्रुटि: %1",
            reloadSuccess: "✅ सफलतापूर्वक आदेश **%1** पुनः लोड गरियो",
            reloadError: "❌ आदेश **%1** पुनः लोड गर्दा त्रुटि: %2",
            commandList: "**कुल आदेशहरू:** %1\n\n%2",
            commandInfo: "**आदेश जानकारी**",
            name: "**नाम:** %1",
            version: "**संस्करण:** %1",
            author: "**लेखक:** %1",
            role: "**भूमिका:** %1",
            category: "**श्रेणी:** %1",
            description: "**विवरण:** %1",
            guide: "**प्रयोग:** %1",
            aliases: "**उपनामहरू:** %1",
            noAliases: "कुनै पनि छैन",
            roleNames: ["सबै", "प्रशासक", "मालिक"]
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        const action = args?.[0] || interaction?.options?.getString('action');
        const commandName = args?.[1] || interaction?.options?.getString('command');

        if (!action) {
            const response = getLang("invalidAction");
            return message ? message.reply(response) : interaction.reply(response);
        }

        const commands = global.RentoBot.commands;
        const commandsPath = path.join(__dirname);

        switch (action.toLowerCase()) {
            case 'load':
                if (!commandName) {
                    const response = getLang("noCommand");
                    return message ? message.reply(response) : interaction.reply(response);
                }

                try {
                    const filePath = path.join(commandsPath, `${commandName}.js`);
                    
                    if (!fs.existsSync(filePath)) {
                        const response = getLang("commandNotFound", commandName);
                        return message ? message.reply(response) : interaction.reply(response);
                    }

                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);

                    commands.set(command.config.name, command);
                    
                    if (command.config.aliases) {
                        for (const alias of command.config.aliases) {
                            global.RentoBot.aliases.set(alias, command.config.name);
                        }
                    }

                    const response = getLang("loadSuccess", commandName);
                    return message ? message.reply(response) : interaction.reply(response);
                } catch (error) {
                    const response = getLang("loadError", commandName, error.message);
                    return message ? message.reply(response) : interaction.reply(response);
                }

            case 'unload':
                if (!commandName) {
                    const response = getLang("noCommand");
                    return message ? message.reply(response) : interaction.reply(response);
                }

                const commandToUnload = commands.get(commandName);
                if (!commandToUnload) {
                    const response = getLang("commandNotFound", commandName);
                    return message ? message.reply(response) : interaction.reply(response);
                }

                try {
                    if (commandToUnload.config.aliases) {
                        for (const alias of commandToUnload.config.aliases) {
                            global.RentoBot.aliases.delete(alias);
                        }
                    }

                    commands.delete(commandName);

                    const filePath = path.join(commandsPath, `${commandName}.js`);
                    if (require.cache[require.resolve(filePath)]) {
                        delete require.cache[require.resolve(filePath)];
                    }

                    const response = getLang("unloadSuccess", commandName);
                    return message ? message.reply(response) : interaction.reply(response);
                } catch (error) {
                    const response = getLang("unloadError", error.message);
                    return message ? message.reply(response) : interaction.reply(response);
                }

            case 'reload':
                if (!commandName) {
                    // Reload all commands
                    try {
                        const commandFiles = fs.readdirSync(commandsPath).filter(file => 
                            file.endsWith('.js') && 
                            file !== 'tmp' &&
                            !file.endsWith('.eg.js')
                        );

                        let reloadedCount = 0;
                        let failedCommands = [];

                        for (const file of commandFiles) {
                            try {
                                const cmdName = file.replace('.js', '');
                                const oldCommand = commands.get(cmdName);
                                
                                if (oldCommand && oldCommand.config.aliases) {
                                    for (const alias of oldCommand.config.aliases) {
                                        global.RentoBot.aliases.delete(alias);
                                    }
                                }

                                const filePath = path.join(commandsPath, file);
                                delete require.cache[require.resolve(filePath)];
                                const command = require(filePath);

                                commands.set(command.config.name, command);
                                
                                if (command.config.aliases) {
                                    for (const alias of command.config.aliases) {
                                        global.RentoBot.aliases.set(alias, command.config.name);
                                    }
                                }

                                reloadedCount++;
                            } catch (error) {
                                failedCommands.push(`${file.replace('.js', '')}: ${error.message}`);
                            }
                        }

                        let response = `✅ Successfully reloaded **${reloadedCount}/${commandFiles.length}** commands`;
                        if (failedCommands.length > 0) {
                            response += `\n\n❌ Failed to reload:\n${failedCommands.map(f => `• ${f}`).join('\n')}`;
                        }

                        return message ? message.reply(response) : interaction.reply(response);
                    } catch (error) {
                        const response = `❌ Error reloading all commands: ${error.message}`;
                        return message ? message.reply(response) : interaction.reply(response);
                    }
                }

                try {
                    const oldCommand = commands.get(commandName);
                    if (oldCommand && oldCommand.config.aliases) {
                        for (const alias of oldCommand.config.aliases) {
                            global.RentoBot.aliases.delete(alias);
                        }
                    }

                    const filePath = path.join(commandsPath, `${commandName}.js`);
                    
                    if (!fs.existsSync(filePath)) {
                        const response = getLang("commandNotFound", commandName);
                        return message ? message.reply(response) : interaction.reply(response);
                    }

                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);

                    commands.set(command.config.name, command);
                    
                    if (command.config.aliases) {
                        for (const alias of command.config.aliases) {
                            global.RentoBot.aliases.set(alias, command.config.name);
                        }
                    }

                    const response = getLang("reloadSuccess", commandName);
                    return message ? message.reply(response) : interaction.reply(response);
                } catch (error) {
                    const response = getLang("reloadError", commandName, error.message);
                    return message ? message.reply(response) : interaction.reply(response);
                }

            case 'list':
                const categories = {};
                commands.forEach(cmd => {
                    const category = cmd.config.category || "other";
                    if (!categories[category]) categories[category] = [];
                    categories[category].push(cmd.config.name);
                });

                const categoryList = Object.entries(categories)
                    .map(([cat, cmds]) => {
                        return `**${cat.charAt(0).toUpperCase() + cat.slice(1)}** (${cmds.length})\n${cmds.map(c => `\`${c}\``).join(", ")}`;
                    })
                    .join("\n\n");

                const response = getLang("commandList", commands.size, categoryList);
                return message ? message.reply(response) : interaction.reply(response);

            case 'info':
                if (!commandName) {
                    const response = getLang("noCommand");
                    return message ? message.reply(response) : interaction.reply(response);
                }

                const command = commands.get(commandName) || 
                              commands.get(global.RentoBot.aliases.get(commandName));

                if (!command) {
                    const response = getLang("commandNotFound", commandName);
                    return message ? message.reply(response) : interaction.reply(response);
                }

                const roleNames = getLang("roleNames");
                const aliases = command.config.aliases?.join(", ") || getLang("noAliases");
                
                const embed = new EmbedBuilder()
                    .setTitle(getLang("commandInfo"))
                    .setColor(0x00AE86)
                    .addFields(
                        { name: "Name", value: command.config.name, inline: true },
                        { name: "Version", value: command.config.version || "1.0", inline: true },
                        { name: "Author", value: command.config.author || "Unknown", inline: true },
                        { name: "Role", value: roleNames[command.config.role] || "Unknown", inline: true },
                        { name: "Category", value: command.config.category || "other", inline: true },
                        { name: "Slash", value: command.config.slash ? "Yes" : "No", inline: true },
                        { name: "Description", value: command.config.description?.en || "No description" },
                        { name: "Usage", value: `\`${command.config.guide?.en || command.config.name}\`` },
                        { name: "Aliases", value: aliases }
                    )
                    .setTimestamp();

                return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });

            default:
                const defaultResponse = getLang("invalidAction");
                return message ? message.reply(defaultResponse) : interaction.reply(defaultResponse);
        }
    }
};
