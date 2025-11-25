const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

const SHOP_ITEMS = [
    { id: "trophy", name: "🏆 Trophy", price: 5000, description: "A shiny trophy for your collection" },
    { id: "gem", name: "💎 Gem", price: 10000, description: "A rare and valuable gem" },
    { id: "crown", name: "👑 Crown", price: 25000, description: "Royal crown for the wealthy" },
    { id: "medal", name: "🥇 Gold Medal", price: 15000, description: "First place medal" },
    { id: "ring", name: "💍 Diamond Ring", price: 50000, description: "Expensive diamond ring" },
    { id: "car", name: "🚗 Sports Car", price: 100000, description: "Luxury sports car" },
    { id: "house", name: "🏠 House", price: 500000, description: "Your own house" },
    { id: "island", name: "🏝️ Private Island", price: 1000000, description: "Your own private island" }
];

module.exports = {
    config: {
        name: "shop",
        aliases: ["store", "buy", "sell"],
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Buy or sell items from the shop",
            ne: "पसलबाट वस्तुहरू किन्नुहोस् वा बेच्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}shop [buy|sell] [item_id] [quantity]\n{prefix}shop - View shop",
            ne: "{prefix}shop [buy|sell] [वस्तु_id] [मात्रा]\n{prefix}shop - पसल हेर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Buy or sell items",
                type: 3,
                required: false,
                choices: [
                    { name: "Buy", value: "buy" },
                    { name: "Sell", value: "sell" }
                ]
            },
            {
                name: "item",
                description: "Item ID",
                type: 3,
                required: false
            },
            {
                name: "quantity",
                description: "Quantity",
                type: 4,
                required: false
            }
        ]
    },

    langs: {
        en: {
            shopTitle: "🛒 **Item Shop**\n\nUse the buttons below to buy or sell items!\n\n",
            itemFormat: "**%1** - Buy: $%2 | Sell: $%3\n%4\n",
            invalidItem: "❌ Invalid item ID! Use the shop command to see available items.",
            invalidQuantity: "❌ Please provide a valid quantity!",
            insufficientFunds: "❌ You don't have enough money!\nPrice: **$%1**\nYour Balance: **$%2**",
            purchaseSuccess: "✅ Successfully purchased **%1x %2** for **$%3**!",
            sellSuccess: "✅ Successfully sold **%1x %2** for **$%3**!",
            notEnoughItems: "❌ You don't have enough of this item!\nYou have: **%1**\nTrying to sell: **%2**",
            noItemsToSell: "❌ You don't own this item!",
            alreadyOwns: "ℹ️ You already own this item!"
        },
        ne: {
            shopTitle: "🛒 **वस्तु पसल**\n\nवस्तुहरू किन्न वा बेच्न तलका बटनहरू प्रयोग गर्नुहोस्!\n\n",
            itemFormat: "**%1** - किन्नुहोस्: $%2 | बेच्नुहोस्: $%3\n%4\n",
            invalidItem: "❌ अमान्य वस्तु ID! उपलब्ध वस्तुहरू हेर्न पसल आदेश प्रयोग गर्नुहोस्।",
            invalidQuantity: "❌ कृपया मान्य मात्रा प्रदान गर्नुहोस्!",
            insufficientFunds: "❌ तपाईंसँग पर्याप्त पैसा छैन!\nमूल्य: **$%1**\nतपाईंको ब्यालेन्स: **$%2**",
            purchaseSuccess: "✅ सफलतापूर्वक **%1x %2** **$%3** मा खरिद गरियो!",
            sellSuccess: "✅ सफलतापूर्वक **%1x %2** **$%3** मा बेचियो!",
            notEnoughItems: "❌ तपाईंसँग यो वस्तुको पर्याप्त छैन!\nतपाईंसँग छ: **%1**\nबेच्न खोज्दै: **%2**",
            noItemsToSell: "❌ तपाईं यो वस्तुको स्वामित्व हुनुहुन्न!",
            alreadyOwns: "ℹ️ तपाईं यो वस्तु पहिले नै स्वामित्व हुनुहुन्छ!"
        }
    },

    onStart: async ({ message, interaction, args, usersData, userData, getLang }) => {
        const isSlash = !message;
        const user = isSlash ? interaction.user : message.author;
        
        // Parse arguments for both slash and prefix commands
        let action = isSlash ? interaction.options.getString('action') : args[0];
        let itemId, quantity;
        
        if (isSlash) {
            itemId = interaction.options.getString('item');
            quantity = interaction.options.getInteger('quantity') || 1;
        } else {
            // Check if first arg is buy/sell
            if (action === 'buy' || action === 'sell') {
                itemId = args[1];
                quantity = parseInt(args[2]) || 1;
            } else {
                // First arg is item ID (default to buy)
                action = 'buy';
                itemId = args[0];
                quantity = parseInt(args[1]) || 1;
            }
        }

        if (!itemId && !action) {
            const itemsPerPage = 4;
            const totalPages = Math.ceil(SHOP_ITEMS.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageItems = SHOP_ITEMS.slice(start, end);

                let description = getLang("shopTitle");
                for (const item of pageItems) {
                    const sellPrice = Math.floor(item.price * 0.7);
                    description += getLang("itemFormat", item.name, item.price.toLocaleString(), sellPrice.toLocaleString(), `ID: \`${item.id}\` - ${item.description}`);
                    description += "\n";
                }

                const embed = new EmbedBuilder()
                    .setDescription(description)
                    .setColor(0x5865F2)
                    .setFooter({ text: `Page ${page + 1}/${totalPages} • Your Balance: $${userData.money.toLocaleString()}` })
                    .setTimestamp();

                return embed;
            };

            const generateButtons = (page) => {
                const start = page * itemsPerPage;
                const pageItems = SHOP_ITEMS.slice(start, start + itemsPerPage);

                const buyButtons = pageItems.map(item => 
                    new ButtonBuilder()
                        .setCustomId(`shop_buy_${item.id}`)
                        .setLabel(`Buy ${item.name}`)
                        .setStyle(ButtonStyle.Success)
                );

                const sellButtons = pageItems.map(item => 
                    new ButtonBuilder()
                        .setCustomId(`shop_sell_${item.id}`)
                        .setLabel(`Sell ${item.name}`)
                        .setStyle(ButtonStyle.Danger)
                );

                const rows = [];
                
                // Split buttons into rows (max 5 per row)
                for (let i = 0; i < buyButtons.length; i += 2) {
                    const buyRow = new ActionRowBuilder().addComponents(
                        buyButtons.slice(i, i + 2)
                    );
                    rows.push(buyRow);
                    
                    const sellRow = new ActionRowBuilder().addComponents(
                        sellButtons.slice(i, i + 2)
                    );
                    rows.push(sellRow);
                }

                if (totalPages > 1 && rows.length < 5) {
                    const navRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('shop_prev')
                                .setLabel('◀ Previous')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(page === 0),
                            new ButtonBuilder()
                                .setCustomId('shop_next')
                                .setLabel('Next ▶')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(page === totalPages - 1)
                        );
                    rows.push(navRow);
                }

                return rows.slice(0, 5); // Discord max 5 rows
            };

            const embed = generateEmbed(currentPage);
            const components = generateButtons(currentPage);

            const reply = isSlash ? 
                await interaction.reply({ embeds: [embed], components: components, fetchReply: true }) : 
                await message.reply({ embeds: [embed], components: components });

            const buttonHandler = async (btnInteraction) => {
                if (btnInteraction.user.id !== user.id) {
                    return btnInteraction.reply({ content: "This is not your shop!", ephemeral: true });
                }

                if (btnInteraction.customId === 'shop_prev') {
                    currentPage = Math.max(0, currentPage - 1);
                    const newEmbed = generateEmbed(currentPage);
                    const newComponents = generateButtons(currentPage);
                    await btnInteraction.update({ embeds: [newEmbed], components: newComponents });
                } else if (btnInteraction.customId === 'shop_next') {
                    currentPage = Math.min(totalPages - 1, currentPage + 1);
                    const newEmbed = generateEmbed(currentPage);
                    const newComponents = generateButtons(currentPage);
                    await btnInteraction.update({ embeds: [newEmbed], components: newComponents });
                } else if (btnInteraction.customId.startsWith('shop_buy_')) {
                    const buyItemId = btnInteraction.customId.replace('shop_buy_', '');
                    const item = SHOP_ITEMS.find(i => i.id === buyItemId);
                    
                    if (!item) return;

                    const freshUserData = await usersData.get(user.id);
                    const totalCost = item.price;

                    if (freshUserData.money < totalCost) {
                        return btnInteraction.reply({ 
                            content: getLang("insufficientFunds", totalCost.toLocaleString(), freshUserData.money.toLocaleString()), 
                            ephemeral: true 
                        });
                    }

                    const inventory = freshUserData.data.inventory || {};
                    inventory[item.id] = (inventory[item.id] || 0) + 1;

                    await usersData.set(user.id, {
                        money: freshUserData.money - totalCost,
                        data: { ...freshUserData.data, inventory }
                    });

                    const successEmbed = new EmbedBuilder()
                        .setDescription(getLang("purchaseSuccess", 1, item.name, totalCost.toLocaleString()))
                        .setColor(0x57F287);

                    await btnInteraction.reply({ embeds: [successEmbed], ephemeral: true });
                } else if (btnInteraction.customId.startsWith('shop_sell_')) {
                    const sellItemId = btnInteraction.customId.replace('shop_sell_', '');
                    const item = SHOP_ITEMS.find(i => i.id === sellItemId);
                    
                    if (!item) return;

                    const freshUserData = await usersData.get(user.id);
                    const inventory = freshUserData.data.inventory || {};
                    const currentAmount = inventory[item.id] || 0;

                    if (currentAmount < 1) {
                        return btnInteraction.reply({ 
                            content: getLang("noItemsToSell"), 
                            ephemeral: true 
                        });
                    }

                    const sellPrice = Math.floor(item.price * 0.7);
                    inventory[item.id] = currentAmount - 1;

                    await usersData.set(user.id, {
                        money: freshUserData.money + sellPrice,
                        data: { ...freshUserData.data, inventory }
                    });

                    const successEmbed = new EmbedBuilder()
                        .setDescription(getLang("sellSuccess", 1, item.name, sellPrice.toLocaleString()))
                        .setColor(0xFEE75C);

                    await btnInteraction.reply({ embeds: [successEmbed], ephemeral: true });
                }
            };

            SHOP_ITEMS.forEach(item => {
                global.RentoBot.onButton.set(`shop_buy_${item.id}`, buttonHandler);
                global.RentoBot.onButton.set(`shop_sell_${item.id}`, buttonHandler);
            });
            global.RentoBot.onButton.set('shop_prev', buttonHandler);
            global.RentoBot.onButton.set('shop_next', buttonHandler);

            setTimeout(() => {
                SHOP_ITEMS.forEach(item => {
                    global.RentoBot.onButton.delete(`shop_buy_${item.id}`);
                    global.RentoBot.onButton.delete(`shop_sell_${item.id}`);
                });
                global.RentoBot.onButton.delete('shop_prev');
                global.RentoBot.onButton.delete('shop_next');
            }, 300000);

            return;
        }

        const item = SHOP_ITEMS.find(i => i.id === itemId.toLowerCase());

        if (!item) {
            return isSlash ? 
                interaction.reply({ content: getLang("invalidItem"), ephemeral: true }) : 
                message.reply(getLang("invalidItem"));
        }

        if (quantity <= 0 || isNaN(quantity)) {
            return isSlash ? 
                interaction.reply({ content: getLang("invalidQuantity"), ephemeral: true }) : 
                message.reply(getLang("invalidQuantity"));
        }

        // Handle buy action
        if (!action || action === 'buy') {
            const totalCost = item.price * quantity;

            if (userData.money < totalCost) {
                return isSlash ? 
                    interaction.reply({ content: getLang("insufficientFunds", totalCost.toLocaleString(), userData.money.toLocaleString()), ephemeral: true }) : 
                    message.reply(getLang("insufficientFunds", totalCost.toLocaleString(), userData.money.toLocaleString()));
            }

            const inventory = userData.data.inventory || {};
            inventory[item.id] = (inventory[item.id] || 0) + quantity;

            await usersData.set(user.id, {
                money: userData.money - totalCost,
                data: { ...userData.data, inventory }
            });

            const embed = new EmbedBuilder()
                .setDescription(getLang("purchaseSuccess", quantity, item.name, totalCost.toLocaleString()))
                .setColor(0x57F287)
                .setTimestamp();

            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }

        // Handle sell action
        if (action === 'sell') {
            const inventory = userData.data.inventory || {};
            const currentAmount = inventory[item.id] || 0;

            if (currentAmount < quantity) {
                return isSlash ? 
                    interaction.reply({ content: getLang("notEnoughItems", currentAmount, quantity), ephemeral: true }) : 
                    message.reply(getLang("notEnoughItems", currentAmount, quantity));
            }

            const sellPrice = Math.floor(item.price * 0.7);
            const totalEarnings = sellPrice * quantity;
            
            inventory[item.id] = currentAmount - quantity;

            await usersData.set(user.id, {
                money: userData.money + totalEarnings,
                data: { ...userData.data, inventory }
            });

            const embed = new EmbedBuilder()
                .setDescription(getLang("sellSuccess", quantity, item.name, totalEarnings.toLocaleString()))
                .setColor(0xFEE75C)
                .setTimestamp();

            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }
    }
};
