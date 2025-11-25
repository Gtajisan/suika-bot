module.exports = {
    config: {
        name: "setlang",
        aliases: ["language", "lang"],
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Set your personal language preference",
            ne: "आफ्नो व्यक्तिगत भाषा प्राथमिकता सेट गर्नुहोस्"
        },
        category: "settings",
        slash: true,
        guide: {
            en: "{prefix}setlang <language_code> - Set your personal language\n"
                + "{prefix}setlang - Show current language\n"
                + "{prefix}setlang list - Show available languages\n\n"
                + "Supported languages:\n"
                + "• en - English\n"
                + "• ne - Nepali (नेपाली)",
            ne: "{prefix}setlang <language_code> - आफ्नो व्यक्तिगत भाषा सेट गर्नुहोस्\n"
                + "{prefix}setlang - हालको भाषा देखाउनुहोस्\n"
                + "{prefix}setlang list - उपलब्ध भाषाहरू देखाउनुहोस्\n\n"
                + "समर्थित भाषाहरू:\n"
                + "• en - English (अंग्रेजी)\n"
                + "• ne - Nepali (नेपाली)"
        },
        options:[
            {
                name: "language_code",
                description: "The language code to set (en, ne)",
                type: 3,
            }
        ]
    },

    langs: {
        en: {
            success: "✅ Your language has been changed to: **%1**\n\nThe bot will now respond to you in %2.",
            current: "📌 Your current language: **%1**\n\nUse `{prefix}setlang <code>` to change it.",
            invalid: "❌ Invalid language code. Supported languages: `en` (English), `ne` (Nepali)\n\nUse `{prefix}setlang list` to see all available languages.",
            list: "🌍 **Available Languages**\n\n"
                + "• `en` - English\n"
                + "• `ne` - Nepali (नेपाली)\n\n"
                + "Use `{prefix}setlang <code>` to set your language.",
            english: "English",
            nepali: "Nepali (नेपाली)"
        },
        ne: {
            success: "✅ तपाईंको भाषा परिवर्तन गरिएको छ: **%1**\n\nबटले अब तपाईंलाई %2 मा जवाफ दिनेछ।",
            current: "📌 तपाईंको हालको भाषा: **%1**\n\n`{prefix}setlang <code>` प्रयोग गरेर परिवर्तन गर्नुहोस्।",
            invalid: "❌ अवैध भाषा कोड। समर्थित भाषाहरू: `en` (अंग्रेजी), `ne` (नेपाली)\n\n`{prefix}setlang list` प्रयोग गरेर सबै उपलब्ध भाषाहरू हेर्नुहोस्।",
            list: "🌍 **उपलब्ध भाषाहरू**\n\n"
                + "• `en` - English (अंग्रेजी)\n"
                + "• `ne` - Nepali (नेपाली)\n\n"
                + "`{prefix}setlang <code>` प्रयोग गरेर आफ्नो भाषा सेट गर्नुहोस्।",
            english: "अंग्रेजी",
            nepali: "नेपाली"
        }
    },

    onStart: async ({ message, interaction, args, usersData, userData, getLang, prefix }) => {
        const isSlash = !!interaction;
        const supportedLanguages = ['en', 'ne'];
        const languageNames = {
            en: { en: 'English', ne: 'अंग्रेजी' },
            ne: { en: 'Nepali (नेपाली)', ne: 'नेपाली' }
        };

        const langCode = isSlash ? 
            interaction.options.getString('language_code') : 
            args?.[0];

        if (!langCode) {
            const currentLang = userData.settings?.language || "en";
            const response = getLang("current", currentLang)
                .replace(/{prefix}/g, prefix);
            return isSlash ? ctx.reply(response) : ctx.reply(response);
        }

        const langCodeLower = langCode.toLowerCase();

        if (langCodeLower === "list") {
            const response = getLang("list")
                .replace(/{prefix}/g, prefix);
            return isSlash ? ctx.reply(response) : ctx.reply(response);
        }

        if (!supportedLanguages.includes(langCodeLower)) {
            const response = getLang("invalid")
                .replace(/{prefix}/g, prefix);
            return isSlash ? ctx.reply({ content: response, ephemeral: true }) : ctx.reply(response);
        }

        const userID = isSlash ? interaction.user.id : message.author.id;
        const currentLang = userData.settings?.language || "en";

        await usersData.set(userID, {
            settings: {
                ...userData.settings,
                language: langCodeLower
            }
        });

        const langName = langCodeLower === 'en' ? getLang("english") : getLang("nepali");
        const response = getLang("success", langCodeLower, langName);
        return isSlash ? ctx.reply(response) : ctx.reply(response);
    }
};
