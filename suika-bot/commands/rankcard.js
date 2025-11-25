module.exports = {
    config: {
        name: "rankcard",
        category: "Fun"
    },
    langs: {
        en: { desc: "Show rank card" }
    },
    onStart: async ({ ctx }) => {
        ctx.reply("🖼️ Rank card feature coming soon! Please use /stats for now.");
    }
};
