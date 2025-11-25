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
        name: "inventory",
        aliases: ["inv", "items", "bag"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "View your inventory",
            ne: "आफ्नो सूची हेर्नुहोस्"
        },
        category: "economy",
        guide: {
            en: "{prefix}inventory [@user]",
            ne: "{prefix}inventory [@प्रयोगकर्ता]"
        },
        slash: true,
        options: [
            {
                name: "user",
                description: "User to check inventory for",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            title: "🎒 **%1's Inventory**\n\n",
            empty: "🎒 **%1's Inventory**\n\nInventory is empty! Visit the shop to buy items.",
            itemFormat: "**%1** x%2\n%3\nValue: **$%4**\n\n",
            totalValue: "📊 **Total Value:** $%1"
        },
        ne: {
            title: "🎒 **%1 को सूची**\n\n",
            empty: "🎒 **%1 को सूची**\n\nसूची खाली छ! वस्तुहरू किन्न पसल भ्रमण गर्नुहोस्।",
            itemFormat: "**%1** x%2\n%3\nमूल्य: **$%4**\n\n",
            totalValue: "📊 **कुल मूल्य:** $%1"
        }
    },

    onStart: async ({ message, interaction, usersData, getLang }) => {
        const isSlash = !message;
        const targetUser = isSlash ? 
            (interaction.options.getUser('user') || interaction.user) : 
            (message.mentions.users.first() || message.author);

        const userData = await usersData.get(targetUser.id);
        const inventory = userData.data.inventory || {};

        const inventoryEntries = Object.entries(inventory).filter(([_, count]) => count > 0);

        if (inventoryEntries.length === 0) {
            const embed = new EmbedBuilder()
                .setDescription(getLang("empty", targetUser.username))
                .setColor(0x5865F2)
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
        }

        let description = getLang("title", targetUser.username);
        let totalValue = 0;

        for (const [itemId, count] of inventoryEntries) {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (item) {
                const itemValue = item.price * count;
                totalValue += itemValue;
                description += getLang("itemFormat", 
                    item.name, 
                    count, 
                    item.description, 
                    itemValue.toLocaleString()
                );
            }
        }

        description += getLang("totalValue", totalValue.toLocaleString());

        const embed = new EmbedBuilder()
            .setDescription(description)
            .setColor(0x5865F2)
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();

        return isSlash ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
    }
};
