const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    config: {
        name: "work",
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Work to earn money",
            ne: "पैसा कमाउन काम गर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}work",
            ne: "{prefix}work"
        },
        slash: true
    },

    langs: {
        en: {
            working: "Choose a job to work:",
            earned: "💼 You worked as a **%1** and earned **$%2**!",
            timeout: "⏰ Work session timed out!",
            cooldown: "⏰ You're tired! Rest for **%1** before working again."
        },
        ne: {
            working: "काम गर्न एउटा काम छान्नुहोस्:",
            earned: "💼 तपाईंले **%1** को रूपमा काम गर्नुभयो र **$%2** कमाउनुभयो!",
            timeout: "⏰ काम सत्र समय समाप्त भयो!",
            cooldown: "⏰ तपाईं थकित हुनुहुन्छ! फेरि काम गर्नु अघि **%1** आराम गर्नुहोस्।"
        }
    },

    onStart: async ({ message, interaction, usersData, userData, getLang }) => {
        const now = Date.now();
        const lastWork = userData.data.lastWork || 0;
        const cooldown = 3600000;

        if (now - lastWork < cooldown) {
            const timeLeft = cooldown - (now - lastWork);
            const minutes = Math.floor(timeLeft / 60000);
            const response = getLang("cooldown", `${minutes}m`);
            return message ? message.reply(response) : interaction.reply(response);
        }

        const jobs = [
            { name: "Developer", min: 300, max: 800 },
            { name: "Designer", min: 250, max: 700 },
            { name: "Teacher", min: 200, max: 600 },
            { name: "Chef", min: 180, max: 550 }
        ];

        const row = new ActionRowBuilder()
            .addComponents(
                jobs.map((job, index) => 
                    new ButtonBuilder()
                        .setCustomId(`work_${index}`)
                        .setLabel(job.name)
                        .setStyle(ButtonStyle.Primary)
                )
            );

        const embed = new EmbedBuilder()
            .setDescription(getLang("working"))
            .setColor(0x5865F2);

        const reply = message ? 
            await message.reply({ embeds: [embed], components: [row] }) : 
            await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const buttonHandler = async (btnInteraction) => {
            if (btnInteraction.user.id !== (message?.author.id || interaction.user.id)) {
                return btnInteraction.reply({ content: "This is not your work session!", ephemeral: true });
            }

            const jobIndex = parseInt(btnInteraction.customId.split('_')[1]);
            const job = jobs[jobIndex];
            const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

            await usersData.set(btnInteraction.user.id, {
                money: userData.money + earned,
                data: { ...userData.data, lastWork: now }
            });

            const resultEmbed = new EmbedBuilder()
                .setDescription(getLang("earned", job.name, earned))
                .setColor(0x57F287);

            await btnInteraction.update({ embeds: [resultEmbed], components: [] });
            global.RentoBot.onButton.delete(btnInteraction.customId);
        };

        jobs.forEach((_, index) => {
            global.RentoBot.onButton.set(`work_${index}`, buttonHandler);
        });

        setTimeout(() => {
            jobs.forEach((_, index) => {
                global.RentoBot.onButton.delete(`work_${index}`);
            });
        }, 60000);
    }
};
