const axios = require("axios");
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "compile",
        aliases: ["run", "code"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Compile and run code in various programming languages",
            ne: "विभिन्न प्रोग्रामिङ भाषाहरूमा कोड कम्पाइल र चलाउनुहोस्"
        },
        category: "utility",
        guide: {
            en: "{pn} <language> ^^ <code>\n\nExample:\n{pn} cpp ^^ #include <iostream>\nusing namespace std;\nint main() {\n  cout << \"Hello, world!\" << endl;\n  return 0;\n}\n\nSupported languages: python, nodejs, c, cpp, ruby, csharp, java, php, swift, go, rust, typescript, r, bash, perl, scala, kotlin, lua, haskell, dart, and more",
            ne: "{pn} <भाषा> ^^ <कोड>\n\nउदाहरण:\n{pn} python ^^ print('Hello, world!')"
        },
        slash: true,
        options: [
            {
                name: "language",
                description: "Programming language (python, nodejs, cpp, java, etc.)",
                type: 3,
                required: true
            },
            {
                name: "code",
                description: "Code to compile and run",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            invalidLanguage: "❌ Invalid language. Supported languages are: {languages}\n\nExample:\n{prefix}compile cpp ^^ #include <iostream>\nusing namespace std;\nint main() {\n  cout << \"Hello, world!\" << endl;\n  return 0;\n}",
            loading: "⏳ Compiling and executing your code...",
            error: "❌ Error",
            success: "✅ Program Output",
            executionTime: "⏱️ Execution Time"
        },
        ne: {
            invalidLanguage: "❌ अवैध भाषा। समर्थित भाषाहरू: {languages}\n\nउदाहरण:\n{prefix}compile python ^^ print('Hello, world!')",
            loading: "⏳ तपाईंको कोड कम्पाइल र कार्यान्वयन गर्दै...",
            error: "❌ त्रुटि",
            success: "✅ कार्यक्रम आउटपुट",
            executionTime: "⏱️ कार्यान्वयन समय"
        }
    },

    onStart: async ({ message, interaction, args, getLang, prefix }) => {
        const isSlash = !!interaction;

        const supportedLanguages = [
            "python", "nodejs", "c", "cpp", "ruby", "csharp", "fsharp", "java", 
            "erlang", "php", "swift", "go", "rust", "typescript", "r", "bash", 
            "perl", "scala", "kotlin", "lua", "haskell", "dart", "groovy", 
            "powershell", "elixir", "coffeescript", "assembly", "matlab", 
            "objective-c", "sql", "fortran", "cobol", "scheme", "clojure", 
            "racket", "prolog", "lisp", "smalltalk", "perl6", "vbscript", 
            "apl", "julia", "ocaml", "rpg"
        ];

        let language, code;

        if (isSlash) {
            language = interaction.options.getString('language').toLowerCase();
            code = interaction.options.getString('code');
        } else {
            const input = args.join(" ").split(" ^^ ");
            language = input[0]?.toLowerCase();
            code = input[1];
        }

        if (!supportedLanguages.includes(language) || !code) {
            const errorMsg = getLang("invalidLanguage")
                .replace(/{languages}/g, supportedLanguages.join(", "))
                .replace(/{prefix}/g, prefix);

            return isSlash 
                ? interaction.reply({ content: errorMsg, ephemeral: true })
                : message.reply(errorMsg);
        }

        const loadingMsg = getLang("loading");
        let waitMessage;

        if (isSlash) {
            await interaction.reply(loadingMsg);
            waitMessage = await interaction.fetchReply();
        } else {
            waitMessage = await message.reply(loadingMsg);
        }

        try {
            const startTime = new Date();
            const response = await axios.post("https://api.jdoodle.com/v1/execute", {
                script: code,
                language: language === "cpp" ? "cpp14" : language === "python" ? "python3" : language,
                versionIndex: "0",
                clientId: "3a20bbfa72b79d29d3ca81812a2ee18b",
                clientSecret: "1121d25dc7998715c500218d3abeae8edab573fe7ef2c1577fe0768802d92d68"
            });

            const result = response.data;
            const endTime = new Date();
            const executionTime = (endTime - startTime) / 1000;

            if (result.error) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle(`${getLang("error")} - ${language.toUpperCase()}`)
                    .setDescription(`\`\`\`\n${result.error}\`\`\``)
                    .setColor(0xE74C3C)
                    .setTimestamp();

                if (isSlash) {
                    await interaction.editReply({ content: null, embeds: [errorEmbed] });
                } else {
                    await waitMessage.edit({ content: null, embeds: [errorEmbed] });
                }
            } else {
                const output = result.output || "No output";
                const truncatedOutput = output.length > 4000 
                    ? output.substring(0, 4000) + "\n... (output truncated)" 
                    : output;

                const successEmbed = new EmbedBuilder()
                    .setTitle(`${getLang("success")} - ${language.toUpperCase()}`)
                    .setDescription(`\`\`\`\n${truncatedOutput}\`\`\``)
                    .setColor(0x2ECC71)
                    .addFields({
                        name: getLang("executionTime"),
                        value: `${executionTime.toFixed(2)}s`,
                        inline: true
                    })
                    .setTimestamp();

                if (isSlash) {
                    await interaction.editReply({ content: null, embeds: [successEmbed] });
                } else {
                    await waitMessage.edit({ content: null, embeds: [successEmbed] });
                }
            }
        } catch (error) {
            console.error("Error compiling code:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle(`${getLang("error")}`)
                .setDescription(`\`\`\`\n${error.message}\`\`\``)
                .setColor(0xE74C3C)
                .setTimestamp();

            if (isSlash) {
                await interaction.editReply({ content: null, embeds: [errorEmbed] });
            } else {
                await waitMessage.edit({ content: null, embeds: [errorEmbed] });
            }
        }
    }
};