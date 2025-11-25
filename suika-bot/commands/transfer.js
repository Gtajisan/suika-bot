const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "transfer",
        aliases: ["pay", "send"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Transfer money to another user",
            ne: "अर्को प्रयोगकर्तालाई पैसा स्थानान्तरण गर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}transfer <@user> <amount> [wallet|bank]",
            ne: "{prefix}transfer <@प्रयोगकर्ता> <रकम> [वालेट|बैंक]"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "User to transfer money to",
                type: 6,
                required: true
            },
            {
                name: "amount",
                description: "Amount to transfer",
                type: 4,
                required: true
            },
            {
                name: "source",
                description: "Transfer from wallet or bank",
                type: 3,
                required: false,
                choices: [
                    { name: "Wallet", value: "wallet" },
                    { name: "Bank", value: "bank" }
                ]
            }
        ]
    },

    langs: {
        en: {
            noUser: "❌ Please mention a user to transfer money to!",
            invalidAmount: "❌ Please provide a valid amount!",
            negativeAmount: "❌ Amount must be positive!",
            selfTransfer: "❌ You cannot transfer money to yourself!",
            insufficientWallet: "❌ You don't have enough money in your wallet!\nWallet: **$%1**",
            insufficientBank: "❌ You don't have enough money in your bank!\nBank: **$%1**",
            confirm: "💸 **Transfer Confirmation**\n\nFrom: **%1**\nTo: **%2**\nAmount: **$%3**\nSource: **%4**\n\nConfirm this transfer?",
            success: "✅ Successfully transferred **$%1** to **%2**!",
            cancelled: "❌ Transfer cancelled.",
            timeout: "⏰ Transfer request timed out.",
            botTransfer: "❌ You cannot transfer money to bots!"
        },
        ne: {
            noUser: "❌ कृपया पैसा स्थानान्तरण गर्न प्रयोगकर्ता उल्लेख गर्नुहोस्!",
            invalidAmount: "❌ कृपया मान्य रकम प्रदान गर्नुहोस्!",
            negativeAmount: "❌ रकम सकारात्मक हुनुपर्छ!",
            selfTransfer: "❌ तपाईं आफैंलाई पैसा स्थानान्तरण गर्न सक्नुहुन्न!",
            insufficientWallet: "❌ तपाईंको वालेटमा पर्याप्त पैसा छैन!\nवालेट: **$%1**",
            insufficientBank: "❌ तपाईंको बैंकमा पर्याप्त पैसा छैन!\nबैंक: **$%1**",
            confirm: "💸 **स्थानान्तरण पुष्टिकरण**\n\nबाट: **%1**\nमा: **%2**\nरकम: **$%3**\nस्रोत: **%4**\n\nयो स्थानान्तरण पुष्टि गर्नुहोस्?",
            success: "✅ सफलतापूर्वक **%2** लाई **$%1** स्थानान्तरण गरियो!",
            cancelled: "❌ स्थानान्तरण रद्द गरियो।",
            timeout: "⏰ स्थानान्तरण अनुरोध समय समाप्त भयो।",
            botTransfer: "❌ तपाईं बटहरूलाई पैसा स्थानान्तरण गर्न सक्नुहुन्न!"
        }
    },

    onStart: async ({ message, interaction, args, usersData, userData, getLang }) => {
        const isSlash = !message;
        const sender = isSlash ? interaction.user : message.author;
        const targetUser = isSlash ? interaction.options.getUser('user') : message.mentions.users.first();

        if (!targetUser) {
            return isSlash ? 
                interaction.reply({ content: getLang("noUser"), ephemeral: true }) : 
                message.reply(getLang("noUser"));
        }

        if (targetUser.bot) {
            return isSlash ? 
                interaction.reply({ content: getLang("botTransfer"), ephemeral: true }) : 
                message.reply(getLang("botTransfer"));
        }

        if (targetUser.id === sender.id) {
            return isSlash ? 
                interaction.reply({ content: getLang("selfTransfer"), ephemeral: true }) : 
                message.reply(getLang("selfTransfer"));
        }

        let amount = isSlash ? interaction.options.getInteger('amount') : parseInt(args[1]);
        let source = isSlash ? (interaction.options.getString('source') || 'wallet') : (args[2]?.toLowerCase() || 'wallet');

        if (!amount || isNaN(amount)) {
            return isSlash ? 
                interaction.reply({ content: getLang("invalidAmount"), ephemeral: true }) : 
                message.reply(getLang("invalidAmount"));
        }

        if (amount <= 0) {
            return isSlash ? 
                interaction.reply({ content: getLang("negativeAmount"), ephemeral: true }) : 
                message.reply(getLang("negativeAmount"));
        }

        if (source === "wallet" || source === "w") {
            if (userData.money < amount) {
                return isSlash ? 
                    interaction.reply({ content: getLang("insufficientWallet", userData.money.toLocaleString()), ephemeral: true }) : 
                    message.reply(getLang("insufficientWallet", userData.money.toLocaleString()));
            }
        } else if (source === "bank" || source === "b") {
            if (userData.bank < amount) {
                return isSlash ? 
                    interaction.reply({ content: getLang("insufficientBank", userData.bank.toLocaleString()), ephemeral: true }) : 
                    message.reply(getLang("insufficientBank", userData.bank.toLocaleString()));
            }
            source = "bank";
        } else {
            source = "wallet";
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('transfer_confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('transfer_cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );

        const embed = new EmbedBuilder()
            .setDescription(getLang("confirm", sender.username, targetUser.username, amount.toLocaleString(), source))
            .setColor(0xFEE75C)
            .setTimestamp();

        const reply = isSlash ? 
            await interaction.reply({ embeds: [embed], components: [row], fetchReply: true }) : 
            await message.reply({ embeds: [embed], components: [row] });

        const buttonHandler = async (btnInteraction) => {
            if (btnInteraction.user.id !== sender.id) {
                return btnInteraction.reply({ content: "This is not your transfer request!", ephemeral: true });
            }

            if (btnInteraction.customId === 'transfer_confirm') {
                const targetUserData = await usersData.get(targetUser.id);

                if (source === "wallet") {
                    await usersData.set(sender.id, {
                        money: userData.money - amount
                    });
                } else {
                    await usersData.set(sender.id, {
                        bank: userData.bank - amount
                    });
                }

                await usersData.set(targetUser.id, {
                    money: targetUserData.money + amount
                });

                const successEmbed = new EmbedBuilder()
                    .setDescription(getLang("success", amount.toLocaleString(), targetUser.username))
                    .setColor(0x57F287);

                await btnInteraction.update({ embeds: [successEmbed], components: [] });
            } else {
                const cancelEmbed = new EmbedBuilder()
                    .setDescription(getLang("cancelled"))
                    .setColor(0xED4245);

                await btnInteraction.update({ embeds: [cancelEmbed], components: [] });
            }

            global.RentoBot.onButton.delete('transfer_confirm');
            global.RentoBot.onButton.delete('transfer_cancel');
        };

        global.RentoBot.onButton.set('transfer_confirm', buttonHandler);
        global.RentoBot.onButton.set('transfer_cancel', buttonHandler);

        setTimeout(async () => {
            if (global.RentoBot.onButton.has('transfer_confirm')) {
                global.RentoBot.onButton.delete('transfer_confirm');
                global.RentoBot.onButton.delete('transfer_cancel');

                const timeoutEmbed = new EmbedBuilder()
                    .setDescription(getLang("timeout"))
                    .setColor(0xED4245);

                try {
                    if (isSlash) {
                        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                    } else {
                        await reply.edit({ embeds: [timeoutEmbed], components: [] });
                    }
                } catch (err) {
                    console.error("Error editing transfer timeout:", err);
                }
            }
        }, 60000);
    }
};
