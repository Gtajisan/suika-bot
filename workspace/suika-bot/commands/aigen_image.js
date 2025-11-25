const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "aigen",
        aliases: ["aigenerator", "generateimage"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 10,
        role: 0,
        category: "ai",
        description: {
            en: "Generate AI images from prompts",
            ne: "AI द्वारा छविहरु उत्पन्न गर्नुहोस्"
        },
        guide: {
            en: "/aigen <model> <prompt>\nModels: flux-v3, pollinations, fantasy, weigen, flux-beta",
            ne: "/aigen <model> <prompt>"
        }
    },

    langs: {
        en: {
            usage: "❌ Usage: /aigen <model> <prompt>\nAvailable: flux-v3, pollinations, fantasy, weigen, flux-beta",
            invalidModel: "❌ Invalid model. Try: flux-v3, pollinations, fantasy, weigen, flux-beta",
            generating: "🎨 Generating image...",
            success: "✅ Generated with %1\n📝 Prompt: %2",
            error: "⚠️ Failed to generate image: %1"
        },
        ne: {
            usage: "❌ उपयोग: /aigen <model> <prompt>",
            invalidModel: "❌ अमान्य मोडेल",
            generating: "🎨 छवि उत्पन्न हो रहेको छ...",
            success: "✅ %1 सँग उत्पन्न\n📝 प्रॉम्प्ट: %2",
            error: "⚠️ त्रुटि: %1"
        }
    },

    onStart: async ({ ctx, args, getLang }) => {
        if (args.length < 2) {
            return ctx.reply(getLang("usage"));
        }

        const model = args[0].toLowerCase();
        const prompt = args.slice(1).join(" ");
        const baseURL = "https://aima-zero.vercel.app/api";

        const endpoints = {
            "flux-v3": "/flux-v3",
            "pollinations": "/pollinations",
            "fantasy": "/fantasy",
            "weigen": "/weigen",
            "flux-beta": "/flux-beta"
        };

        if (!endpoints[model]) {
            return ctx.reply(getLang("invalidModel"));
        }

        try {
            const msg = await ctx.reply(getLang("generating"));
            const url = `${baseURL}${endpoints[model]}?prompt=${encodeURIComponent(prompt)}`;

            const response = await axios.get(url, { responseType: "arraybuffer" });
            const cacheDir = path.join(__dirname, "../temp");
            fs.ensureDirSync(cacheDir);
            
            const imgPath = path.join(cacheDir, `aigen_${Date.now()}.png`);
            fs.writeFileSync(imgPath, response.data);

            await ctx.replyWithPhoto(
                { source: imgPath },
                { caption: getLang("success", model, prompt.substring(0, 50)) }
            );

            fs.unlinkSync(imgPath);
            await ctx.telegram.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});

        } catch (err) {
            ctx.reply(getLang("error", err.message.substring(0, 80)));
        }
    }
};
