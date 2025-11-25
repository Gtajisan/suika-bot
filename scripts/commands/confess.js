
const axios = require('axios');

module.exports = {
    config: {
        name: "confess",
        aliases: ["flirt"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Target a user and send them flirty messages on every message",
            ne: "प्रयोगकर्तालाई लक्षित गर्नुहोस् र प्रत्येक सन्देशमा फ्लर्टी सन्देशहरू पठाउनुहोस्"
        },
        category: "fun",
        guide: {
            en: "{prefix}confess <@user|userID> - Start sending confessions to a user\n{prefix}confess stop <@user|userID> - Stop sending confessions to a user\n{prefix}confess list - List all users receiving confessions\n{prefix}confess on - Enable receiving confessions\n{prefix}confess off - Disable receiving confessions",
            ne: "{prefix}confess <@प्रयोगकर्ता|प्रयोगकर्ता ID> - प्रयोगकर्तालाई कन्फेशन पठाउन सुरु गर्नुहोस्\n{prefix}confess stop <@प्रयोगकर्ता|प्रयोगकर्ता ID> - प्रयोगकर्तालाई कन्फेशन पठाउन रोक्नुहोस्\n{prefix}confess list - कन्फेशन प्राप्त गर्ने सबै प्रयोगकर्ताहरू सूचीबद्ध गर्नुहोस्\n{prefix}confess on - कन्फेशन प्राप्त गर्न सक्षम गर्नुहोस्\n{prefix}confess off - कन्फेशन प्राप्त गर्न अक्षम गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Start confessing, stop, toggle, or list",
                type: 3,
                required: true,
                choices: [
                    { name: "start", value: "start" },
                    { name: "stop", value: "stop" },
                    { name: "list", value: "list" },
                    { name: "on", value: "on" },
                    { name: "off", value: "off" }
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
            targetAdded: "✅ Now sending confessions to **%1** on every message they send!",
            alreadyTarget: "⚠️ **%1** is already receiving confessions!",
            targetRemoved: "✅ Stopped sending confessions to **%1**",
            notTarget: "⚠️ **%1** is not receiving confessions!",
            targetList: "**Users Receiving Confessions:**\n%1",
            noTargets: "No users are currently receiving confessions",
            apiError: "❌ Failed to fetch confession message",
            confessEnabled: "✅ You can now receive confessions from others!",
            confessDisabled: "❌ You will no longer receive confessions",
            confessNotEnabled: "⚠️ **%1** has not enabled confessions. They need to use `%2confess on` first!",
            alreadyEnabled: "⚠️ You already have confessions enabled!",
            alreadyDisabled: "⚠️ You already have confessions disabled!"
        },
        ne: {
            noUser: "❌ कृपया प्रयोगकर्तालाई उल्लेख गर्नुहोस् वा प्रयोगकर्ता ID प्रदान गर्नुहोस्!",
            targetAdded: "✅ अब **%1** लाई प्रत्येक सन्देशमा कन्फेशन पठाउँदै!",
            alreadyTarget: "⚠️ **%1** पहिले नै कन्फेशन प्राप्त गर्दै छ!",
            targetRemoved: "✅ **%1** लाई कन्फेशन पठाउन रोकियो",
            notTarget: "⚠️ **%1** कन्फेशन प्राप्त गरिरहेको छैन!",
            targetList: "**कन्फेशन प्राप्त गर्ने प्रयोगकर्ताहरू:**\n%1",
            noTargets: "हाल कुनै प्रयोगकर्ताहरू कन्फेशन प्राप्त गरिरहेका छैनन्",
            apiError: "❌ कन्फेशन सन्देश लिन असफल भयो",
            confessEnabled: "✅ तपाईं अब अरूबाट कन्फेशन प्राप्त गर्न सक्नुहुन्छ!",
            confessDisabled: "❌ तपाईं अब कन्फेशन प्राप्त गर्नुहुने छैन",
            confessNotEnabled: "⚠️ **%1** ले कन्फेशन सक्षम गरेका छैनन्। उनीहरूले पहिले `%2confess on` प्रयोग गर्नुपर्छ!",
            alreadyEnabled: "⚠️ तपाईंले पहिले नै कन्फेशन सक्षम गर्नुभएको छ!",
            alreadyDisabled: "⚠️ तपाईंले पहिले नै कन्फेशन अक्षम गर्नुभएको छ!"
        }
    },

    onStart: async ({ message, interaction, args, getLang, client, usersData, prefix }) => {
        const isSlash = !!interaction;
        const action = args?.[0] || interaction?.options?.getString('action');
        const senderID = isSlash ? interaction.user.id : message.author.id;
        
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

        // Initialize global confess targets if not exists
        if (!global.confessTargets) {
            global.confessTargets = new Set();
        }

        switch (action?.toLowerCase()) {
            case 'on': {
                // Enable confessions for yourself
                const userData = await usersData.get(senderID);
                if (userData.data?.confessEnabled) {
                    const response = getLang("alreadyEnabled");
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                await usersData.set(senderID, true, 'data.confessEnabled');
                const response = getLang("confessEnabled");
                return isSlash ? interaction.reply(response) : message.reply(response);
            }

            case 'off': {
                // Disable confessions for yourself
                const userData = await usersData.get(senderID);
                if (!userData.data?.confessEnabled) {
                    const response = getLang("alreadyDisabled");
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                await usersData.set(senderID, false, 'data.confessEnabled');
                const response = getLang("confessDisabled");
                return isSlash ? interaction.reply(response) : message.reply(response);
            }

            case 'start': {
                if (!targetUser) {
                    const response = getLang("noUser");
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                // Check if target has enabled confessions
                const targetUserData = await usersData.get(targetUser.id);
                if (!targetUserData.data?.confessEnabled) {
                    const response = getLang("confessNotEnabled", targetUser.tag, prefix);
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                if (global.confessTargets.has(targetUser.id)) {
                    const response = getLang("alreadyTarget", targetUser.tag);
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                global.confessTargets.add(targetUser.id);
                const response = getLang("targetAdded", targetUser.tag);
                return isSlash ? interaction.reply(response) : message.reply(response);
            }

            case 'stop': {
                if (!targetUser) {
                    const response = getLang("noUser");
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                if (!global.confessTargets.has(targetUser.id)) {
                    const response = getLang("notTarget", targetUser.tag);
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                global.confessTargets.delete(targetUser.id);
                const response = getLang("targetRemoved", targetUser.tag);
                return isSlash ? interaction.reply(response) : message.reply(response);
            }

            case 'list': {
                if (global.confessTargets.size === 0) {
                    const response = getLang("noTargets");
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                const targetList = await Promise.all(
                    Array.from(global.confessTargets).map(async (id, idx) => {
                        try {
                            const user = await client.users.fetch(id);
                            return `${idx + 1}. ${user.tag} (${id})`;
                        } catch {
                            return `${idx + 1}. Unknown User (${id})`;
                        }
                    })
                );

                const response = getLang("targetList", targetList.join("\n"));
                return isSlash ? interaction.reply(response) : message.reply(response);
            }

            default: {
                if (!targetUser) {
                    const response = getLang("noUser");
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                // Check if target has enabled confessions
                const targetUserData = await usersData.get(targetUser.id);
                if (!targetUserData.data?.confessEnabled) {
                    const response = getLang("confessNotEnabled", targetUser.tag, prefix);
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                if (global.confessTargets.has(targetUser.id)) {
                    const response = getLang("alreadyTarget", targetUser.tag);
                    return isSlash ? interaction.reply(response) : message.reply(response);
                }

                global.confessTargets.add(targetUser.id);
                const response = getLang("targetAdded", targetUser.tag);
                return isSlash ? interaction.reply(response) : message.reply(response);
            }
        }
    },

    onChat: async ({ message, client }) => {
        if (message.author.bot) return;
        
        // Initialize global confess targets if not exists
        if (!global.confessTargets) {
            global.confessTargets = new Set();
        }

        // Check if this user is targeted for confessions
        if (global.confessTargets.has(message.author.id)) {
            const flirtMessage = await getFlirtMessage();
            
            if (flirtMessage) {
                try {
                    await message.reply(`💕 ${flirtMessage}`);
                } catch (error) {
                    console.error("Failed to send confession:", error);
                }
            }
        }
    }
};

// Function to fetch flirt message from API or use fallback
async function getFlirtMessage() {
    try {
        const response = await axios.get('https://vinuxd.vercel.app/api/pickup');
        return response.data.pickup;
    } catch (error) {
        // Fallback flirt messages if API fails
        const fallbackMessages = [
            "Are you a magician? Because whenever I look at you, everyone else disappears.",
            "Do you have a map? I keep getting lost in your eyes.",
            "Is your name Google? Because you have everything I've been searching for.",
            "Are you a parking ticket? Because you've got FINE written all over you.",
            "Do you believe in love at first sight, or should I walk by again?",
            "If you were a vegetable, you'd be a cute-cumber!",
            "Are you made of copper and tellurium? Because you're Cu-Te.",
            "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
            "Is it hot in here or is it just you?",
            "Are you a time traveler? Because I see you in my future.",
            "Do you have a sunburn, or are you always this hot?",
            "If beauty were time, you'd be an eternity.",
            "Are you a camera? Because every time I look at you, I smile.",
            "Do you have a name, or can I call you mine?",
            "Are you Australian? Because you meet all of my koala-fications.",
            "If I could rearrange the alphabet, I'd put U and I together.",
            "Are you a loan? Because you have my interest.",
            "Do you play soccer? Because you're a keeper.",
            "Are you religious? Because you're the answer to all my prayers.",
            "Is your dad a boxer? Because you're a knockout!"
        ];
        
        return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }
}

// Export the getFlirtMessage function so it can be used by the message handler
module.exports.getFlirtMessage = getFlirtMessage;
