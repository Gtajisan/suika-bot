module.exports = {
    config: {
        name: "level",
        aliases: ["lv", "rank"],
        version: "1.0",
        author: "Gtajisan",
        countDown: 5,
        role: 0,
        description: { en: "Check your level and experience" },
        category: "info"
    },

    langs: {
        en: {
            level: `📊 *Level Information*\n\n📈 *Level:* %1\n⭐ *Experience:* %2\n🎯 *Next Level:* %3 EXP\n\n💬 /daily to gain experience`
        }
    },

    onStart: async ({ ctx, usersData, getLang }) => {
        try {
            const userId = String(ctx.from.id);
            const userData = await usersData.get(userId);
            const level = userData.level || 1;
            const experience = userData.experience || 0;
            const nextLevelExp = level * 100;

            const response = getLang("level", level, experience, nextLevelExp);
            await ctx.replyWithMarkdown(response);
        } catch (error) {
            await ctx.reply('❌ Error: ' + error.message);
        }
    }
};
