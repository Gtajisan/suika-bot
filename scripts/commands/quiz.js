
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "quiz",
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Answer quiz questions from various subjects for rewards",
            ne: "पुरस्कारको लागि विभिन्न विषयहरूबाट प्रश्नोत्तरी प्रश्नहरूको जवाफ दिनुहोस्"
        },
        category: "fun",
        guide: {
            en: "{prefix}quiz - Random question from random subject\n{prefix}quiz <subject> - Question from specific subject\nAvailable subjects: anime, chemistry, computer, english, math, physics",
            ne: "{prefix}quiz - अनियमित विषयबाट अनियमित प्रश्न\n{prefix}quiz <विषय> - विशेष विषयबाट प्रश्न\nउपलब्ध विषयहरू: anime, chemistry, computer, english, math, physics"
        },
        slash: true,
        options: [
            {
                name: "subject",
                description: "Choose a specific subject (anime, chemistry, computer, english, math, physics)",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            question: "📚 **%1 Quiz**\n\n**Question:**\n%2",
            correct: "✅ **Correct!**\n\nYou earned **$%1** and **%2 EXP**! 🎉",
            incorrect: "❌ **Wrong!**\n\nThe correct answer was: **%1**",
            invalidSubject: "❌ Invalid subject! Available subjects: `anime`, `chemistry`, `computer`, `english`, `math`, `physics`",
            errorLoading: "❌ Failed to load quiz data. Please try again later.",
            playAgain: "Play again?",
            notYourQuiz: "This is not your quiz!"
        },
        ne: {
            question: "📚 **%1 प्रश्नोत्तरी**\n\n**प्रश्न:**\n%2",
            correct: "✅ **सही!**\n\nतपाईंले **$%1** र **%2 EXP** कमाउनुभयो! 🎉",
            incorrect: "❌ **गलत!**\n\nसही उत्तर थियो: **%1**",
            invalidSubject: "❌ अमान्य विषय! उपलब्ध विषयहरू: `anime`, `chemistry`, `computer`, `english`, `math`, `physics`",
            errorLoading: "❌ प्रश्नोत्तरी डाटा लोड गर्न असफल। कृपया पछि पुन: प्रयास गर्नुहोस्।",
            playAgain: "फेरि खेल्नुहोस्?",
            notYourQuiz: "यो तपाईंको प्रश्नोत्तरी होइन!"
        }
    },

    onStart: async ({ message, interaction, args, usersData, userData, getLang }) => {
        const userId = message?.author.id || interaction.user.id;
        const isSlash = !message;

        // Determine subject
        let subject = isSlash ? interaction.options?.getString('subject') : args?.[0];
        const quizPath = path.join(__dirname, 'assets', 'quiz');

        // Get available subjects
        const availableSubjects = fs.readdirSync(quizPath)
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));

        let isSubjectSpecified = false;

        // If subject specified, validate it
        if (subject) {
            subject = subject.toLowerCase();
            if (!availableSubjects.includes(subject)) {
                const response = getLang("invalidSubject");
                return message ? message.reply(response) : interaction.reply({ content: response, ephemeral: true });
            }
            isSubjectSpecified = true;
        } else {
            // Random subject
            subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
        }

        // Load questions from the subject
        const subjectPath = path.join(quizPath, `${subject}.json`);
        let questions;

        try {
            const fileContent = fs.readFileSync(subjectPath, 'utf8');
            questions = JSON.parse(fileContent);
        } catch (error) {
            console.error(`Error loading quiz data from ${subject}:`, error);
            const response = getLang("errorLoading");
            return message ? message.reply(response) : interaction.reply({ content: response, ephemeral: true });
        }

        // Get random question
        const questionData = questions[Math.floor(Math.random() * questions.length)];

        // Send quiz
        await sendQuiz(message, interaction, questionData, subject, userId, usersData, userData, getLang, isSlash, isSubjectSpecified, availableSubjects);
    }
};

async function sendQuiz(message, interaction, questionData, subject, userId, usersData, userData, getLang, isSlash, isSubjectSpecified, availableSubjects) {
    // Create answer buttons
    const answerRow = new ActionRowBuilder()
        .addComponents(
            ['A', 'B', 'C', 'D'].map(option => 
                new ButtonBuilder()
                    .setCustomId(`quiz_${userId}_${option}`)
                    .setLabel(option)
                    .setStyle(ButtonStyle.Primary)
            )
        );

    // Create quit button row
    const quitRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`quiz_quit_${userId}`)
                .setLabel('❌ Quit')
                .setStyle(ButtonStyle.Danger)
        );

    // Create question embed with options
    const questionWithOptions = `${questionData.question}\n\n**A:** ${questionData.A}\n**B:** ${questionData.B}\n**C:** ${questionData.C}\n**D:** ${questionData.D}`;
    const questionText = getLang("question", subject.charAt(0).toUpperCase() + subject.slice(1), questionWithOptions);
    const embed = new EmbedBuilder()
        .setDescription(questionText)
        .setColor(0x5865F2)
        .setFooter({ text: `Subject: ${subject} | Answer within 30 seconds` })
        .setTimestamp();

    // Send the quiz
    const reply = isSlash ? 
        await interaction.reply({ embeds: [embed], components: [answerRow, quitRow], fetchReply: true }) : 
        await message.reply({ embeds: [embed], components: [answerRow, quitRow] });

    // Cleanup function to remove all button handlers
    const cleanupHandlers = () => {
        ['A', 'B', 'C', 'D'].forEach(option => {
            global.RentoBot.onButton.delete(`quiz_${userId}_${option}`);
        });
        global.RentoBot.onButton.delete(`quiz_playagain_${userId}`);
        global.RentoBot.onButton.delete(`quiz_quit_${userId}`);
    };

    // Handle button clicks
    const buttonHandler = async (btnInteraction) => {
        // Check if it's the right user
        if (btnInteraction.user.id !== userId) {
            return btnInteraction.reply({ content: getLang("notYourQuiz"), ephemeral: true });
        }

        // Defer immediately to prevent timeout
        await btnInteraction.deferUpdate();

        // Get selected answer
        const selectedAnswer = btnInteraction.customId.split('_')[2];
        const correctAnswer = questionData.answer;
        const isCorrect = selectedAnswer === correctAnswer;

        // Remove answer buttons
        cleanupHandlers();

        let resultEmbed;

        if (isCorrect) {
            // Calculate rewards
            const coinReward = Math.floor(Math.random() * 100) + 50; // 50-150 coins
            const expReward = Math.floor(Math.random() * 30) + 20; // 20-50 exp

            // Give rewards
            const currentData = await usersData.get(userId);
            await usersData.set(userId, {
                money: currentData.money + coinReward,
                exp: currentData.exp + expReward
            });

            resultEmbed = new EmbedBuilder()
                .setDescription(getLang("correct", coinReward, expReward))
                .setColor(0x57F287)
                .setTimestamp();
        } else {
            resultEmbed = new EmbedBuilder()
                .setDescription(getLang("incorrect", `${correctAnswer}: ${questionData[correctAnswer]}`))
                .setColor(0xED4245)
                .setTimestamp();
        }

        // Add Play Again button
        const playAgainRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`quiz_playagain_${userId}`)
                    .setLabel('🔄 Play Again')
                    .setStyle(ButtonStyle.Success)
            );

        await btnInteraction.editReply({ embeds: [resultEmbed], components: [playAgainRow] });

        // Register Play Again handler
        setupPlayAgainHandler(userId, usersData, getLang, isSubjectSpecified, subject, availableSubjects);
    };

    // Handle quit button
    const quitHandler = async (btnInteraction) => {
        if (btnInteraction.user.id !== userId) {
            return btnInteraction.reply({ content: getLang("notYourQuiz"), ephemeral: true });
        }

        await btnInteraction.deferUpdate();
        cleanupHandlers();

        const quitEmbed = new EmbedBuilder()
            .setDescription('❌ **Quiz Ended**\n\nYou have quit the quiz.')
            .setColor(0x95A5A6)
            .setTimestamp();

        await btnInteraction.editReply({ embeds: [quitEmbed], components: [] });
    };

    // Register button handlers for answers
    ['A', 'B', 'C', 'D'].forEach(option => {
        global.RentoBot.onButton.set(`quiz_${userId}_${option}`, buttonHandler);
    });

    // Register quit handler
    global.RentoBot.onButton.set(`quiz_quit_${userId}`, quitHandler);

    // Auto-remove buttons after 30 seconds
    setTimeout(() => {
        cleanupHandlers();
    }, 30000);
}

function setupPlayAgainHandler(userId, usersData, getLang, isSubjectSpecified, originalSubject, availableSubjects) {
    const playAgainHandler = async (paInteraction) => {
        if (paInteraction.user.id !== userId) {
            return paInteraction.reply({ content: getLang("notYourQuiz"), ephemeral: true });
        }

        // Defer the interaction immediately to prevent timeout
        await paInteraction.deferUpdate();

        // Remove play again button handler
        global.RentoBot.onButton.delete(`quiz_playagain_${userId}`);

        // Determine subject for next quiz
        let newSubject;
        if (isSubjectSpecified) {
            // Use the same subject if originally specified
            newSubject = originalSubject;
        } else {
            // Use random subject if originally random
            newSubject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
        }

        const quizPath = path.join(__dirname, 'assets', 'quiz');
        const subjectPath = path.join(quizPath, `${newSubject}.json`);

        try {
            const fileContent = fs.readFileSync(subjectPath, 'utf8');
            const questions = JSON.parse(fileContent);
            const newQuestionData = questions[Math.floor(Math.random() * questions.length)];

            // Create new answer buttons
            const newAnswerRow = new ActionRowBuilder()
                .addComponents(
                    ['A', 'B', 'C', 'D'].map(option => 
                        new ButtonBuilder()
                            .setCustomId(`quiz_${userId}_${option}`)
                            .setLabel(option)
                            .setStyle(ButtonStyle.Primary)
                    )
                );

            // Create quit button row
            const newQuitRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`quiz_quit_${userId}`)
                        .setLabel('❌ Quit')
                        .setStyle(ButtonStyle.Danger)
                );

            // Create new question embed with options
            const newQuestionWithOptions = `${newQuestionData.question}\n\n**A:** ${newQuestionData.A}\n**B:** ${newQuestionData.B}\n**C:** ${newQuestionData.C}\n**D:** ${newQuestionData.D}`;
            const newQuestionText = getLang("question", newSubject.charAt(0).toUpperCase() + newSubject.slice(1), newQuestionWithOptions);
            const newEmbed = new EmbedBuilder()
                .setDescription(newQuestionText)
                .setColor(0x5865F2)
                .setFooter({ text: `Subject: ${newSubject} | Answer within 30 seconds` })
                .setTimestamp();

            await paInteraction.editReply({ embeds: [newEmbed], components: [newAnswerRow, newQuitRow] });

            // Cleanup function for this quiz instance
            const cleanupHandlers = () => {
                ['A', 'B', 'C', 'D'].forEach(option => {
                    global.RentoBot.onButton.delete(`quiz_${userId}_${option}`);
                });
                global.RentoBot.onButton.delete(`quiz_playagain_${userId}`);
                global.RentoBot.onButton.delete(`quiz_quit_${userId}`);
            };

            // Create answer handler for new question
            const answerHandler = async (btnInteraction) => {
                if (btnInteraction.user.id !== userId) {
                    return btnInteraction.reply({ content: getLang("notYourQuiz"), ephemeral: true });
                }

                // Defer immediately to prevent timeout
                await btnInteraction.deferUpdate();

                const selectedAnswer = btnInteraction.customId.split('_')[2];
                const correctAnswer = newQuestionData.answer;
                const isCorrect = selectedAnswer === correctAnswer;

                // Remove all handlers
                cleanupHandlers();

                let resultEmbed;

                if (isCorrect) {
                    const coinReward = Math.floor(Math.random() * 100) + 50;
                    const expReward = Math.floor(Math.random() * 30) + 20;

                    const currentData = await usersData.get(userId);
                    await usersData.set(userId, {
                        money: currentData.money + coinReward,
                        exp: currentData.exp + expReward
                    });

                    resultEmbed = new EmbedBuilder()
                        .setDescription(getLang("correct", coinReward, expReward))
                        .setColor(0x57F287)
                        .setTimestamp();
                } else {
                    resultEmbed = new EmbedBuilder()
                        .setDescription(getLang("incorrect", `${correctAnswer}: ${newQuestionData[correctAnswer]}`))
                        .setColor(0xED4245)
                        .setTimestamp();
                }

                const playAgainRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`quiz_playagain_${userId}`)
                            .setLabel('🔄 Play Again')
                            .setStyle(ButtonStyle.Success)
                    );

                await btnInteraction.editReply({ embeds: [resultEmbed], components: [playAgainRow] });

                // Setup play again handler recursively with same settings
                setupPlayAgainHandler(userId, usersData, getLang, isSubjectSpecified, originalSubject, availableSubjects);
            };

            // Handle quit button for new question
            const quitHandler = async (btnInteraction) => {
                if (btnInteraction.user.id !== userId) {
                    return btnInteraction.reply({ content: getLang("notYourQuiz"), ephemeral: true });
                }

                await btnInteraction.deferUpdate();
                cleanupHandlers();

                const quitEmbed = new EmbedBuilder()
                    .setDescription('❌ **Quiz Ended**\n\nYou have quit the quiz.')
                    .setColor(0x95A5A6)
                    .setTimestamp();

                await btnInteraction.editReply({ embeds: [quitEmbed], components: [] });
            };

            // Register answer handlers
            ['A', 'B', 'C', 'D'].forEach(option => {
                global.RentoBot.onButton.set(`quiz_${userId}_${option}`, answerHandler);
            });

            // Register quit handler
            global.RentoBot.onButton.set(`quiz_quit_${userId}`, quitHandler);

            // Set timeout for cleanup
            setTimeout(() => {
                cleanupHandlers();
            }, 30000);

        } catch (error) {
            console.error('Error loading new quiz:', error);
            try {
                await paInteraction.editReply({ 
                    content: getLang("errorLoading"), 
                    embeds: [], 
                    components: [] 
                });
            } catch (err) {
                console.error('Error responding to interaction:', err);
            }
        }
    };

    // Register play again handler
    global.RentoBot.onButton.set(`quiz_playagain_${userId}`, playAgainHandler);

    // Auto-remove play again button after 60 seconds
    setTimeout(() => {
        global.RentoBot.onButton.delete(`quiz_playagain_${userId}`);
    }, 60000);
}
