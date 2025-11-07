
const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "slot",
        aliases: ["slots", "spin"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Play the slot machine and win money",
            ne: "स्लट मेसिन खेल्नुहोस् र पैसा जित्नुहोस्"
        },
        category: "game",
        guide: {
            en: "{prefix}slot <amount> [rotate]\n{prefix}slot 100 true - Spin with animation\n{prefix}slot 100 false - Instant result",
            ne: "{prefix}slot <रकम> [rotate]\n{prefix}slot 100 true - एनिमेसनसँग स्पिन गर्नुहोस्\n{prefix}slot 100 false - तत्काल परिणाम"
        },
        slash: true,
        options: [
            {
                name: "amount",
                description: "Amount to bet",
                type: 4,
                required: true
            },
            {
                name: "rotate",
                description: "Show spinning animation (default: true)",
                type: 5,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noAmount: "❌ Please provide an amount to bet!",
            invalidAmount: "❌ Please provide a valid amount greater than 0!",
            insufficientFunds: "❌ You don't have enough money!\nBet: **$%1**\nYour Balance: **$%2**",
            minBet: "❌ Minimum bet is **$10**!",
            maxBet: "❌ Maximum bet is **$100,000**!",
            spinning: "🎰 **SLOT MACHINE** 🎰\n\n%1\n\nSpinning...",
            result: "🎰 **SLOT MACHINE** 🎰\n\n%1\n\n%2",
            jackpot: "💰 **JACKPOT!** 💰\nYou won **$%1**! 🎉",
            bigWin: "🎊 **BIG WIN!** 🎊\nYou won **$%1**!",
            win: "✅ **Winner!**\nYou won **$%1**!",
            lose: "❌ **You Lost!**\nBetter luck next time!"
        },
        ne: {
            noAmount: "❌ कृपया बाजी लगाउन रकम प्रदान गर्नुहोस्!",
            invalidAmount: "❌ कृपया 0 भन्दा ठूलो मान्य रकम प्रदान गर्नुहोस्!",
            insufficientFunds: "❌ तपाईंसँग पर्याप्त पैसा छैन!\nबाजी: **$%1**\nतपाईंको ब्यालेन्स: **$%2**",
            minBet: "❌ न्यूनतम बाजी **$10** हो!",
            maxBet: "❌ अधिकतम बाजी **$100,000** हो!",
            spinning: "🎰 **स्लट मेसिन** 🎰\n\n%1\n\nस्पिन गर्दै...",
            result: "🎰 **स्लट मेसिन** 🎰\n\n%1\n\n%2",
            jackpot: "💰 **ज्याकपोट!** 💰\nतपाईंले **$%1** जित्नुभयो! 🎉",
            bigWin: "🎊 **ठूलो जित!** 🎊\nतपाईंले **$%1** जित्नुभयो!",
            win: "✅ **विजेता!**\nतपाईंले **$%1** जित्नुभयो!",
            lose: "❌ **तपाईं हार्नुभयो!**\nअर्को पटक राम्रो भाग्य!"
        }
    },

    onStart: async ({ message, interaction, args, usersData, userData, getLang }) => {
        const isSlash = !message;
        const user = isSlash ? interaction.user : message.author;

        // Parse arguments
        let amount, rotate;
        
        if (isSlash) {
            amount = interaction.options.getInteger('amount');
            rotate = interaction.options.getBoolean('rotate') ?? true; // Default to true
        } else {
            amount = parseInt(args[0]);
            rotate = args[1] === undefined ? true : args[1] !== 'false'; // Default to true
        }

        // Validations
        if (!amount || isNaN(amount)) {
            return isSlash ? 
                interaction.reply({ content: getLang("invalidAmount"), ephemeral: true }) : 
                message.reply(getLang("invalidAmount"));
        }

        if (amount <= 0) {
            return isSlash ? 
                interaction.reply({ content: getLang("invalidAmount"), ephemeral: true }) : 
                message.reply(getLang("invalidAmount"));
        }

        if (amount < 10) {
            return isSlash ? 
                interaction.reply({ content: getLang("minBet"), ephemeral: true }) : 
                message.reply(getLang("minBet"));
        }

        if (amount > 100000) {
            return isSlash ? 
                interaction.reply({ content: getLang("maxBet"), ephemeral: true }) : 
                message.reply(getLang("maxBet"));
        }

        if (userData.money < amount) {
            return isSlash ? 
                interaction.reply({ content: getLang("insufficientFunds", amount.toLocaleString(), userData.money.toLocaleString()), ephemeral: true }) : 
                message.reply(getLang("insufficientFunds", amount.toLocaleString(), userData.money.toLocaleString()));
        }

        // Slot symbols with different weights
        const symbols = [
            { emoji: '🍒', weight: 30 },
            { emoji: '🍋', weight: 25 },
            { emoji: '🍊', weight: 20 },
            { emoji: '🍇', weight: 15 },
            { emoji: '💎', weight: 7 },
            { emoji: '7️⃣', weight: 3 }
        ];

        // Weighted random selection
        const getRandomSymbol = () => {
            const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const symbol of symbols) {
                random -= symbol.weight;
                if (random <= 0) return symbol.emoji;
            }
            return symbols[0].emoji;
        };

        // Generate final result
        const finalSlots = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        // Calculate winnings
        let winMultiplier = 0;
        let winMessage = '';

        if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
            // All three match - JACKPOT
            switch (finalSlots[0]) {
                case '7️⃣': winMultiplier = 50; winMessage = getLang("jackpot", (amount * 50).toLocaleString()); break;
                case '💎': winMultiplier = 20; winMessage = getLang("jackpot", (amount * 20).toLocaleString()); break;
                case '🍇': winMultiplier = 10; winMessage = getLang("bigWin", (amount * 10).toLocaleString()); break;
                case '🍊': winMultiplier = 5; winMessage = getLang("bigWin", (amount * 5).toLocaleString()); break;
                case '🍋': winMultiplier = 3; winMessage = getLang("win", (amount * 3).toLocaleString()); break;
                case '🍒': winMultiplier = 2; winMessage = getLang("win", (amount * 2).toLocaleString()); break;
            }
        } else if (finalSlots[0] === finalSlots[1] || finalSlots[1] === finalSlots[2] || finalSlots[0] === finalSlots[2]) {
            // Two match - small win
            winMultiplier = 1.5;
            winMessage = getLang("win", Math.floor(amount * 0.5).toLocaleString());
        } else {
            // No match - lose
            winMultiplier = 0;
            winMessage = getLang("lose");
        }

        const winnings = Math.floor(amount * winMultiplier) - amount;
        const finalMoney = userData.money + winnings;

        // Update user balance
        await usersData.set(user.id, { money: finalMoney });

        // Show result
        const formatSlots = (slots) => `[ ${slots[0]} | ${slots[1]} | ${slots[2]} ]`;

        if (rotate) {
            // Spinning animation
            const spinFrames = [
                ['🎰', '🎰', '🎰'],
                ['🍒', '🍋', '🍊'],
                ['🍋', '🍊', '🍇'],
                ['🍊', '🍇', '💎'],
                ['🍇', '💎', '7️⃣'],
                ['💎', '7️⃣', '🍒'],
                ['7️⃣', '🍒', '🍋']
            ];

            const spinEmbed = new EmbedBuilder()
                .setDescription(getLang("spinning", formatSlots(spinFrames[0])))
                .setColor(0xFFD700)
                .setFooter({ text: `Bet: $${amount.toLocaleString()} | ${user.username}` })
                .setTimestamp();

            if (isSlash) {
                await interaction.reply({ embeds: [spinEmbed] });
            } else {
                await message.reply({ embeds: [spinEmbed] });
            }

            // Animate spinning (7 frames, 300ms each)
            for (let i = 0; i < 7; i++) {
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const currentFrame = spinFrames[i % spinFrames.length];
                const updatedEmbed = new EmbedBuilder()
                    .setDescription(getLang("spinning", formatSlots(currentFrame)))
                    .setColor(0xFFD700)
                    .setFooter({ text: `Bet: $${amount.toLocaleString()} | ${user.username}` })
                    .setTimestamp();

                if (isSlash) {
                    await interaction.editReply({ embeds: [updatedEmbed] }).catch(() => {});
                } else {
                    // For message commands, we need to fetch and edit
                    const reply = await message.channel.messages.fetch({ limit: 1 }).then(msgs => msgs.first()).catch(() => null);
                    if (reply && reply.author.id === message.client.user.id) {
                        await reply.edit({ embeds: [updatedEmbed] }).catch(() => {});
                    }
                }
            }

            // Show final result
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const resultEmbed = new EmbedBuilder()
                .setDescription(getLang("result", formatSlots(finalSlots), winMessage))
                .setColor(winMultiplier > 0 ? 0x57F287 : 0xED4245)
                .addFields(
                    { name: '💰 New Balance', value: `$${finalMoney.toLocaleString()}`, inline: true },
                    { name: winMultiplier > 0 ? '📈 Profit' : '📉 Loss', value: `$${Math.abs(winnings).toLocaleString()}`, inline: true }
                )
                .setFooter({ text: `${user.username}` })
                .setTimestamp();

            if (isSlash) {
                await interaction.editReply({ embeds: [resultEmbed] });
            } else {
                const reply = await message.channel.messages.fetch({ limit: 1 }).then(msgs => msgs.first()).catch(() => null);
                if (reply && reply.author.id === message.client.user.id) {
                    await reply.edit({ embeds: [resultEmbed] }).catch(() => {});
                }
            }
        } else {
            // Instant result (no animation)
            const resultEmbed = new EmbedBuilder()
                .setDescription(getLang("result", formatSlots(finalSlots), winMessage))
                .setColor(winMultiplier > 0 ? 0x57F287 : 0xED4245)
                .addFields(
                    { name: '💰 New Balance', value: `$${finalMoney.toLocaleString()}`, inline: true },
                    { name: winMultiplier > 0 ? '📈 Profit' : '📉 Loss', value: `$${Math.abs(winnings).toLocaleString()}`, inline: true }
                )
                .setFooter({ text: `${user.username}` })
                .setTimestamp();

            return isSlash ? 
                interaction.reply({ embeds: [resultEmbed] }) : 
                message.reply({ embeds: [resultEmbed] });
        }
    }
};
