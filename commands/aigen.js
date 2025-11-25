const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "aigen",
        aliases: ["aigenerator"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 10,
        role: 0,
        category: "ai",
        description: { en: "Generate AI images", ne: "छविहरु उत्पन्न गर्नुहोस्" },
        guide: { en: "/aigen <model> <prompt>", ne: "/aigen <model> <prompt>" }
    },
    langs: {
        en: { usage: "❌ /aigen flux-v3 <prompt>", error: "⚠️ Error: %1", generating: "🎨 Generating..." },
        ne: { usage: "❌ उपयोग गलत छ", error: "⚠️ त्रुटि: %1", generating: "🎨 उत्पन्न हो रहेको" }
    },
    onStart: async ({ ctx, args, getLang }) => {
        if (args.length < 2) return ctx.reply(getLang("usage"));
        const model = args[0].toLowerCase(), prompt = args.slice(1).join(" ");
        const endpoints = { "flux-v3": "/flux-v3", "pollinations": "/pollinations", "fantasy": "/fantasy", "weigen": "/weigen" };
        if (!endpoints[model]) return ctx.reply("❌ Invalid model");
        try {
            const msg = await ctx.reply(getLang("generating"));
            const url = `https://aima-zero.vercel.app/api${endpoints[model]}?prompt=${encodeURIComponent(prompt)}`;
            const res = await axios.get(url, { responseType: "arraybuffer" });
            const dir = path.join(__dirname, "../temp");
            fs.ensureDirSync(dir);
            const imgPath = path.join(dir, `aigen_${Date.now()}.png`);
            fs.writeFileSync(imgPath, res.data);
            await ctx.replyWithPhoto({ source: imgPath }, { caption: `✅ Generated with ${model}` });
            fs.unlinkSync(imgPath);
            await ctx.telegram.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});
        } catch (err) { ctx.reply(getLang("error", err.message.substring(0, 80))); }
    }
};
