module.exports = {
    config: {
        name: "weather",
        category: "Fun"
    },
    langs: {
        en: { desc: "Get weather info" }
    },
    onStart: async ({ ctx, args }) => {
        if (!args[0]) return ctx.reply("❌ Please specify a city: /weather London");
        ctx.reply(`🌤️ Weather for ${args[0]} is loading...`);
    }
};
