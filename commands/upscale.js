const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "upscale",
        aliases: ["4k"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 10,
        role: 0,
        category: "image",
        description: { en: "Enhance image to 4K", ne: "छवि 4K मा बढाउनुहोस्" },
        guide: { en: "/upscale [reply to image]", ne: "/upscale [छविमा उत्तर]" }
    },
    langs: {
        en: { noimg: "❌ Reply to an image", processing: "🖼️ Processing...", success: "✅ Done!", error: "⚠️ Error: %1" },
        ne: { noimg: "❌ छविमा उत्तर दिनुहोस्", processing: "🖼️ कार्य गरिरहेको", success: "✅ पूर्ण!", error: "⚠️ त्रुटि: %1" }
    },
    onStart: async ({ ctx, getLang }) => {
        if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) return ctx.reply(getLang("noimg"));
        try {
            const msg = await ctx.reply(getLang("processing"));
            const photo = ctx.message.reply_to_message.photo;
            const fileId = photo[photo.length - 1].file_id;
            const fileInfo = await ctx.telegram.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${fileInfo.file_path}`;
            const apiUrl = `https://hridoy-apis.vercel.app/tools/remini?url=${encodeURIComponent(fileUrl)}&apikey=hridoyXQC`;
            const res = await axios.get(apiUrl, { timeout: 30000 });
            if (res.data.status && res.data.result) {
                const imgRes = await axios.get(res.data.result, { responseType: 'arraybuffer', timeout: 15000 });
                const dir = path.join(__dirname, "../temp");
                fs.ensureDirSync(dir);
                const imgPath = path.join(dir, `upscale_${Date.now()}.jpg`);
                fs.writeFileSync(imgPath, imgRes.data);
                await ctx.replyWithPhoto({ source: imgPath }, { caption: getLang("success") });
                fs.unlinkSync(imgPath);
            }
            await ctx.telegram.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});
        } catch (err) { ctx.reply(getLang("error", err.message.substring(0, 60))); }
    }
};
