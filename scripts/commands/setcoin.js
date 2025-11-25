const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: "setcoin",
        aliases: ["setmoney", "setbal"],
        version: "1.2",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Set, add, or remove user's wallet or bank balance",
            ne: "प्रयोगकर्ताको वालेट वा बैंक ब्यालेन्स सेट, थप वा हटाउनुहोस्"
        },
        category: "admin",
        guide: {
            en: "{prefix}setcoin [wallet|bank] <add|set|remove> <amount> [@user|reply]",
            ne: "{prefix}setcoin [wallet|bank] <add|set|remove> <रकम> [@प्रयोगकर्ता|जवाफ]"
        },
        slash: true,
        options: [
            {
                name: "type",
                description: "Wallet or Bank",
                type: 3,
                required: true,
                choices: [
                    { name: "wallet", value: "wallet" },
                    { name: "bank", value: "bank" }
                ]
            },
            {
                name: "action",
                description: "add | set | remove",
                type: 3,
                required: true,
                choices: [
                    { name: "Add", value: "add" },
                    { name: "Set", value: "set" },
                    { name: "Remove", value: "remove" }
                ]
            },
            {
                name: "amount",
                description: "Amount to set/add/remove",
                type: 4,
                required: true
            },
            {
                name: "user",
                description: "User to modify",
                type: 6,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noAction: "❌ Please specify a valid action: add, set, or remove!",
            noAmount: "❌ Please provide an amount!",
            noUser: "❌ Please mention a user or reply to their message!",
            successWallet: "✅ Successfully updated **%1**'s **wallet** to **%2**",
            successBank: "✅ Successfully updated **%1**'s **bank** to **%2**",
            error: "❌ An error occurred while updating coins."
        },
        ne: {
            noAction: "❌ कृपया मान्य कार्य निर्दिष्ट गर्नुहोस्: add, set, वा remove!",
            noAmount: "❌ कृपया रकम प्रदान गर्नुहोस्!",
            noUser: "❌ कृपया प्रयोगकर्ता उल्लेख गर्नुहोस् वा उनीहरूको सन्देशमा जवाफ दिनुहोस्!",
            successWallet: "✅ सफलतापूर्वक **%1** को **वालेट** **%2** मा अद्यावधिक गरियो",
            successBank: "✅ सफलतापूर्वक **%1** को **बैंक** **%2** मा अद्यावधिक गरियो",
            error: "❌ सिक्का अद्यावधिक गर्दा त्रुटि देखा पर्यो।"
        }
    },

    onStart: async ({ message, interaction, args, usersData, getLang }) => {
        const isSlash = !message;

        const reply = (content, embed) => {
            const options = embed ? { embeds: [embed], ephemeral: isSlash } : { content, ephemeral: isSlash };
            return isSlash ? interaction.reply(options) : message.reply(options);
        };

        // Parse arguments
        const type = isSlash ? interaction.options.getString("type") : (["wallet", "bank"].includes(args[0]?.toLowerCase()) ? args[0].toLowerCase() : "wallet");
        const action = isSlash
            ? interaction.options.getString("action")
            : (["wallet", "bank"].includes(args[0]?.toLowerCase()) ? args[1]?.toLowerCase() : args[0]?.toLowerCase());
        const amount = isSlash
            ? interaction.options.getInteger("amount")
            : parseInt(["wallet", "bank"].includes(args[0]?.toLowerCase()) ? args[2] : args[1]);
        const targetUser = isSlash
            ? interaction.options.getUser("user")
            : message.mentions.users.first() ||
              (message.reference ? (await message.fetchReference()).author : null);

        // Validations
        if (!action || !["add", "set", "remove"].includes(action)) {
            return reply(getLang("noAction"));
        }

        if (isNaN(amount) || amount <= 0) {
            return reply(getLang("noAmount"));
        }

        if (!targetUser) {
            return reply(getLang("noUser"));
        }

        try {
            const userData = await usersData.get(targetUser.id);
            let newMoney = userData.money || 0;
            let newBank = userData.bank || 0;

            if (type === "wallet") {
                if (action === "add") newMoney += amount;
                else if (action === "set") newMoney = amount;
                else if (action === "remove") newMoney = Math.max(0, newMoney - amount);

                await usersData.set(targetUser.id, { money: newMoney });
            } else {
                if (action === "add") newBank += amount;
                else if (action === "set") newBank = amount;
                else if (action === "remove") newBank = Math.max(0, newBank - amount);

                await usersData.set(targetUser.id, { bank: newBank });
            }

            const embed = new EmbedBuilder()
                .setColor(type === "wallet" ? 0x57F287 : 0x5865F2)
                .setTitle("💰 Balance Updated")
                .setDescription(
                    type === "wallet"
                        ? getLang("successWallet", targetUser.tag, newMoney.toLocaleString())
                        : getLang("successBank", targetUser.tag, newBank.toLocaleString())
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `Action: ${action.toUpperCase()} | Type: ${type.toUpperCase()}` })
                .setTimestamp();

            return reply(null, embed);
        } catch (error) {
            console.error("Error updating coins:", error);
            return reply(getLang("error"));
        }
    }
};
