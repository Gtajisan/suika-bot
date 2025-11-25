const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "upscale",
        aliases: ["4k", "enhance"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 10,
        role: 0,
        category: "image",
        description: {
            en: "Enhance image quality to 4K resolution",
            ne: "छवि गुणस्तर 4K मा बढाउनुहोस्"
        },
        guide: {
            en: "/upscale [reply to image]",
            ne: "/upscale [छविमा उत्तर दिनुहोस्]"
        }
    },

    langs: {
        en: {
            noImage: "❌ Please reply to an image to enhance it",
            processing: "🖼️ Enhancing image to 4K...",
            success: "✅ Image enhanced successfully!",
            error: "⚠️ Failed to enhance image: %1"
        },
        ne: {
            noImage: "❌ कृपया छविमा उत्तर दिनुहोस्",
            processing: "🖼️ छवि बढाइ रहेको छ...",
            success: "✅ छवि सफलतापूर्वक बढाइयो!",
            error: "⚠️ त्रुटि: %1"
        }
    },

    onStart: async ({ ctx, getLang }) => {
        // Check if reply to photo
        if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
            return ctx.reply(getLang("noImage"));
        }

        try {
            const msg = await ctx.reply(getLang("processing"));
            const photo = ctx.message.reply_to_message.photo;
            const fileId = photo[photo.length - 1].file_id;

            // Get file info
            const fileInfo = await ctx.telegram.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${fileInfo.file_path}`;

            // Call upscale API
            const apiUrl = `https://hridoy-apis.vercel.app/tools/remini?url=${encodeURIComponent(fileUrl)}&apikey=hridoyXQC`;

            const response = await axios.get(apiUrl, { timeout: 30000 });

            if (response.data && response.data.status && response.data.result) {
                const enhancedImgResponse = await axios.get(response.data.result, {
                    responseType: 'arraybuffer',
                    timeout: 15000
                });

                const tempDir = path.join(__dirname, "../temp");
                fs.ensureDirSync(tempDir);
                const imagePath = path.join(tempDir, `upscale_${Date.now()}.jpg`);
                fs.writeFileSync(imagePath, Buffer.from(enhancedImgResponse.data));

                await ctx.replyWithPhoto(
                    { source: imagePath },
                    { caption: getLang("success") }
                );

                fs.unlinkSync(imagePath);
                await ctx.telegram.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});
            } else {
                throw new Error('Invalid API response');
            }

        } catch (error) {
            ctx.reply(getLang("error", error.message.substring(0, 80)));
        }
    }
};
