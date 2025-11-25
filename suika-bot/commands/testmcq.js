const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "testmcq",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Answer a quiz question for rewards",
            ne: "पुरस्कारको लागि प्रश्नोत्तरी प्रश्नको जवाफ दिनुहोस्"
        },
        category: "fun",
        guide: {
            en: "{prefix}quiz",
            ne: "{prefix}quiz"
        },
        slash: true
    },

    langs: {
        en: {
            question: "❓ **Quiz Time!**\n\n%1\n\nReply with your answer (you have 30 seconds)",
            correct: "✅ Correct! You earned **$%1** and **%2 EXP**!",
            incorrect: "❌ Wrong! The correct answer was: **%1**",
            timeout: "⏰ Time's up! The correct answer was: **%1**"
        },
        ne: {
            question: "❓ **प्रश्नोत्तरी समय!**\n\n%1\n\nआफ्नो उत्तरसँग जवाफ दिनुहोस् (तपाईंसँग ३० सेकेन्ड छ)",
            correct: "✅ सही! तपाईंले **$%1** र **%2 EXP** कमाउनुभयो!",
            incorrect: "❌ गलत! सही उत्तर थियो: **%1**",
            timeout: "⏰ समय समाप्त! सही उत्तर थियो: **%1**"
        }
    },

    onStart: async ({ message, interaction, usersData, userData, getLang }) => {
        const questions = [
            { q: "What is 2 + 2?", a: "4" },
            { q: "What is the capital of France?", a: "paris" },
            { q: "How many continents are there?", a: "7" },
            { q: "What color is the sky?", a: "blue" },
            { q: "What is 10 x 5?", a: "50" }
        ];

        const quiz = questions[Math.floor(Math.random() * questions.length)];
        const questionText = getLang("question", quiz.q);

        const embed = new EmbedBuilder()
            .setDescription(questionText)
            .setColor(0x5865F2);

        const userId = message?.author.id || interaction.user.id;
        let botMessage;

        if (message) {
            botMessage = await message.reply({ embeds: [embed] });
        } else {
            botMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
        }

        global.RentoBot.onReply.set(botMessage.id, {
            commandName: "quiz",
            messageId: botMessage.id,
            author: userId,
            quiz: quiz,
            userData: userData,
            handler: async ({ message: replyMsg, usersData, getLang }) => {
                const answer = replyMsg.content.toLowerCase().trim();
                
                if (answer === quiz.a.toLowerCase()) {
                    const reward = Math.floor(Math.random() * 100) + 50;
                    const expReward = Math.floor(Math.random() * 20) + 10;

                    const currentData = await usersData.get(userId);
                    await usersData.set(userId, {
                        money: currentData.money + reward,
                        exp: currentData.exp + expReward
                    });

                    const resultEmbed = new EmbedBuilder()
                        .setDescription(getLang("correct", reward, expReward))
                        .setColor(0x57F287);

                    replyMsg.reply({ embeds: [resultEmbed] });
                } else {
                    const resultEmbed = new EmbedBuilder()
                        .setDescription(getLang("incorrect", quiz.a))
                        .setColor(0xED4245);

                    replyMsg.reply({ embeds: [resultEmbed] });
                }

                global.RentoBot.onReply.delete(botMessage.id);
            }
        });

        setTimeout(() => {
            if (global.RentoBot.onReply.has(botMessage.id)) {
                const timeoutEmbed = new EmbedBuilder()
                    .setDescription(getLang("timeout", quiz.a))
                    .setColor(0xFEE75C);

                if (message) {
                    message.channel.send({ embeds: [timeoutEmbed] });
                } else {
                    interaction.channel.send({ embeds: [timeoutEmbed] });
                }

                global.RentoBot.onReply.delete(botMessage.id);
            }
        }, 30000);
    }
};
