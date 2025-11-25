
module.exports = {
    config: {
        name: "leaderboard",
        aliases: ["lb", "top", "rank"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "View the leaderboard",
            ne: "लिडरबोर्ड हेर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}leaderboard [money|level|wealth]",
            ne: "{prefix}leaderboard [money|level|wealth]"
        },
        slash: true,
        options: [
            {
                name: "type",
                description: "Leaderboard type",
                type: 3,
                required: false,
                choices: [
                    { name: "Money (Wallet)", value: "money" },
                    { name: "Level", value: "level" },
                    { name: "Wealth (Total)", value: "wealth" }
                ]
            }
        ]
    },

    langs: {
        en: {
            title: "🏆 **%1 Leaderboard**\nPage %2/%3",
            noData: "❌ No data available for leaderboard.",
            yourRank: "\n\n📍 **Your Rank:** #%1"
        },
        ne: {
            title: "🏆 **%1 लिडरबोर्ड**\nपृष्ठ %2/%3",
            noData: "❌ लिडरबोर्डको लागि कुनै डाटा उपलब्ध छैन।",
            yourRank: "\n\n📍 **तपाईंको रैंक:** #%1"
        }
    },

    onStart: async ({ message, interaction, args, usersData, getLang }) => {
        const isSlash = !message;
        const user = isSlash ? interaction.user : message.author;
        const type = isSlash ? (interaction.options.getString('type') || 'money') : (args[0]?.toLowerCase() || 'money');

        let sortedUsers = [];
        const allUsers = global.db.allUserData || [];

        if (type === "money" || type === "m") {
            sortedUsers = allUsers.sort((a, b) => b.money - a.money);
        } else if (type === "level" || type === "l") {
            sortedUsers = allUsers
                .filter(u => u.exp > 0)
                .sort((a, b) => b.exp - a.exp);
        } else if (type === "wealth" || type === "w") {
            sortedUsers = allUsers.sort((a, b) => (b.money + b.bank) - (a.money + a.bank));
        } else {
            sortedUsers = allUsers.sort((a, b) => b.money - a.money);
        }

        if (sortedUsers.length === 0) {
            return isSlash ? 
                ctx.reply({ content: getLang("noData"), ephemeral: true }) : 
                ctx.reply(getLang("noData"));
        }

        const itemsPerPage = 10;
        const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
        let currentPage = 0;

        const userRank = sortedUsers.findIndex(u => u.userID === user.id) + 1;

        const generateEmbed = async (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageUsers = sortedUsers.slice(start, end);

            let description = "";
            for (let i = 0; i < pageUsers.length; i++) {
                const rank = start + i + 1;
                const userData = pageUsers[i];
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `**${rank}.**`;

                let value = "";
                if (type === "money" || type === "m") {
                    value = `$${userData.money.toLocaleString()}`;
                } else if (type === "level" || type === "l") {
                    const level = global.utils.calculateLevel(userData.exp);
                    value = `Level ${level} (${userData.exp} XP)`;
                } else {
                    value = `$${(userData.money + userData.bank).toLocaleString()}`;
                }

                const name = userData.name || await usersData.getName(userData.userID);
                description += `${medal} **${name}** - ${value}\n`;
            }

            if (userRank > 0) {
                description += getLang("yourRank", userRank);
            }

            const typeTitle = type === "level" || type === "l" ? "Level" : 
                            type === "wealth" || type === "w" ? "Wealth" : "Money";

            const embed = {}
                // Description: getLang("title", typeTitle, page + 1, totalPages + "\n\n" + description*/ //(0xFFD700)
                .setTimestamp();

            return embed;
        };

        const embed = await generateEmbed(currentPage);

        if (totalPages <= 1) {
            return isSlash ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lb_prev')
                    .setLabel('◀ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('lb_next')
                    .setLabel('Next ▶')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(totalPages <= 1)
            );

        const reply = isSlash ? 
            await ctx.reply({ embeds: [embed], components: [row], fetchReply: true }) : 
            await ctx.reply({ embeds: [embed], components: [row] });

        const buttonHandler = async (btnInteraction) => {
            if (btnInteraction.user.id !== user.id) {
                return btnInteraction.reply({ content: "This is not your leaderboard!", ephemeral: true });
            }

            if (btnInteraction.customId === 'lb_prev') {
                currentPage = Math.max(0, currentPage - 1);
            } else if (btnInteraction.customId === 'lb_next') {
                currentPage = Math.min(totalPages - 1, currentPage + 1);
            }

            const newEmbed = await generateEmbed(currentPage);
            const newRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('lb_prev')
                        .setLabel('◀ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('lb_next')
                        .setLabel('Next ▶')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1)
                );

            await btnInteraction.update({ embeds: [newEmbed], components: [newRow] });
        };

        global.RentoBot.onButton.set('lb_prev', buttonHandler);
        global.RentoBot.onButton.set('lb_next', buttonHandler);

        setTimeout(() => {
            global.RentoBot.onButton.delete('lb_prev');
            global.RentoBot.onButton.delete('lb_next');
        }, 300000);
    }
};