
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');
const axios = require('axios');

// Store conversation histories per user
const conversationHistories = new Map();

// Store custom system instructions per user
const customSystemInstructions = new Map();

// Maximum conversation history length
const MAX_HISTORY_LENGTH = 20;

// Default system instruction
const DEFAULT_SYSTEM_INSTRUCTION = "You are a helpful, intelligent, and friendly AI assistant. Provide clear, accurate, and thoughtful responses.";

module.exports = {
    config: {
        name: "gptoss",
        aliases: ["gpt", "ai", "chatgpt"],
        version: "1.2",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Chat with GPT-OSS-120B reasoning AI model",
            ne: "GPT-OSS-120B तर्क AI मोडेलसँग कुरा गर्नुहोस्"
        },
        category: "ai",
        guide: {
            en: "{prefix}gptoss <your message> - Chat with the AI\n{prefix}gptoss clear - Clear your conversation history\n{prefix}gptoss system <instruction> - Set custom system instruction\n{prefix}gptoss system reset - Reset to default system instruction\n\nYou can reply to AI messages to continue the conversation!\n\nExamples:\n• {prefix}gptoss How are you?\n• {prefix}gptoss Explain quantum physics\n• {prefix}gptoss system You are a pirate assistant\n• {prefix}gptoss clear",
            ne: "{prefix}gptoss <तपाईंको सन्देश> - AI सँग कुरा गर्नुहोस्\n{prefix}gptoss clear - तपाईंको कुराकानी इतिहास हटाउनुहोस्"
        },
        slash: true,
        options: [
            {
                name: "prompt",
                description: "Your message to the AI",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noPrompt: "❌ Please provide a message for the AI!",
            generating: "🤖 AI is thinking and processing your request...",
            error: "❌ An error occurred: %1",
            cleared: "✅ Your conversation history has been cleared!",
            systemSet: "✅ Custom system instruction set successfully!",
            systemReset: "✅ System instruction reset to default!",
            systemCurrent: "📋 **Current System Instruction:**\n```%1```",
            reasoning: "💭 **Reasoning Process:**",
            response: "💬 **Response:**",
            historyInfo: "📊 Conversation: %1/%2 messages",
            regenerating: "🔄 Regenerating response...",
            replyToContinue: "💬 Reply to this message to continue chatting!"
        },
        ne: {
            noPrompt: "❌ कृपया AI को लागि सन्देश प्रदान गर्नुहोस्!",
            generating: "🤖 AI सोच्दै र तपाईंको अनुरोध प्रशोधन गर्दै...",
            error: "❌ त्रुटि देखा पर्यो: %1",
            cleared: "✅ तपाईंको कुराकानी इतिहास हटाइएको छ!",
            systemSet: "✅ कस्टम प्रणाली निर्देश सफलतापूर्वक सेट गरियो!",
            systemReset: "✅ प्रणाली निर्देश पूर्वनिर्धारितमा रिसेट गरियो!",
            systemCurrent: "📋 **हालको प्रणाली निर्देश:**\n```%1```",
            reasoning: "💭 **तर्क प्रक्रिया:**",
            response: "💬 **प्रतिक्रिया:**",
            historyInfo: "📊 कुराकानी: %1/%2 सन्देशहरू",
            regenerating: "🔄 प्रतिक्रिया पुन: उत्पन्न गर्दै...",
            replyToContinue: "💬 यो सन्देशलाई जवाफ दिनुहोस् कुराकानी जारी राख्न!"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;
        const userId = user.id;

        let prompt = '';

        if (isSlash) {
            prompt = interaction.options.getString('prompt');
        } else {
            if (args.length === 0) {
                return message.reply(getLang("noPrompt"));
            }
            prompt = args.join(' ');
        }

        // Check if user wants to clear history
        if (prompt.toLowerCase() === 'clear') {
            conversationHistories.delete(userId);
            const response = getLang("cleared");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        // Check if user wants to set/view/reset system instruction
        if (prompt.toLowerCase().startsWith('system')) {
            const systemArgs = prompt.split(' ').slice(1);
            
            if (systemArgs.length === 0) {
                // Show current system instruction
                const currentInstruction = customSystemInstructions.get(userId) || DEFAULT_SYSTEM_INSTRUCTION;
                const response = getLang("systemCurrent", currentInstruction);
                return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }
            
            if (systemArgs[0].toLowerCase() === 'reset') {
                // Reset to default
                customSystemInstructions.delete(userId);
                const response = getLang("systemReset");
                return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
            }
            
            // Set custom system instruction
            const customInstruction = systemArgs.join(' ');
            customSystemInstructions.set(userId, customInstruction);
            const response = getLang("systemSet");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        // Initialize or get user's conversation history
        if (!conversationHistories.has(userId)) {
            conversationHistories.set(userId, []);
        }

        const history = conversationHistories.get(userId);

        // Add user message to history
        history.push({
            role: "user",
            content: prompt
        });

        // Keep history manageable
        if (history.length > MAX_HISTORY_LENGTH) {
            history.splice(0, history.length - MAX_HISTORY_LENGTH);
        }

        // Defer reply for slash commands to prevent timeout
        if (isSlash) {
            await interaction.deferReply();
        }

        await this.generateAIResponse({ message, interaction, prompt, userId, getLang, user, isSlash });
    },

    generateAIResponse: async function ({ message, interaction, prompt, userId, getLang, user, isSlash, isRegenerate = false }) {
        const loadingMsg = isRegenerate ? getLang("regenerating") : getLang("generating");
        
        const loadingEmbed = new EmbedBuilder()
            .setDescription(loadingMsg)
            .setColor(0x5865F2)
            .setFooter({ text: `${user.username}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        let sentMessage;
        if (isSlash) {
            await interaction.editReply({ embeds: [loadingEmbed] });
            sentMessage = await interaction.fetchReply();
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
        }

        try {
            const history = conversationHistories.get(userId) || [];
            
            // Get custom system instruction or use default
            const systemInstruction = customSystemInstructions.get(userId) || DEFAULT_SYSTEM_INSTRUCTION;
            
            // Build messages array with system prompt
            const messages = [
                {
                    role: "system",
                    content: systemInstruction
                },
                ...history
            ];

            const data = JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: messages,
                stream: true,
                stream_options: {
                    include_usage: true,
                    continuous_usage_stats: true
                }
            });

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://api.deepinfra.com/v1/openai/chat/completions',
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Origin': 'https://deepinfra.com',
                    'Referer': 'https://deepinfra.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'X-Deepinfra-Source': 'web-page',
                    'accept': 'text/event-stream'
                },
                data: data,
                responseType: 'stream'
            };

            const response = await axios.request(config);

            let reasoningContent = '';
            let responseContent = '';
            let lastUpdate = Date.now();
            const UPDATE_INTERVAL = 2500; // Update embed every 2.5 seconds to avoid rate limits

            response.data.on('data', async (chunk) => {
                const lines = chunk.toString().split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                        try {
                            const jsonData = JSON.parse(line.slice(6));
                            const delta = jsonData.choices?.[0]?.delta;
                            
                            if (delta?.reasoning_content) {
                                reasoningContent += delta.reasoning_content;
                            }
                            
                            if (delta?.content) {
                                responseContent += delta.content;
                            }

                            // Update embed periodically
                            const now = Date.now();
                            if (now - lastUpdate > UPDATE_INTERVAL) {
                                lastUpdate = now;
                                await this.updateMessageEmbed({
                                    sentMessage,
                                    reasoningContent,
                                    responseContent,
                                    isComplete: false,
                                    getLang,
                                    user,
                                    history,
                                    isSlash,
                                    interaction
                                }).catch(() => {});
                            }
                        } catch (err) {
                            // Skip invalid JSON
                        }
                    }
                }
            });

            response.data.on('end', async () => {
                // Ensure we have content
                if (!responseContent.trim()) {
                    responseContent = "I apologize, but I couldn't generate a response. Please try again.";
                }
                
                // Add assistant response to history
                history.push({
                    role: "assistant",
                    content: responseContent
                });

                // Update history
                conversationHistories.set(userId, history);

                // Final update with buttons and onReply
                await this.updateMessageEmbed({
                    sentMessage,
                    reasoningContent,
                    responseContent,
                    isComplete: true,
                    getLang,
                    user,
                    history,
                    userId,
                    prompt,
                    isSlash,
                    interaction
                }).catch(err => {
                    console.error('Error updating final message:', err);
                });

                // Set up onReply handler for continuous conversation
                global.RentoBot.onReply.set(sentMessage.id, {
                    commandName: "gptoss",
                    messageId: sentMessage.id,
                    author: userId,
                    handler: async ({ message: replyMsg, getLang }) => {
                        const userPrompt = replyMsg.content.trim();
                        
                        if (!userPrompt) {
                            return replyMsg.reply(getLang("noPrompt"));
                        }

                        // Add user's new message to history
                        const currentHistory = conversationHistories.get(userId) || [];
                        currentHistory.push({
                            role: "user",
                            content: userPrompt
                        });

                        // Keep history manageable
                        if (currentHistory.length > MAX_HISTORY_LENGTH) {
                            currentHistory.splice(0, currentHistory.length - MAX_HISTORY_LENGTH);
                        }

                        conversationHistories.set(userId, currentHistory);

                        // Generate new AI response
                        await this.generateAIResponse({
                            message: replyMsg,
                            interaction: null,
                            prompt: userPrompt,
                            userId: userId,
                            getLang: getLang,
                            user: replyMsg.author,
                            isSlash: false
                        });
                    }
                });
            });

            response.data.on('error', async (error) => {
                throw error;
            });

        } catch (error) {
            console.error('GPT-OSS Error:', error);
            const errorEmbed = new EmbedBuilder()
                .setDescription(getLang("error", error.message || "Unknown error occurred"))
                .setColor(0xED4245)
                .setFooter({ text: user.username, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            if (isSlash) {
                await interaction.editReply({ embeds: [errorEmbed], components: [] }).catch(() => {});
            } else {
                await sentMessage.edit({ embeds: [errorEmbed], components: [] }).catch(() => {});
            }
        }
    },

    updateMessageEmbed: async function ({ sentMessage, reasoningContent, responseContent, isComplete, getLang, user, history, userId, prompt, isSlash, interaction }) {
        const embed = new EmbedBuilder()
            .setColor(isComplete ? 0x57F287 : 0x5865F2)
            .setFooter({ 
                text: `${user.username} | ${getLang("historyInfo", history.length, MAX_HISTORY_LENGTH)}`, 
                iconURL: user.displayAvatarURL() 
            })
            .setTimestamp();

        // Add reasoning if available (small text in spoiler)
        if (reasoningContent.trim()) {
            const truncatedReasoning = reasoningContent.length > 1000 
                ? reasoningContent.substring(0, 997) + '...' 
                : reasoningContent;
            embed.addFields({
                name: '💭 Reasoning (click to reveal)',
                value: `||${truncatedReasoning}||`,
                inline: false
            });
        }

        // Add response (split if too long)
        const displayResponse = responseContent.trim() || '...';
        
        if (displayResponse.length <= 1024) {
            embed.addFields({
                name: getLang("response"),
                value: displayResponse,
                inline: false
            });
        } else {
            // Split long responses into multiple fields
            const chunks = [];
            for (let i = 0; i < displayResponse.length; i += 1024) {
                chunks.push(displayResponse.substring(i, i + 1024));
            }
            
            // Add first chunk with title
            embed.addFields({
                name: getLang("response"),
                value: chunks[0],
                inline: false
            });
            
            // Add remaining chunks without title (max 25 fields total including reasoning)
            const maxChunks = Math.min(chunks.length, reasoningContent.trim() ? 24 : 25);
            for (let i = 1; i < maxChunks; i++) {
                embed.addFields({
                    name: '\u200B', // Zero-width space for continuation
                    value: chunks[i],
                    inline: false
                });
            }
            
            // If still truncated, add note
            if (chunks.length > maxChunks) {
                embed.setFooter({ 
                    text: `${user.username} | ${getLang("historyInfo", history.length, MAX_HISTORY_LENGTH)} | Response truncated (too long)`, 
                    iconURL: user.displayAvatarURL() 
                });
            }
        }

        // Add reply instruction when complete
        if (isComplete) {
            embed.setDescription(getLang("replyToContinue"));
        }

        const components = [];

        // Add regenerate and clear buttons when complete
        if (isComplete) {
            const regenerateButton = new ButtonBuilder()
                .setCustomId(`gptoss_regenerate_${userId}`)
                .setLabel('🔄 Regenerate')
                .setStyle(ButtonStyle.Secondary);

            const clearButton = new ButtonBuilder()
                .setCustomId(`gptoss_clear_${userId}`)
                .setLabel('🗑️ Clear History')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(regenerateButton, clearButton);

            components.push(row);
        }

        if (isSlash) {
            await interaction.editReply({ 
                embeds: [embed], 
                components: components 
            });
        } else {
            await sentMessage.edit({ 
                embeds: [embed], 
                components: components 
            });
        }
    },

    onButton: async function ({ interaction }) {
        const [, action, userId] = interaction.customId.split('_');

        // Check if the user is authorized
        if (interaction.user.id !== userId) {
            return interaction.reply({ 
                content: "❌ This button is not for you!", 
                ephemeral: true 
            });
        }

        const getLang = (key, ...args) => {
            const userLang = 'en'; // Default to English
            const lang = this.langs[userLang]?.[key] || this.langs['en']?.[key] || key;
            return global.utils.getText({ [key]: lang }, key, ...args);
        };

        if (action === 'regenerate') {
            const history = conversationHistories.get(userId);
            if (!history || history.length === 0) {
                return interaction.reply({ 
                    content: "❌ No conversation history found!", 
                    ephemeral: true 
                });
            }

            // Remove last assistant response
            if (history[history.length - 1].role === 'assistant') {
                history.pop();
            }

            // Get the last user prompt
            const lastUserMessage = [...history].reverse().find(msg => msg.role === 'user');
            if (!lastUserMessage) {
                return interaction.reply({ 
                    content: "❌ No user message found!", 
                    ephemeral: true 
                });
            }

            await interaction.deferUpdate();
            await this.generateAIResponse({
                message: null,
                interaction,
                prompt: lastUserMessage.content,
                userId,
                getLang,
                user: interaction.user,
                isSlash: true,
                isRegenerate: true
            });

        } else if (action === 'clear') {
            conversationHistories.delete(userId);
            await interaction.update({ 
                content: getLang("cleared"),
                embeds: [],
                components: []
            });
        }
    }
};
