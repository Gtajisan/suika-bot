
const axios = require('axios');

module.exports = {
    config: {
        name: "insult",
        aliases: ["roast"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 2,
        description: {
            en: "Target a user and insult them on every message",
            ne: "प्रयोगकर्तालाई लक्षित गर्नुहोस् र प्रत्येक सन्देशमा अपमान गर्नुहोस्"
        },
        category: "owner",
        guide: {
            en: "{prefix}insult <@user|userID> - Start insulting a user\n{prefix}insult stop <@user|userID> - Stop insulting a user\n{prefix}insult list - List all targeted users",
            ne: "{prefix}insult <@प्रयोगकर्ता|प्रयोगकर्ता ID> - प्रयोगकर्तालाई अपमान गर्न सुरु गर्नुहोस्\n{prefix}insult stop <@प्रयोगकर्ता|प्रयोगकर्ता ID> - प्रयोगकर्तालाई अपमान गर्न रोक्नुहोस्\n{prefix}insult list - सबै लक्षित प्रयोगकर्ताहरू सूचीबद्ध गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Start insulting or stop",
                type: 3,
                required: true,
                choices: [
                    { name: "start", value: "start" },
                    { name: "stop", value: "stop" },
                    { name: "list", value: "list" }
                ]
            },
            {
                name: "user",
                description: "User to target",
                type: 6,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noUser: "❌ Please mention a user or provide a user ID!",
            targetAdded: "✅ Now insulting **%1** on every message they send!",
            alreadyTarget: "⚠️ **%1** is already being targeted!",
            targetRemoved: "✅ Stopped insulting **%1**",
            notTarget: "⚠️ **%1** is not being targeted!",
            targetList: "**Targeted Users:**\n%1",
            noTargets: "No users are currently being targeted",
            apiError: "❌ Failed to fetch insult from API"
        },
        ne: {
            noUser: "❌ कृपया प्रयोगकर्तालाई उल्लेख गर्नुहोस् वा प्रयोगकर्ता ID प्रदान गर्नुहोस्!",
            targetAdded: "✅ अब **%1** लाई प्रत्येक सन्देशमा अपमान गर्दै!",
            alreadyTarget: "⚠️ **%1** पहिले नै लक्षित छ!",
            targetRemoved: "✅ **%1** लाई अपमान गर्न रोकियो",
            notTarget: "⚠️ **%1** लक्षित छैन!",
            targetList: "**लक्षित प्रयोगकर्ताहरू:**\n%1",
            noTargets: "हाल कुनै प्रयोगकर्ताहरू लक्षित छैनन्",
            apiError: "❌ API बाट अपमान लिन असफल भयो"
        }
    },

    onStart: async ({ message, interaction, args, getLang, client }) => {
        const isSlash = !!interaction;
        const action = args?.[0] || interaction?.options?.getString('action');
        
        let targetUser;
        
        if (isSlash) {
            targetUser = interaction.options.getUser('user');
        } else {
            targetUser = message.mentions.users.first();
            if (!targetUser && args?.[1]) {
                try {
                    targetUser = await client.users.fetch(args[1]);
                } catch (error) {
                    targetUser = null;
                }
            }
        }

        // Initialize global insult targets if not exists
        if (!global.insultTargets) {
            global.insultTargets = new Set();
        }

        switch (action?.toLowerCase()) {
            case 'start': {
                if (!targetUser) {
                    const response = getLang("noUser");
                    return isSlash ? ctx.reply(response) : ctx.reply(response);
                }

                if (global.insultTargets.has(targetUser.id)) {
                    const response = getLang("alreadyTarget", targetUser.tag);
                    return isSlash ? ctx.reply(response) : ctx.reply(response);
                }

                global.insultTargets.add(targetUser.id);
                const response = getLang("targetAdded", targetUser.tag);
                return isSlash ? ctx.reply(response) : ctx.reply(response);
            }

            case 'stop': {
                if (!targetUser) {
                    const response = getLang("noUser");
                    return isSlash ? ctx.reply(response) : ctx.reply(response);
                }

                if (!global.insultTargets.has(targetUser.id)) {
                    const response = getLang("notTarget", targetUser.tag);
                    return isSlash ? ctx.reply(response) : ctx.reply(response);
                }

                global.insultTargets.delete(targetUser.id);
                const response = getLang("targetRemoved", targetUser.tag);
                return isSlash ? ctx.reply(response) : ctx.reply(response);
            }

            case 'list': {
                if (global.insultTargets.size === 0) {
                    const response = getLang("noTargets");
                    return isSlash ? ctx.reply(response) : ctx.reply(response);
                }

                const targetList = await Promise.all(
                    Array.from(global.insultTargets).map(async (id, idx) => {
                        try {
                            const user = await client.users.fetch(id);
                            return `${idx + 1}. ${user.tag} (${id})`;
                        } catch {
                            return `${idx + 1}. Unknown User (${id})`;
                        }
                    })
                );

                const response = getLang("targetList", targetList.join("\n"));
                return isSlash ? ctx.reply(response) : ctx.reply(response);
            }

            default: {
                if (!targetUser) {
                    const response = getLang("noUser");
                    return isSlash ? ctx.reply(response) : ctx.reply(response);
                }

                if (global.insultTargets.has(targetUser.id)) {
                    const response = getLang("alreadyTarget", targetUser.tag);
                    return isSlash ? ctx.reply(response) : ctx.reply(response);
                }

                global.insultTargets.add(targetUser.id);
                const response = getLang("targetAdded", targetUser.tag);
                return isSlash ? ctx.reply(response) : ctx.reply(response);
            }
        }
    }
};

// Function to fetch insult from API
async function getInsult() {
    try {
        const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
        return response.data.insult;
    } catch (error) {
        return null;
    }
}

// Export the getInsult function so it can be used by the message handler
module.exports.getInsult = getInsult;
