const axios = require('axios');

module.exports = {
    config: {
        name: "translate",
        aliases: ["trans"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Translate text to the desired language",
            ne: "इच्छित भाषामा पाठ अनुवाद गर्नुहोस्"
        },
        category: "utility",
        guide: {
            en: "{prefix}translate <text> -> <language_code>\n"
                + "Example: {prefix}translate hello -> es\n"
                + "Language codes: en (English), es (Spanish), fr (French), de (German), ja (Japanese), ko (Korean), etc.",
            ne: "{prefix}translate <पाठ> -> <भाषा_कोड>\n"
                + "उदाहरण: {prefix}translate hello -> es\n"
                + "भाषा कोडहरू: en (अंग्रेजी), es (स्पेनिश), fr (फ्रान्सेली), de (जर्मन), ja (जापानी), ko (कोरियाली), आदि।"
        },
        slash: true,
        options: [
            {
                name: "text",
                description: "Text to translate",
                type: 3,
                required: true
            },
            {
                name: "to",
                description: "Target language code (en, es, fr, de, ja, ko, etc.)",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            translateTo: "🌐 Translate from %1 to %2",
            invalidArgument: "❌ Invalid format. Use: translate <text> -> <language_code>",
            noText: "❌ Please provide text to translate",
            error: "❌ Translation error: %1"
        },
        ne: {
            translateTo: "🌐 %1 बाट %2 मा अनुवाद",
            invalidArgument: "❌ अमान्य ढाँचा। प्रयोग गर्नुहोस्: translate <पाठ> -> <भाषा_कोड>",
            noText: "❌ कृपया अनुवाद गर्न पाठ प्रदान गर्नुहोस्",
            error: "❌ अनुवाद त्रुटि: %1"
        }
    },

    onStart: async ({ message, interaction, args, getLang, client }) => {
        try {
            let content;
            let langCodeTrans = 'en';

            if (interaction) {
                content = interaction.options.getString('text');
                langCodeTrans = interaction.options.getString('to') || 'en';
            } else if (message) {
                content = args.join(" ");
                
                if (!content) {
                    return ctx.reply(getLang("noText"));
                }

                let lastIndexSeparator = content.lastIndexOf("->");
                if (lastIndexSeparator === -1) {
                    lastIndexSeparator = content.lastIndexOf("=>");
                }

                if (lastIndexSeparator !== -1 && (content.length - lastIndexSeparator === 4 || content.length - lastIndexSeparator === 5)) {
                    langCodeTrans = content.slice(lastIndexSeparator + 2).trim();
                    content = content.slice(0, lastIndexSeparator).trim();
                }
            }

            if (!content) {
                const response = getLang("noText");
                return message ? ctx.reply(response) : ctx.reply(response);
            }

            const { text, lang } = await translate(content.trim(), langCodeTrans.trim());
            const response = `${text}\n\n${getLang("translateTo", lang, langCodeTrans)}`;

            return message ? ctx.reply(response) : ctx.reply(response);
        } catch (error) {
            const errorMsg = getLang("error", error.message);
            return message ? ctx.reply(errorMsg) : ctx.reply(errorMsg);
        }
    }
};

async function translate(text, langCode) {
    const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);
    return {
        text: res.data[0].map(item => item[0]).join(''),
        lang: res.data[2]
    };
}
