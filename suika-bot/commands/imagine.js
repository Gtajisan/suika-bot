
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "imagine",
        aliases: ["img", "generate", "ai-img"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Generate AI images from text prompts using advanced AI model",
            ne: "उन्नत AI मोडेल प्रयोग गरी पाठ प्रम्प्टबाट AI छविहरू उत्पन्न गर्नुहोस्"
        },
        category: "ai",
        guide: {
            en: "{prefix}imagine <prompt>\nExample: {prefix}imagine A wizard's library with floating books and magical lights",
            ne: "{prefix}imagine <प्रम्प्ट>\nउदाहरण: {prefix}imagine जादूगरको पुस्तकालय तैरिरहेका पुस्तकहरू र जादुई बत्तीहरूसँग"
        },
        slash: true,
        options: [
            {
                name: "prompt",
                description: "Description of the image you want to generate",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noPrompt: "❌ Please provide a prompt!\nExample: `{prefix}imagine A serene mountain lake at sunset`",
            generating: "🎨 Generating your images...\nThis may take 10-15 seconds.",
            generatingRetry: "⏳ Retrying... (Attempt {attempt}/{maxRetries})",
            error: "❌ Failed to generate images after {maxRetries} attempts.\nError: {error}",
            success: "✅ Generated 4 images in {time}!",
            prompt: "**Prompt:** {prompt}",
            selectImage: "Click a number button (1-4) to view individual images, or click 🔄 to regenerate.",
            imageTitle: "Image #{number}",
            regenerating: "🔄 Regenerating images with the same prompt...",
            timeout: "The API request timed out. Please try again.",
            networkError: "Network error occurred. Please check your connection and try again."
        },
        ne: {
            noPrompt: "❌ कृपया प्रम्प्ट प्रदान गर्नुहोस्!\nउदाहरण: `{prefix}imagine सूर्यास्तमा एक शान्त पहाडी ताल`",
            generating: "🎨 तपाईंका छविहरू उत्पन्न गर्दै...\nयसले १०-१५ सेकेन्ड लाग्न सक्छ।",
            generatingRetry: "⏳ पुन: प्रयास गर्दै... (प्रयास {attempt}/{maxRetries})",
            error: "❌ {maxRetries} प्रयास पछि छविहरू उत्पन्न गर्न असफल भयो।\nत्रुटि: {error}",
            success: "✅ {time} मा ४ छविहरू उत्पन्न गरियो!",
            prompt: "**प्रम्प्ट:** {prompt}",
            selectImage: "व्यक्तिगत छविहरू हेर्न संख्या बटन (१-४) क्लिक गर्नुहोस्, वा पुन: उत्पन्न गर्न 🔄 क्लिक गर्नुहोस्।",
            imageTitle: "छवि #{number}",
            regenerating: "🔄 एउटै प्रम्प्टसँग छविहरू पुन: उत्पन्न गर्दै...",
            timeout: "API अनुरोध समय सकियो। कृपया पुन: प्रयास गर्नुहोस्।",
            networkError: "नेटवर्क त्रुटि देखा पर्यो। कृपया आफ्नो जडान जाँच गर्नुहोस् र पुन: प्रयास गर्नुहोस्।"
        }
    },

    onStart: async ({ message, interaction, args, getLang, prefix, commandName }) => {
        const isSlash = !!interaction;
        
        // Get prompt
        let prompt;
        if (isSlash) {
            prompt = interaction.options?.getString('prompt') || args.join(' ');
        } else {
            prompt = args.join(' ');
        }

        // Validate prompt
        if (!prompt || prompt.trim().length === 0) {
            const response = getLang("noPrompt").replace('{prefix}', prefix);
            return isSlash ? interaction.reply(response) : message.reply(response);
        }

        // Defer reply for slash commands
        if (isSlash && !interaction.deferred) {
            await interaction.deferReply();
        }

        // Send initial generating message
        const generatingMsg = getLang("generating");
        const initialMsg = isSlash 
            ? await interaction.editReply(generatingMsg)
            : await message.reply(generatingMsg);

        // Generate images with retry logic
        const maxRetries = 3;
        let imageUrls = null;
        let generationTime = null;
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    const retryMsg = getLang("generatingRetry")
                        .replace('{attempt}', attempt)
                        .replace('{maxRetries}', maxRetries);
                    
                    if (isSlash) {
                        await interaction.editReply(retryMsg);
                    } else {
                        await initialMsg.edit(retryMsg);
                    }
                }

                const response = await axios.post('https://samir-ai-img.vercel.app/genimg', {
                    prompt: prompt
                }, {
                    timeout: 60000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data && response.data.imageUrls && response.data.imageUrls.length === 4) {
                    imageUrls = response.data.imageUrls;
                    generationTime = response.data.time;
                    break;
                }
            } catch (error) {
                lastError = error;
                
                if (error.code === 'ECONNABORTED') {
                    lastError = new Error(getLang("timeout"));
                } else if (error.response?.status === 504) {
                    lastError = new Error(getLang("timeout"));
                } else if (!error.response) {
                    lastError = new Error(getLang("networkError"));
                }
                
                // Wait before retry (except on last attempt)
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        // Check if generation failed
        if (!imageUrls) {
            const errorMsg = getLang("error")
                .replace('{maxRetries}', maxRetries)
                .replace('{error}', lastError?.message || 'Unknown error');
            
            return isSlash 
                ? interaction.editReply(errorMsg)
                : initialMsg.edit(errorMsg);
        }

        // Create merged image with Canvas
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 1024, 1024);

        // Load and draw all 4 images
        try {
            const images = await Promise.all(imageUrls.map(url => loadImage(url)));
            
            // Draw images in 2x2 grid
            const positions = [
                { x: 0, y: 0 },      // Top-left
                { x: 512, y: 0 },    // Top-right
                { x: 0, y: 512 },    // Bottom-left
                { x: 512, y: 512 }   // Bottom-right
            ];

            images.forEach((img, idx) => {
                const pos = positions[idx];
                ctx.drawImage(img, pos.x, pos.y, 512, 512);
                
                // Draw number labels
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(pos.x + 10, pos.y + 10, 40, 40);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 28px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(idx + 1, pos.x + 30, pos.y + 30);
            });

            // Save to temporary file
            const tmpDir = path.join(__dirname, 'tmp');
            fs.ensureDirSync(tmpDir);
            const filename = `imagine_${Date.now()}.png`;
            const filepath = path.join(tmpDir, filename);
            
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filepath, buffer);

            // Create attachment
            const attachment = new AttachmentBuilder(filepath, { name: 'generated-images.png' });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(getLang("success").replace('{time}', generationTime))
                .setDescription(
                    getLang("prompt").replace('{prompt}', prompt) + '\n\n' +
                    getLang("selectImage")
                )
                .setImage('attachment://generated-images.png')
                .setColor(0x00AE86)
                .setFooter({ text: `Requested by ${isSlash ? interaction.user.tag : message.author.tag}` })
                .setTimestamp();

            // Create buttons
            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`img_1_${Date.now()}`)
                        .setLabel('1')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`img_2_${Date.now()}`)
                        .setLabel('2')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`img_3_${Date.now()}`)
                        .setLabel('3')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`img_4_${Date.now()}`)
                        .setLabel('4')
                        .setStyle(ButtonStyle.Primary)
                );

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`img_regen_${Date.now()}`)
                        .setLabel('Regenerate')
                        .setEmoji('🔄')
                        .setStyle(ButtonStyle.Success)
                );

            // Send response
            const replyOptions = {
                embeds: [embed],
                files: [attachment],
                components: [row1, row2]
            };

            const sentMessage = isSlash 
                ? await interaction.editReply(replyOptions)
                : await initialMsg.edit(replyOptions);

            // Button collector
            const collector = sentMessage.createMessageComponentCollector({ 
                time: 300000 // 5 minutes
            });

            collector.on('collect', async (btnInteraction) => {
                const customId = btnInteraction.customId;
                
                if (customId.startsWith('img_regen_')) {
                    await btnInteraction.deferReply();
                    
                    // Regenerate with same prompt
                    const newArgs = prompt.split(' ');
                    return module.exports.onStart({
                        message: btnInteraction,
                        interaction: null,
                        args: newArgs,
                        getLang,
                        prefix
                    });
                } else if (customId.startsWith('img_')) {
                    const imgNum = parseInt(customId.split('_')[1]);
                    
                    if (imgNum >= 1 && imgNum <= 4 && imageUrls[imgNum - 1]) {
                        const imgEmbed = new EmbedBuilder()
                            .setTitle(getLang("imageTitle").replace('{number}', imgNum))
                            .setDescription(getLang("prompt").replace('{prompt}', prompt))
                            .setImage(imageUrls[imgNum - 1])
                            .setColor(0x00AE86)
                            .setFooter({ text: `Image ${imgNum} of 4` })
                            .setTimestamp();

                        await btnInteraction.reply({
                            embeds: [imgEmbed],
                            ephemeral: false
                        });
                    }
                }
            });

            collector.on('end', () => {
                // Clean up temp file when collector ends
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
            });

        } catch (error) {
            console.error('Canvas error:', error);
            const errorMsg = getLang("error")
                .replace('{maxRetries}', maxRetries)
                .replace('{error}', error.message);
            
            return isSlash 
                ? interaction.editReply(errorMsg)
                : initialMsg.edit(errorMsg);
        }
    }
};
