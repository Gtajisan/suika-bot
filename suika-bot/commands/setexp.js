const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "setexp",
        aliases: ["setlevel"],
        version: "1.1",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Set, add, or remove a user's EXP or Level",
            ne: "प्रयोगकर्ताको EXP वा स्तर सेट, थप वा हटाउनुहोस्"
        },
        category: "admin",
        guide: {
            en: "{prefix}setexp <add|set|remove> <amount> [@user|reply]\n{prefix}setexp level <level> [@user|reply]",
            ne: "{prefix}setexp <add|set|remove> <रकम> [@प्रयोगकर्ता|जवाफ]\n{prefix}setexp level <स्तर> [@प्रयोगकर्ता|जवाफ]"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action type",
                type: 3,
                required: true,
                choices: [
                    { name: "Add", value: "add" },
                    { name: "Set", value: "set" },
                    { name: "Remove", value: "remove" },
                    { name: "Level", value: "level" }
                ]
            },
            {
                name: "amount",
                description: "EXP or level amount",
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
            noAction: "❌ Please specify a valid action: add, set, remove, or level!",
            noAmount: "❌ Please provide an amount!",
            noUser: "❌ Please mention a user or reply to their message!",
            success: "✅ Successfully updated **%1**'s EXP to **%2** (Level %3)",
            error: "❌ An error occurred while updating EXP."
        },
        ne: {
            noAction: "❌ कृपया मान्य कार्य निर्दिष्ट गर्नुहोस्: add, set, remove, वा level!",
            noAmount: "❌ कृपया रकम प्रदान गर्नुहोस्!",
            noUser: "❌ कृपया प्रयोगकर्ता उल्लेख गर्नुहोस् वा उनीहरूको सन्देशमा जवाफ दिनुहोस्!",
            success: "✅ सफलतापूर्वक **%1** को EXP **%2** मा अद्यावधिक गरियो (स्तर %3)",
            error: "❌ EXP अद्यावधिक गर्दा त्रुटि देखा पर्यो।"
        }
    },

    onStart: async ({ message, interaction, args, usersData, getLang }) => {
        const isSlash = !message;
        
        const reply = (content, embed) => {
            const options = embed ? { embeds: [embed], ephemeral: isSlash } : { content, ephemeral: isSlash };
            return isSlash ? interaction.reply(options) : message.reply(options);
        };

        const action = isSlash ? interaction.options.getString("action") : args[0]?.toLowerCase();
        const amount = isSlash ? interaction.options.getInteger("amount") : parseInt(args[1]);
        const targetUser = isSlash
            ? interaction.options.getUser("user")
            : message.mentions.users.first() ||
              (message.reference ? (await message.fetchReference()).author : null);

        // Validate all required arguments
        if (!action || !["add", "set", "remove", "level"].includes(action)) {
            return reply(getLang("noAction"));
        }
        
        if (!args[1] && !isSlash) {
            return reply(getLang("noAmount"));
        }
        
        if (isNaN(amount) || amount === undefined || amount === null) {
            return reply(getLang("noAmount"));
        }
        
        if (!targetUser) {
            return reply(getLang("noUser"));
        }

        try {
            const userData = await usersData.get(targetUser.id);
            let newExp = userData.exp || 0;

            if (action === "level") {
                if (amount < 1) return reply(getLang("noAmount"));
                newExp = global.utils.getExpForLevel(amount);
            } else {
                switch (action) {
                    case "add":
                        newExp += amount;
                        break;
                    case "set":
                        newExp = amount;
                        break;
                    case "remove":
                        newExp = Math.max(0, newExp - amount);
                        break;
                    default:
                        return reply(getLang("noAction"));
                }
            }

            await usersData.set(targetUser.id, { exp: Math.max(0, newExp) });
            const newLevel = global.utils.calculateLevel(newExp);

            const embed = new EmbedBuilder()
                .setColor(0xfee75c)
                .setTitle("📈 EXP Updated")
                .setDescription(getLang("success", targetUser.tag, newExp.toLocaleString(), newLevel))
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Action: ${action.toUpperCase()} | Level: ${newLevel}`
                })
                .setTimestamp();

            return reply(null, embed);
        } catch (error) {
            console.error("Error updating EXP:", error);
            return reply(getLang("error"));
        }
    }
};
