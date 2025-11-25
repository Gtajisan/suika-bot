const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "restart",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Restart the bot",
            ne: "बट पुनः सुरु गर्नुहोस्"
        },
        category: "owner",
        guide: {
            en: "{prefix}restart",
            ne: "{prefix}restart"
        },
        slash: true,
        options: []
    },

    langs: {
        en: {
            restarting: "🔄 Restarting bot...\nPlease wait a moment for the bot to come back online.",
            restartSuccess: "✅ Bot is restarting now!"
        },
        ne: {
            restarting: "🔄 बट पुनः सुरु गर्दै...\nकृपया बट अनलाइन फर्कन एक क्षण पर्खनुहोस्।",
            restartSuccess: "✅ बट अहिले पुनः सुरु भइरहेको छ!"
        }
    },

    onStart: async ({ message, interaction, getLang }) => {
        const response = getLang("restarting");
        const isInteraction = !!interaction;
        
        let statusMessage;
        if (isInteraction) {
            await ctx.reply({ content: response });
            statusMessage = await interaction.fetchReply();
        } else {
            statusMessage = await ctx.reply(response);
        }

        const userId = isInteraction ? interaction.user.id : message.author.id;
        const channelId = statusMessage.channelId;
        const messageId = statusMessage.id;
        const timestamp = Date.now();

        const tmpDir = path.join(__dirname, 'tmp');
        await fs.ensureDir(tmpDir);

        await fs.writeFile(
            path.join(tmpDir, 'restart.txt'),
            `${channelId}|${userId}|${messageId}|${timestamp}`
        );

        setTimeout(() => {
            process.exit(2);
        }, 1000);
    }
};
