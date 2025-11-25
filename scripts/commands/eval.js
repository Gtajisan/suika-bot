const { EmbedBuilder } = require('discord.js');
const util = require('util');

module.exports = {
    config: {
        name: "eval",
        version: "1.0",
        author: "Samir",
        countDown: 0,
        role: 2,
        description: {
            en: "Execute JavaScript code (Owner only)",
            ne: "JavaScript कोड कार्यान्वयन गर्नुहोस् (मालिक मात्र)"
        },
        category: "owner",
        guide: {
            en: "{prefix}eval <code>",
            ne: "{prefix}eval <कोड>"
        },
        slash: true,
        options: [
            {
                name: "code",
                description: "JavaScript code to execute",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noCode: "Please provide code to evaluate!",
            executing: "⏳ Executing code...",
            success: "✅ Executed successfully",
            error: "❌ Execution error",
            input: "**Input:**",
            output: "**Output:**",
            executionTime: "**Execution Time:** %1ms",
            type: "**Type:** %1"
        },
        ne: {
            noCode: "कृपया मूल्याङ्कन गर्न कोड प्रदान गर्नुहोस्!",
            executing: "⏳ कोड कार्यान्वयन गर्दै...",
            success: "✅ सफलतापूर्वक कार्यान्वयन गरियो",
            error: "❌ कार्यान्वयन त्रुटि",
            input: "**इनपुट:**",
            output: "**आउटपुट:**",
            executionTime: "**कार्यान्वयन समय:** %1ms",
            type: "**प्रकार:** %1"
        }
    },

    onStart: async ({ message, interaction, args, client, getLang }) => {
        const code = args?.join(" ") || interaction?.options?.getString('code');

        if (!code) {
            const response = getLang("noCode");
            return message ? message.reply(response) : interaction.reply(response);
        }

        const startTime = Date.now();

        try {
            let evaled = eval(code);

            if (evaled instanceof Promise) {
                evaled = await evaled;
            }

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            let output = typeof evaled === 'string' ? evaled : util.inspect(evaled, { depth: 0 });

            if (output.length > 1000) {
                output = output.substring(0, 997) + "...";
            }

            const embed = new EmbedBuilder()
                .setTitle(getLang("success"))
                .setColor(0x00FF00)
                .addFields(
                    { name: getLang("input"), value: `\`\`\`js\n${code.substring(0, 1000)}\n\`\`\`` },
                    { name: getLang("output"), value: `\`\`\`js\n${output}\n\`\`\`` },
                    { name: getLang("type"), value: `\`${typeof evaled}\``, inline: true },
                    { name: getLang("executionTime").replace("%1", executionTime), value: "\u200b", inline: true }
                )
                .setTimestamp();

            return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });

        } catch (error) {
            const endTime = Date.now();
            const executionTime = endTime - startTime;

            let errorMessage = error.toString();
            if (errorMessage.length > 1000) {
                errorMessage = errorMessage.substring(0, 997) + "...";
            }

            const embed = new EmbedBuilder()
                .setTitle(getLang("error"))
                .setColor(0xFF0000)
                .addFields(
                    { name: getLang("input"), value: `\`\`\`js\n${code.substring(0, 1000)}\n\`\`\`` },
                    { name: getLang("output"), value: `\`\`\`js\n${errorMessage}\n\`\`\`` },
                    { name: getLang("executionTime").replace("%1", executionTime), value: "\u200b" }
                )
                .setTimestamp();

            return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
        }
    }
};
