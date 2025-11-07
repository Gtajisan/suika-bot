const { GoogleGenAI, Modality } = require('@google/genai');
const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const conversationHistory = new Map();
const MAX_HISTORY = 10;

module.exports = {
    config: {
        name: "gemini",
        aliases: ["gem", "ai", "gpt"],
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Ultimate Gemini AI with text, image, video, audio analysis and generation capabilities",
            ne: "पाठ, छवि, भिडियो, अडियो विश्लेषण र उत्पादन क्षमता भएको जेमिनी AI"
        },
        category: "ai",
        guide: {
            en: `{prefix}gemini <prompt> - Chat with Gemini AI
{prefix}gemini [image] <question> - Analyze images
{prefix}gemini [video] <question> - Analyze videos  
{prefix}gemini [audio] <question> - Transcribe/analyze audio
{prefix}gemini generate <description> - Generate images
{prefix}gemini clear - Clear conversation history

Features: Conversation memory, multi-modal understanding, image generation, streaming responses`,
            ne: `{prefix}gemini <प्रम्प्ट> - जेमिनी AI सँग कुरा गर्नुहोस्
{prefix}gemini [छवि] <प्रश्न> - छविहरू विश्लेषण गर्नुहोस्
{prefix}gemini [भिडियो] <प्रश्न> - भिडियोहरू विश्लेषण गर्नुहोस्
{prefix}gemini [अडियो] <प्रश्न> - अडियो ट्रान्सक्राइब/विश्लेषण गर्नुहोस्
{prefix}gemini generate <विवरण> - छविहरू उत्पन्न गर्नुहोस्
{prefix}gemini clear - वार्तालाप इतिहास खाली गर्नुहोस्`
        },
        slash: true,
        options: [
            {
                name: "prompt",
                description: "Your question or prompt for Gemini AI",
                type: 3,
                required: true
            },
            {
                name: "image",
                description: "Image to analyze (optional)",
                type: 11,
                required: false
            },
            {
                name: "mode",
                description: "AI mode selection",
                type: 3,
                required: false,
                choices: [
                    { name: "Chat (Fast)", value: "flash" },
                    { name: "Advanced Reasoning (Pro)", value: "pro" },
                    { name: "Image Generation", value: "image" },
                    { name: "Clear History", value: "clear" }
                ]
            }
        ]
    },

    langs: {
        en: {
            noPrompt: "❌ Please provide a prompt!\nExample: `{prefix}gemini What is quantum computing?`",
            thinking: "🧠 Gemini is thinking...",
            analyzing: "🔍 Analyzing your {type}...",
            generating: "🎨 Generating image...",
            historyCleared: "✅ Conversation history cleared!",
            error: "❌ Error: {error}",
            tooLarge: "❌ File too large! Maximum size: {size}MB",
            unsupportedFormat: "❌ Unsupported file format: {format}",
            downloadError: "❌ Failed to download attachment",
            responseTitle: "💎 Gemini AI Response",
            imageGenerated: "🎨 Image Generated",
            conversationInfo: "💬 Conversation: {count}/{max} messages",
            features: "🌟 Available Features",
            selectFeature: "Choose a feature below:",
            multiModalAnalysis: "Multi-Modal Analysis Complete",
            audioTranscribed: "Audio Transcription Complete",
            videoAnalyzed: "Video Analysis Complete"
        },
        ne: {
            noPrompt: "❌ कृपया प्रम्प्ट प्रदान गर्नुहोस्!\nउदाहरण: `{prefix}gemini क्वान्टम कम्प्युटिङ के हो?`",
            thinking: "🧠 जेमिनी सोच्दैछ...",
            analyzing: "🔍 तपाईंको {type} विश्लेषण गर्दै...",
            generating: "🎨 छवि उत्पन्न गर्दै...",
            historyCleared: "✅ वार्तालाप इतिहास खाली गरियो!",
            error: "❌ त्रुटि: {error}",
            tooLarge: "❌ फाइल धेरै ठूलो छ! अधिकतम आकार: {size}MB",
            unsupportedFormat: "❌ असमर्थित फाइल ढाँचा: {format}",
            downloadError: "❌ संलग्नक डाउनलोड गर्न असफल",
            responseTitle: "💎 जेमिनी AI प्रतिक्रिया",
            imageGenerated: "🎨 छवि उत्पन्न गरियो",
            conversationInfo: "💬 वार्तालाप: {count}/{max} सन्देशहरू",
            features: "🌟 उपलब्ध सुविधाहरू",
            selectFeature: "तल एक सुविधा छान्नुहोस्:",
            multiModalAnalysis: "मल्टी-मोडल विश्लेषण पूर्ण",
            audioTranscribed: "अडियो ट्रान्सक्रिप्शन पूर्ण",
            videoAnalyzed: "भिडियो विश्लेषण पूर्ण"
        }
    },

    onStart: async ({ message, interaction, args, getLang, prefix, event }) => {
        const isSlash = !!interaction;
        const userId = isSlash ? interaction.user.id : message.author.id;
        const userTag = isSlash ? interaction.user.tag : message.author.tag;

        let prompt = '';
        let selectedMode = 'flash';
        let attachmentUrl = null;
        let attachmentType = null;

        if (isSlash) {
            prompt = interaction.options?.getString('prompt') || '';
            selectedMode = interaction.options?.getString('mode') || 'flash';
            const imageAttachment = interaction.options?.getAttachment('image');
            if (imageAttachment) {
                attachmentUrl = imageAttachment.url;
                attachmentType = imageAttachment.contentType;
            }
        } else {
            prompt = args.join(' ');
            
            if (message.attachments && message.attachments.size > 0) {
                const attachment = message.attachments.first();
                attachmentUrl = attachment.url;
                attachmentType = attachment.contentType;
            }

            if (message.reference) {
                try {
                    const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
                    if (repliedMsg.attachments && repliedMsg.attachments.size > 0) {
                        const attachment = repliedMsg.attachments.first();
                        attachmentUrl = attachment.url;
                        attachmentType = attachment.contentType;
                    }
                } catch (e) {}
            }
        }

        if (prompt.toLowerCase().startsWith('generate ')) {
            selectedMode = 'image';
            prompt = prompt.substring(9).trim();
        } else if (prompt.toLowerCase() === 'clear') {
            selectedMode = 'clear';
        }

        if (selectedMode === 'clear') {
            conversationHistory.delete(userId);
            return isSlash 
                ? interaction.reply(getLang("historyCleared"))
                : message.reply(getLang("historyCleared"));
        }

        if (!prompt || prompt.trim().length === 0) {
            const response = getLang("noPrompt").replace('{prefix}', prefix);
            return isSlash ? interaction.reply(response) : message.reply(response);
        }

        if (isSlash && !interaction.deferred) {
            await interaction.deferReply();
        }

        const thinkingMsg = selectedMode === 'image' 
            ? getLang("generating")
            : attachmentUrl 
                ? getLang("analyzing").replace('{type}', getFileType(attachmentType))
                : getLang("thinking");

        const initialMsg = isSlash 
            ? await interaction.editReply(thinkingMsg)
            : await message.reply(thinkingMsg);

        try {
            let response;

            if (selectedMode === 'image') {
                response = await generateImage(prompt);
                
                if (response.imagePath) {
                    const attachment = new AttachmentBuilder(response.imagePath, { name: 'generated-image.png' });
                    const embed = new EmbedBuilder()
                        .setTitle(getLang("imageGenerated"))
                        .setDescription(`**Prompt:** ${prompt}`)
                        .setImage('attachment://generated-image.png')
                        .setColor(0x4285f4)
                        .setFooter({ text: `Generated by ${userTag}` })
                        .setTimestamp();

                    const buttons = createActionButtons(userId);
                    
                    const replyMsg = isSlash
                        ? await interaction.editReply({ embeds: [embed], files: [attachment], components: [buttons] })
                        : await initialMsg.edit({ embeds: [embed], files: [attachment], components: [buttons] });

                    setTimeout(() => {
                        if (fs.existsSync(response.imagePath)) {
                            fs.unlinkSync(response.imagePath);
                        }
                    }, 30000);

                    setupButtonCollector(replyMsg, userId, prompt, getLang, userTag, 'image');
                    return;
                }
            } else if (attachmentUrl) {
                response = await analyzeMultiModal(prompt, attachmentUrl, attachmentType, selectedMode);
            } else {
                response = await chatWithGemini(userId, prompt, selectedMode);
            }

            const history = conversationHistory.get(userId) || [];
            const embed = new EmbedBuilder()
                .setTitle(getLang("responseTitle"))
                .setDescription(truncateText(response.text, 4000))
                .setColor(0x4285f4)
                .setFooter({ 
                    text: `${userTag} • ${getLang("conversationInfo").replace('{count}', history.length).replace('{max}', MAX_HISTORY)}` 
                })
                .setTimestamp();

            if (response.imageUrl) {
                embed.setImage(response.imageUrl);
            }

            const buttons = createActionButtons(userId);
            const selectMenu = createFeatureMenu();

            const replyMsg = isSlash
                ? await interaction.editReply({ embeds: [embed], components: [buttons, selectMenu] })
                : await initialMsg.edit({ embeds: [embed], components: [buttons, selectMenu] });

            setupButtonCollector(replyMsg, userId, prompt, getLang, userTag);
            setupSelectMenuCollector(replyMsg, userId, getLang, userTag);

        } catch (error) {
            console.error('Gemini error:', error);
            const errorMsg = getLang("error").replace('{error}', error.message);
            return isSlash 
                ? interaction.editReply(errorMsg)
                : initialMsg.edit(errorMsg);
        }
    },

    onReply: async ({ message, event, Reply, getLang, prefix }) => {
        const userId = message.author.id;
        const userTag = message.author.tag;
        const prompt = event.body;

        if (!prompt || prompt.trim().length === 0) return;

        const thinkingMsg = await Reply(getLang("thinking"));

        try {
            let attachmentUrl = null;
            let attachmentType = null;

            if (message.attachments && message.attachments.size > 0) {
                const attachment = message.attachments.first();
                attachmentUrl = attachment.url;
                attachmentType = attachment.contentType;
            }

            let response;
            if (attachmentUrl) {
                response = await analyzeMultiModal(prompt, attachmentUrl, attachmentType, 'flash');
            } else {
                response = await chatWithGemini(userId, prompt, 'flash');
            }

            const history = conversationHistory.get(userId) || [];
            const embed = new EmbedBuilder()
                .setTitle(getLang("responseTitle"))
                .setDescription(truncateText(response.text, 4000))
                .setColor(0x4285f4)
                .setFooter({ 
                    text: `${userTag} • ${getLang("conversationInfo").replace('{count}', history.length).replace('{max}', MAX_HISTORY)}` 
                })
                .setTimestamp();

            const buttons = createActionButtons(userId);
            const selectMenu = createFeatureMenu();

            const replyMsg = await thinkingMsg.edit({ embeds: [embed], components: [buttons, selectMenu] });
            
            setupButtonCollector(replyMsg, userId, prompt, getLang, userTag);
            setupSelectMenuCollector(replyMsg, userId, getLang, userTag);

        } catch (error) {
            console.error('Gemini onReply error:', error);
            await thinkingMsg.edit(getLang("error").replace('{error}', error.message));
        }
    }
};

async function chatWithGemini(userId, prompt, mode = 'flash') {
    const modelName = mode === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    if (!conversationHistory.has(userId)) {
        conversationHistory.set(userId, []);
    }

    const history = conversationHistory.get(userId);
    
    const contents = [];
    for (const msg of history) {
        contents.push({ role: 'user', parts: [{ text: msg.user }] });
        contents.push({ role: 'model', parts: [{ text: msg.model }] });
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
        model: modelName,
        contents: contents
    });

    const responseText = response.text || "I couldn't generate a response.";
    
    history.push({ user: prompt, model: responseText });
    
    if (history.length > MAX_HISTORY) {
        history.shift();
    }

    return { text: responseText };
}

async function analyzeMultiModal(prompt, fileUrl, fileType, mode = 'flash') {
    const modelName = mode === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const maxSize = 20 * 1024 * 1024;
    
    try {
        const response = await axios.get(fileUrl, { 
            responseType: 'arraybuffer', 
            maxContentLength: maxSize,
            maxBodyLength: maxSize
        });
        const buffer = Buffer.from(response.data);
        
        if (buffer.length > maxSize) {
            throw new Error(`File too large! Maximum size is 20MB, your file is ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
        }
        
        const base64Data = buffer.toString('base64');

    let mimeType = fileType || 'application/octet-stream';
    
    if (fileUrl.includes('.mp4') || fileUrl.includes('.mov') || fileUrl.includes('.avi')) mimeType = 'video/mp4';
    else if (fileUrl.includes('.mp3')) mimeType = 'audio/mp3';
    else if (fileUrl.includes('.wav')) mimeType = 'audio/wav';
    else if (fileUrl.includes('.ogg')) mimeType = 'audio/ogg';
    else if (fileUrl.includes('.jpg') || fileUrl.includes('.jpeg')) mimeType = 'image/jpeg';
    else if (fileUrl.includes('.png')) mimeType = 'image/png';
    else if (fileUrl.includes('.gif')) mimeType = 'image/gif';
    else if (fileUrl.includes('.webp')) mimeType = 'image/webp';
    else if (fileUrl.includes('.pdf')) mimeType = 'application/pdf';

    const contents = [
        {
            role: 'user',
            parts: [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                },
                { text: prompt || "Analyze this file in detail and provide a comprehensive description." }
            ]
        }
    ];

        const result = await ai.models.generateContent({
            model: modelName,
            contents: contents
        });

        return { text: result.text || "Analysis complete." };
    } catch (error) {
        if (error.code === 'ERR_BAD_RESPONSE' || error.message.includes('maxContentLength')) {
            throw new Error('File too large! Maximum size is 20MB');
        }
        throw error;
    }
}

async function generateImage(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-preview-image-generation',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE]
            }
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error('No image generated');
        }

        const content = candidates[0].content;
        if (!content || !content.parts) {
            throw new Error('No content in response');
        }

        for (const part of content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const tmpDir = path.join(__dirname, 'tmp');
                fs.ensureDirSync(tmpDir);
                const filename = `gemini_gen_${Date.now()}.png`;
                const filepath = path.join(tmpDir, filename);
                
                const imageData = Buffer.from(part.inlineData.data, 'base64');
                fs.writeFileSync(filepath, imageData);
                
                return { imagePath: filepath, text: part.text || '' };
            }
        }

        throw new Error('No image data found in response');
    } catch (error) {
        throw new Error(`Image generation failed: ${error.message}`);
    }
}

function createActionButtons(userId) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`gemini_continue_${userId}_${Date.now()}`)
                .setLabel('Continue Chat')
                .setEmoji('💬')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`gemini_clear_${userId}_${Date.now()}`)
                .setLabel('Clear History')
                .setEmoji('🗑️')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`gemini_export_${userId}_${Date.now()}`)
                .setLabel('Export Chat')
                .setEmoji('📥')
                .setStyle(ButtonStyle.Secondary)
        );
}

function createFeatureMenu() {
    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('gemini_feature_select')
                .setPlaceholder('🌟 Choose a feature...')
                .addOptions([
                    {
                        label: 'Text Generation',
                        description: 'Generate creative text, stories, code',
                        value: 'text',
                        emoji: '📝'
                    },
                    {
                        label: 'Image Analysis',
                        description: 'Analyze and describe images',
                        value: 'image_analyze',
                        emoji: '🖼️'
                    },
                    {
                        label: 'Image Generation',
                        description: 'Create AI-generated images',
                        value: 'image_gen',
                        emoji: '🎨'
                    },
                    {
                        label: 'Video Analysis',
                        description: 'Analyze video content and extract info',
                        value: 'video',
                        emoji: '🎥'
                    },
                    {
                        label: 'Audio Transcription',
                        description: 'Transcribe and analyze audio',
                        value: 'audio',
                        emoji: '🎵'
                    },
                    {
                        label: 'Code Assistant',
                        description: 'Write, debug, and explain code',
                        value: 'code',
                        emoji: '💻'
                    },
                    {
                        label: 'Advanced Reasoning',
                        description: 'Use Gemini Pro for complex tasks',
                        value: 'pro',
                        emoji: '🧠'
                    }
                ])
        );
}

function setupButtonCollector(message, userId, prompt, getLang, userTag, context = 'chat') {
    const collector = message.createMessageComponentCollector({
        filter: (i) => i.customId.includes('gemini_') && i.customId.includes(userId),
        time: 300000
    });

    collector.on('collect', async (interaction) => {
        const customId = interaction.customId;

        try {
            if (customId.includes('gemini_continue_')) {
                await interaction.reply({
                    content: '💬 Type your next message to continue the conversation!',
                    ephemeral: false
                });
            } else if (customId.includes('gemini_clear_')) {
                conversationHistory.delete(userId);
                await interaction.reply({
                    content: '✅ Conversation history cleared!',
                    ephemeral: false
                });
            } else if (customId.includes('gemini_export_')) {
                const history = conversationHistory.get(userId) || [];
                
                if (history.length === 0) {
                    return interaction.reply({
                        content: '❌ No conversation history to export!',
                        ephemeral: true
                    });
                }

                let exportText = `Gemini AI Conversation Export\nUser: ${userTag}\nDate: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
                
                history.forEach((msg, index) => {
                    exportText += `[${index + 1}] User: ${msg.user}\n\n`;
                    exportText += `[${index + 1}] Gemini: ${msg.model}\n\n`;
                    exportText += '-'.repeat(50) + '\n\n';
                });

                const tmpDir = path.join(__dirname, 'tmp');
                fs.ensureDirSync(tmpDir);
                const filename = `gemini_chat_${userId}_${Date.now()}.txt`;
                const filepath = path.join(tmpDir, filename);
                
                fs.writeFileSync(filepath, exportText);
                
                const attachment = new AttachmentBuilder(filepath, { name: 'conversation.txt' });
                
                await interaction.reply({
                    content: '📥 Here\'s your conversation export!',
                    files: [attachment],
                    ephemeral: false
                });

                setTimeout(() => {
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath);
                    }
                }, 10000);
            }
        } catch (error) {
            console.error('Button interaction error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `❌ Error: ${error.message}`,
                    ephemeral: true
                });
            }
        }
    });
}

function setupSelectMenuCollector(message, userId, getLang, userTag) {
    const collector = message.createMessageComponentCollector({
        filter: (i) => i.customId === 'gemini_feature_select',
        time: 300000
    });

    collector.on('collect', async (interaction) => {
        const selectedFeature = interaction.values[0];

        const featureInfo = {
            text: {
                title: '📝 Text Generation',
                description: 'I can help you with:\n• Creative writing & stories\n• Essays & articles\n• Translations\n• Summaries\n• Q&A\n\nJust ask me anything!',
                example: 'Example: "Write a short story about a robot learning to paint"'
            },
            image_analyze: {
                title: '🖼️ Image Analysis',
                description: 'Upload an image and I can:\n• Describe what\'s in it\n• Answer questions about it\n• Extract text (OCR)\n• Identify objects & scenes\n• Provide detailed analysis',
                example: 'Example: Upload an image and ask "What\'s in this picture?"'
            },
            image_gen: {
                title: '🎨 Image Generation',
                description: 'I can create images for you!\n\nUse: `gemini generate <description>`',
                example: 'Example: "gemini generate a cyberpunk city at sunset"'
            },
            video: {
                title: '🎥 Video Analysis',
                description: 'Upload a video and I can:\n• Summarize content\n• Extract key moments\n• Answer questions\n• Transcribe audio\n• Analyze scenes',
                example: 'Example: Upload a video and ask "Summarize this video"'
            },
            audio: {
                title: '🎵 Audio Transcription',
                description: 'Upload audio and I can:\n• Transcribe speech to text\n• Identify speakers\n• Summarize content\n• Answer questions about it',
                example: 'Example: Upload audio and ask "Transcribe this"'
            },
            code: {
                title: '💻 Code Assistant',
                description: 'I can help with coding:\n• Write code in any language\n• Debug errors\n• Explain code\n• Optimize algorithms\n• Code reviews',
                example: 'Example: "Write a Python function to sort a list"'
            },
            pro: {
                title: '🧠 Advanced Reasoning (Pro)',
                description: 'Using Gemini 2.5 Pro for:\n• Complex analysis\n• Mathematical problems\n• Scientific reasoning\n• Detailed research\n• Advanced tasks',
                example: 'Add "mode: pro" or use slash command with Pro mode'
            }
        };

        const info = featureInfo[selectedFeature];
        
        const embed = new EmbedBuilder()
            .setTitle(info.title)
            .setDescription(info.description)
            .addFields({ name: '💡 How to Use', value: info.example })
            .setColor(0x4285f4)
            .setFooter({ text: `Requested by ${userTag}` })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    });
}

function getFileType(mimeType) {
    if (!mimeType) return 'file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'PDF';
    return 'file';
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}
