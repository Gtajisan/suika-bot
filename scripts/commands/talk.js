
const axios = require('axios');
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "talk",
        aliases: ["ai-talk", "speak", "voice"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 0,
        description: {
            en: "Talk with AI and get audio responses in different voices",
            ne: "AI सँग कुरा गर्नुहोस् र विभिन्न आवाजहरूमा अडियो प्रतिक्रियाहरू प्राप्त गर्नुहोस्"
        },
        category: "ai",
        guide: {
            en: "{prefix}talk <prompt> - Talk with AI using default voice (alloy)\n{prefix}talk <voice> <prompt> - Talk with AI using specific voice\n\nAvailable voices:\n• alloy - Neutral, professional\n• echo - Deep, resonant\n• fable - Storyteller vibe\n• onyx - Warm, rich\n• nova - Bright, friendly\n• shimmer - Soft, melodic\n\nExamples:\n• {prefix}talk Tell me a joke\n• {prefix}talk echo Explain quantum physics\n• {prefix}talk shimmer Tell me a bedtime story",
            ne: "{prefix}talk <प्रम्प्ट> - पूर्वनिर्धारित आवाज (alloy) प्रयोग गरेर AI सँग कुरा गर्नुहोस्\n{prefix}talk <आवाज> <प्रम्प्ट> - विशिष्ट आवाज प्रयोग गरेर AI सँग कुरा गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "prompt",
                description: "What you want to ask the AI",
                type: 3,
                required: true
            },
            {
                name: "voice",
                description: "Voice model for the AI response",
                type: 3,
                required: false,
                choices: [
                    { name: "Alloy - Neutral, professional", value: "alloy" },
                    { name: "Echo - Deep, resonant", value: "echo" },
                    { name: "Fable - Storyteller vibe", value: "fable" },
                    { name: "Onyx - Warm, rich", value: "onyx" },
                    { name: "Nova - Bright, friendly", value: "nova" },
                    { name: "Shimmer - Soft, melodic", value: "shimmer" }
                ]
            }
        ]
    },

    langs: {
        en: {
            noPrompt: "❌ Please provide a prompt for the AI!",
            generating: "🤖 AI is thinking and generating audio response...",
            error: "❌ An error occurred: %1",
            success: "🤖 **AI Audio Response**\n\n**Voice:** %1\n**Prompt:** %2",
            tooLong: "❌ Prompt is too long! Maximum 500 characters allowed.",
            invalidVoice: "❌ Invalid voice! Available voices: alloy, echo, fable, onyx, nova, shimmer",
            selectVoice: "🎙️ Select a voice to regenerate the AI response:",
            voiceChanged: "🔄 Regenerating AI response with voice: %1"
        },
        ne: {
            noPrompt: "❌ कृपया AI को लागि प्रम्प्ट प्रदान गर्नुहोस्!",
            generating: "🤖 AI सोच्दै र अडियो प्रतिक्रिया उत्पन्न गर्दै...",
            error: "❌ त्रुटि देखा पर्यो: %1",
            success: "🤖 **AI अडियो प्रतिक्रिया**\n\n**आवाज:** %1\n**प्रम्प्ट:** %2",
            tooLong: "❌ प्रम्प्ट धेरै लामो छ! अधिकतम ५०० अक्षरहरू अनुमति छ।",
            invalidVoice: "❌ अमान्य आवाज! उपलब्ध आवाजहरू: alloy, echo, fable, onyx, nova, shimmer"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        const availableVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        const voiceDescriptions = {
            alloy: 'Neutral, professional',
            echo: 'Deep, resonant',
            fable: 'Storyteller vibe',
            onyx: 'Warm, rich',
            nova: 'Bright, friendly',
            shimmer: 'Soft, melodic'
        };

        let prompt = '';
        let voice = 'alloy';

        if (isSlash) {
            prompt = interaction.options.getString('prompt');
            voice = interaction.options.getString('voice') || 'alloy';
        } else {
            if (args.length === 0) {
                return message.reply(getLang("noPrompt"));
            }

            const firstArg = args[0].toLowerCase();
            if (availableVoices.includes(firstArg)) {
                voice = firstArg;
                prompt = args.slice(1).join(' ');
            } else {
                prompt = args.join(' ');
            }
        }

        if (!prompt || prompt.trim().length === 0) {
            const response = getLang("noPrompt");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        if (prompt.length > 500) {
            const response = getLang("tooLong");
            return isSlash ? interaction.reply({ content: response, ephemeral: true }) : message.reply(response);
        }

        await this.generateAIResponse({ message, interaction, prompt, voice, getLang, user, isSlash });
    },

    generateAIResponse: async function ({ message, interaction, prompt, voice, getLang, user, isSlash }) {
        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("generating"))
            .setColor(0x5865F2)
            .setFooter({ text: `Voice: ${voice} | ${user.username}`, iconURL: user.displayAvatarURL() });

        let sentMessage;
        if (isSlash) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [loadingEmbed] });
                sentMessage = { interaction, isSlash: true };
            } else {
                await interaction.reply({ embeds: [loadingEmbed] });
                sentMessage = { interaction, isSlash: true };
            }
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
            sentMessage.isSlash = false;
        }

        try {
            const randomSeed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=openai-audio&voice=${voice}&token=DjJ_zC9a3E0bvInM&seed=${randomSeed}`;

            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            const tmpDir = path.join(__dirname, 'tmp');
            await fs.ensureDir(tmpDir);

            const audioPath = path.join(tmpDir, `talk_${user.id}_${Date.now()}.mp3`);
            await fs.writeFile(audioPath, response.data);

            const attachment = new AttachmentBuilder(audioPath, { 
                name: 'ai_response.mp3',
                description: 'AI Voice Response'
            });

            const voiceDescriptions = {
                alloy: 'Neutral, professional',
                echo: 'Deep, resonant',
                fable: 'Storyteller vibe',
                onyx: 'Warm, rich',
                nova: 'Bright, friendly',
                shimmer: 'Soft, melodic'
            };

            const successEmbed = new EmbedBuilder()
                .setDescription(getLang("success", `${voice} (${voiceDescriptions[voice]})`, prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt))
                .setColor(0x57F287)
                .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            const availableVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
            const voiceOptions = availableVoices.map(v => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(v.charAt(0).toUpperCase() + v.slice(1))
                    .setDescription(voiceDescriptions[v])
                    .setValue(v)
                    .setEmoji(v === voice ? '🔊' : '🎙️')
                    .setDefault(v === voice)
            );

            const menuId = `talk_voice_select_${Date.now()}_${user.id}`;
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(menuId)
                .setPlaceholder('Change voice...')
                .addOptions(voiceOptions);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const replyOptions = {
                embeds: [successEmbed],
                files: [attachment],
                components: [row]
            };

            if (sentMessage.isSlash) {
                await sentMessage.interaction.editReply(replyOptions);
            } else {
                await sentMessage.edit(replyOptions);
            }

            global.RentoBot.onSelectMenu.set(menuId, async (selectInteraction) => {
                if (selectInteraction.user.id !== user.id) {
                    return selectInteraction.reply({ content: "❌ You cannot change someone else's voice selection!", ephemeral: true });
                }

                const newVoice = selectInteraction.values[0];
                await selectInteraction.deferUpdate();
                global.RentoBot.onSelectMenu.delete(menuId);

                await this.generateAIResponse({ 
                    interaction: selectInteraction, 
                    prompt, 
                    voice: newVoice, 
                    getLang, 
                    user, 
                    isSlash: true 
                });
            });

            setTimeout(() => {
                global.RentoBot.onSelectMenu.delete(menuId);
                fs.remove(audioPath).catch(() => {});
            }, 300000);

        } catch (error) {
            console.error('Talk command error:', error);
            const errorEmbed = new EmbedBuilder()
                .setDescription(getLang("error", error.message || "Unknown error"))
                .setColor(0xED4245);

            if (sentMessage.isSlash) {
                await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
            } else {
                await sentMessage.edit({ embeds: [errorEmbed], components: [] });
            }
        }
    }
};
