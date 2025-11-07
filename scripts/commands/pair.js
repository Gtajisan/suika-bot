
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "pair",
        aliases: ["ship", "couple"],
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Pair two random users from the server and see their compatibility",
            ne: "सर्भरबाट दुई अनियमित प्रयोगकर्ताहरू जोडी बनाउनुहोस् र तिनीहरूको मिलापन हेर्नुहोस्"
        },
        category: "fun",
        guide: {
            en: "{prefix}pair - Randomly pair two users from the server",
            ne: "{prefix}pair - सर्भरबाट दुई प्रयोगकर्ताहरू अनियमित रूपमा जोडी बनाउनुहोस्"
        },
        slash: true
    },

    langs: {
        en: {
            loading: "🔮 Finding the perfect match...",
            error: "❌ Failed to generate ship image. Please try again!",
            notEnoughUsers: "❌ Not enough users in the server to create a pair!",
            shipTitle: "💕 Love Calculator 💕",
            compatibility: "Compatibility: **%1%**",
            couple: "**%1** 💖 **%2**"
        },
        ne: {
            loading: "🔮 उत्तम मिलान खोज्दै...",
            error: "❌ जहाज छवि उत्पन्न गर्न असफल। कृपया फेरि प्रयास गर्नुहोस्!",
            notEnoughUsers: "❌ जोडी बनाउन सर्भरमा पर्याप्त प्रयोगकर्ताहरू छैनन्!",
            shipTitle: "💕 प्रेम क्याल्कुलेटर 💕",
            compatibility: "मिलाप: **%1%**",
            couple: "**%1** 💖 **%2**"
        }
    },

    onStart: async ({ message, interaction, getLang, client }) => {
        const isSlash = !!interaction;

        try {
            // Send loading message
            const loadingMsg = getLang("loading");
            let sentMessage;
            
            if (isSlash) {
                await interaction.reply(loadingMsg);
                sentMessage = await interaction.fetchReply();
            } else {
                sentMessage = await message.reply(loadingMsg);
            }

            // Get guild members
            const guild = isSlash ? interaction.guild : message.guild;
            await guild.members.fetch();
            
            // Filter out bots and get random users
            const members = guild.members.cache.filter(member => !member.user.bot);
            
            if (members.size < 2) {
                const errorMsg = getLang("notEnoughUsers");
                return sentMessage.edit(errorMsg);
            }

            // Get two random members
            const membersArray = Array.from(members.values());
            const randomIndex1 = Math.floor(Math.random() * membersArray.length);
            let randomIndex2 = Math.floor(Math.random() * membersArray.length);
            
            // Ensure we don't pick the same user twice
            while (randomIndex2 === randomIndex1) {
                randomIndex2 = Math.floor(Math.random() * membersArray.length);
            }

            const user1 = membersArray[randomIndex1].user;
            const user2 = membersArray[randomIndex2].user;

            // Get avatar URLs
            const avatar1 = user1.displayAvatarURL({ extension: 'png', size: 256 });
            const avatar2 = user2.displayAvatarURL({ extension: 'png', size: 256 });

            // Encode URLs for API
            const encodedAvatar1 = encodeURIComponent(avatar1);
            const encodedAvatar2 = encodeURIComponent(avatar2);

            // Call PopCat API
            const apiUrl = `https://api.popcat.xyz/v2/ship?user1=${encodedAvatar1}&user2=${encodedAvatar2}`;
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 10000
            });

            // Extract compatibility percentage from response headers or calculate random
            const compatibility = Math.floor(Math.random() * 101); // 0-100%

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(getLang("shipTitle"))
                .setDescription(getLang("couple", user1.username, user2.username))
                .addFields({
                    name: '📊 ' + getLang("compatibility", compatibility),
                    value: generateProgressBar(compatibility)
                })
                .setImage('attachment://ship.png')
                .setColor(getColorByCompatibility(compatibility))
                .setFooter({ text: `${user1.tag} × ${user2.tag}` })
                .setTimestamp();

            await sentMessage.edit({
                content: '',
                embeds: [embed],
                files: [{
                    attachment: Buffer.from(response.data),
                    name: 'ship.png'
                }]
            });

        } catch (error) {
            console.error("Pair command error:", error);
            const errorMsg = getLang("error");
            
            if (isSlash) {
                if (sentMessage) {
                    return interaction.editReply(errorMsg);
                }
                return interaction.reply(errorMsg);
            } else {
                if (sentMessage) {
                    return sentMessage.edit(errorMsg);
                }
                return message.reply(errorMsg);
            }
        }
    }
};

// Helper function to generate progress bar
function generateProgressBar(percentage) {
    const totalBars = 10;
    const filledBars = Math.round((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    
    const filled = '█'.repeat(filledBars);
    const empty = '░'.repeat(emptyBars);
    
    return `${filled}${empty} ${percentage}%`;
}

// Helper function to get color based on compatibility
function getColorByCompatibility(percentage) {
    if (percentage >= 80) return 0xFF1493; // Deep Pink - High compatibility
    if (percentage >= 60) return 0xFF69B4; // Hot Pink - Good compatibility
    if (percentage >= 40) return 0xFFA500; // Orange - Medium compatibility
    if (percentage >= 20) return 0xFFFF00; // Yellow - Low compatibility
    return 0x808080; // Gray - Very low compatibility
}
