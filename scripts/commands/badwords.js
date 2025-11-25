
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    config: {
        name: "badwords",
        aliases: ["badword", "filter"],
        version: "1.0",
        author: "Samir",
        countDown: 3,
        role: 1,
        description: {
            en: "Manage badword filter - auto-warn and kick users who use badwords",
            ne: "खराब शब्द फिल्टर प्रबन्धन गर्नुहोस् - खराब शब्द प्रयोग गर्ने प्रयोगकर्ताहरूलाई स्वतः चेतावनी र किक गर्नुहोस्"
        },
        category: "moderation",
        guide: {
            en: "{prefix}badwords add <word> - Add a badword\n{prefix}badwords add <word1,word2,word3> - Add multiple badwords\n{prefix}badwords remove <word> - Remove a badword\n{prefix}badwords remove <word1,word2> - Remove multiple badwords\n{prefix}badwords remove all - Remove all badwords\n{prefix}badwords list - List all badwords\n{prefix}badwords toggle - Enable/disable badword filter",
            ne: "{prefix}badwords add <शब्द> - खराब शब्द थप्नुहोस्\n{prefix}badwords add <शब्द१,शब्द२,शब्द३> - धेरै खराब शब्दहरू थप्नुहोस्\n{prefix}badwords remove <शब्द> - खराब शब्द हटाउनुहोस्\n{prefix}badwords remove <शब्द१,शब्द२> - धेरै खराब शब्दहरू हटाउनुहोस्\n{prefix}badwords remove all - सबै खराब शब्दहरू हटाउनुहोस्\n{prefix}badwords list - सबै खराब शब्दहरू सूचीबद्ध गर्नुहोस्\n{prefix}badwords toggle - खराब शब्द फिल्टर सक्षम/अक्षम गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "action",
                description: "Action to perform",
                type: 3,
                required: true,
                choices: [
                    { name: "add", value: "add" },
                    { name: "remove", value: "remove" },
                    { name: "list", value: "list" },
                    { name: "toggle", value: "toggle" }
                ]
            },
            {
                name: "words",
                description: "Word(s) to add or remove (comma-separated for multiple)",
                type: 3,
                required: false
            }
        ]
    },

    langs: {
        en: {
            noPermission: "You need **Administrator** or **Moderate Members** permission to use this command!",
            guildOnly: "This command can only be used in a server!",
            noWords: "Please provide word(s) to add or remove!",
            wordsAdded: "**%1** badword(s) added successfully!",
            addedWords: "Added",
            wordsAlreadyExist: "Some words already exist",
            wordsRemoved: "**%1** badword(s) removed successfully!",
            removedWords: "Removed",
            wordsNotFound: "Some words were not found",
            allWordsRemoved: "All badwords have been removed! (%1 words cleared)",
            noBadwords: "No badwords in the filter!",
            badwordsList: "Badword Filter List",
            totalWords: "Total Words",
            filterEnabled: "Badword filter has been **ENABLED**!",
            filterEnabledDesc: "Users will be warned and kicked after 3 warnings.",
            filterDisabled: "Badword filter has been **DISABLED**!",
            filterDisabledDesc: "Users can now use any words without warnings.",
            filterStatus: "Badword Filter Status",
            currentStatus: "Current Status",
            enabled: "ENABLED",
            disabled: "DISABLED",
            error: "An error occurred: %1",
            badwordDetected: "Warning!",
            badwordDetectedDesc: "Your message contained a prohibited word and has been deleted.",
            reason: "Reason",
            useOfBadword: "Use of badword",
            totalWarnings: "Total Warnings",
            kickWarning: "You will be kicked after 3 warnings!",
            badwordKick: "You have been kicked from **%1**",
            badwordKickDesc: "You used badwords 3 times!",
            lastViolation: "Last Violation"
        },
        ne: {
            noPermission: "तपाईंलाई यो आदेश प्रयोग गर्न **प्रशासक** वा **सदस्य संयमित** अनुमति चाहिन्छ!",
            guildOnly: "यो आदेश केवल सर्भरमा प्रयोग गर्न सकिन्छ!",
            noWords: "कृपया थप्न वा हटाउन शब्द(हरू) प्रदान गर्नुहोस्!",
            wordsAdded: "**%1** खराब शब्द(हरू) सफलतापूर्वक थपियो!",
            addedWords: "थपियो",
            wordsAlreadyExist: "केही शब्दहरू पहिले नै अवस्थित छन्",
            wordsRemoved: "**%1** खराब शब्द(हरू) सफलतापूर्वक हटाइयो!",
            removedWords: "हटाइयो",
            wordsNotFound: "केही शब्दहरू फेला परेनन्",
            allWordsRemoved: "सबै खराब शब्दहरू हटाइयो! (%1 शब्दहरू खाली गरियो)",
            noBadwords: "फिल्टरमा कुनै खराब शब्दहरू छैनन्!",
            badwordsList: "खराब शब्द फिल्टर सूची",
            totalWords: "कुल शब्दहरू",
            filterEnabled: "खराब शब्द फिल्टर **सक्षम** गरिएको छ!",
            filterEnabledDesc: "प्रयोगकर्ताहरूलाई चेतावनी दिइनेछ र ३ चेतावनी पछि किक गरिनेछ।",
            filterDisabled: "खराब शब्द फिल्टर **अक्षम** गरिएको छ!",
            filterDisabledDesc: "प्रयोगकर्ताहरूले अब चेतावनी बिना कुनै पनि शब्द प्रयोग गर्न सक्छन्।",
            filterStatus: "खराब शब्द फिल्टर स्थिति",
            currentStatus: "हालको स्थिति",
            enabled: "सक्षम",
            disabled: "अक्षम",
            error: "त्रुटि देखा पर्‍यो: %1",
            badwordDetected: "चेतावनी!",
            badwordDetectedDesc: "तपाईंको सन्देशमा निषेधित शब्द समावेश छ र मेटाइएको छ।",
            reason: "कारण",
            useOfBadword: "खराब शब्दको प्रयोग",
            totalWarnings: "कुल चेतावनीहरू",
            kickWarning: "तपाईंलाई ३ चेतावनी पछि किक गरिनेछ!",
            badwordKick: "तपाईंलाई **%1** बाट किक गरिएको छ",
            badwordKickDesc: "तपाईंले ३ पटक खराब शब्द प्रयोग गर्नुभयो!",
            lastViolation: "अन्तिम उल्लङ्घन"
        }
    },

    onStart: async ({ message, interaction, args, getLang, guildsData }) => {
        const isInteraction = !!interaction;
        const member = isInteraction ? interaction.member : message?.member;
        const guild = isInteraction ? interaction.guild : message?.guild;

        if (!guild) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`❌ ${getLang("guildOnly")}`);
            return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
        }

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`❌ ${getLang("guildOnly")}`);
            return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
        }

        if (!member.permissions.has(PermissionFlagsBits.Administrator) && !member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`❌ ${getLang("noPermission")}`);
            return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
        }

        const action = isInteraction ? interaction.options.getString('action') : (args[0] || '').toLowerCase();

        try {
            let guildData = await guildsData.get(guild.id);

            if (!guildData.data.badwords) {
                guildData.data.badwords = [];
            }

            if (typeof guildData.settings.badwordsEnabled === 'undefined') {
                guildData.settings.badwordsEnabled = false;
            }

            switch (action) {
                case 'add': {
                    const wordsInput = isInteraction ? interaction.options.getString('words') : args.slice(1).join(' ');
                    
                    if (!wordsInput) {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription(`❌ ${getLang("noWords")}`);
                        return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
                    }

                    const wordsToAdd = wordsInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    const addedWords = [];
                    const existingWords = [];
                    const currentBadwords = [...(guildData.data.badwords || [])];

                    for (const word of wordsToAdd) {
                        if (currentBadwords.includes(word)) {
                            existingWords.push(word);
                        } else {
                            currentBadwords.push(word);
                            addedWords.push(word);
                        }
                    }

                    if (addedWords.length > 0) {
                        await guildsData.set(guild.id, currentBadwords, 'data.badwords');
                    }

                    const embed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle(`✅ ${getLang("wordsAdded", addedWords.length)}`);

                    if (addedWords.length > 0) {
                        embed.addFields({ name: getLang("addedWords"), value: addedWords.join(', '), inline: false });
                    }
                    if (existingWords.length > 0) {
                        embed.addFields({ name: `⚠️ ${getLang("wordsAlreadyExist")}`, value: existingWords.join(', '), inline: false });
                    }

                    return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                }

                case 'remove': {
                    const wordsInput = isInteraction ? interaction.options.getString('words') : args.slice(1).join(' ');
                    
                    if (!wordsInput) {
                        const embed = new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription(`❌ ${getLang("noWords")}`);
                        return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
                    }

                    if (wordsInput.toLowerCase() === 'all') {
                        const count = guildData.data.badwords.length;
                        await guildsData.set(guild.id, [], 'data.badwords');
                        
                        const embed = new EmbedBuilder()
                            .setColor(0x00FF00)
                            .setDescription(`✅ ${getLang("allWordsRemoved", count)}`);
                        return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                    }

                    const wordsToRemove = wordsInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    const removedWords = [];
                    const notFoundWords = [];
                    let currentBadwords = [...(guildData.data.badwords || [])];

                    for (const word of wordsToRemove) {
                        const index = currentBadwords.indexOf(word);
                        if (index > -1) {
                            currentBadwords.splice(index, 1);
                            removedWords.push(word);
                        } else {
                            notFoundWords.push(word);
                        }
                    }

                    if (removedWords.length > 0) {
                        await guildsData.set(guild.id, currentBadwords, 'data.badwords');
                    }

                    const embed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle(`✅ ${getLang("wordsRemoved", removedWords.length)}`);

                    if (removedWords.length > 0) {
                        embed.addFields({ name: getLang("removedWords"), value: removedWords.join(', '), inline: false });
                    }
                    if (notFoundWords.length > 0) {
                        embed.addFields({ name: `⚠️ ${getLang("wordsNotFound")}`, value: notFoundWords.join(', '), inline: false });
                    }

                    return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                }

                case 'list': {
                    guildData = await guildsData.get(guild.id);
                    const badwords = guildData.data.badwords || [];
                    
                    if (badwords.length === 0) {
                        const embed = new EmbedBuilder()
                            .setColor(0x00FF00)
                            .setDescription(`✅ ${getLang("noBadwords")}`);
                        return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                    }

                    const badwordsList = badwords.join(', ');
                    const embed = new EmbedBuilder()
                        .setColor(0xFF6B6B)
                        .setTitle(`🚫 ${getLang("badwordsList")}`)
                        .setDescription(`\`\`\`${badwordsList}\`\`\``)
                        .addFields({ name: getLang("totalWords"), value: `${badwords.length}`, inline: true });
                    
                    return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                }

                case 'toggle': {
                    guildData = await guildsData.get(guild.id);
                    const newStatus = !guildData.settings.badwordsEnabled;
                    await guildsData.set(guild.id, newStatus, 'settings.badwordsEnabled');

                    const embed = new EmbedBuilder()
                        .setColor(newStatus ? 0x00FF00 : 0xFF0000)
                        .setTitle(newStatus ? `✅ ${getLang("filterEnabled")}` : `❌ ${getLang("filterDisabled")}`)
                        .setDescription(newStatus ? `⚠️ ${getLang("filterEnabledDesc")}` : `✅ ${getLang("filterDisabledDesc")}`);
                    
                    return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                }

                default: {
                    guildData = await guildsData.get(guild.id);
                    const status = guildData.settings.badwordsEnabled;
                    const embed = new EmbedBuilder()
                        .setColor(status ? 0x00FF00 : 0xFF0000)
                        .setTitle(`📊 ${getLang("filterStatus")}`)
                        .addFields({ 
                            name: getLang("currentStatus"), 
                            value: `**${status ? getLang("enabled") : getLang("disabled")}**`, 
                            inline: true 
                        });
                    return isInteraction ? interaction.reply({ embeds: [embed] }) : message.reply({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Badwords command error:', error);
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`❌ ${getLang("error", error.message)}`);
            return isInteraction ? interaction.reply({ embeds: [embed], flags: [4096] }) : message.reply({ embeds: [embed] });
        }
    },

    onChat: async ({ message, event, getLang, guildsData }) => {
        if (!message.guild || message.author.bot) return;
        
        if (message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
            return;
        }

        try {
            let guildData = await guildsData.get(message.guild.id);

            if (!guildData.settings.badwordsEnabled || !guildData.data.badwords || guildData.data.badwords.length === 0) {
                return;
            }

            const messageContent = message.content.toLowerCase();
            const detectedWord = guildData.data.badwords.find(badword => {
                const regex = new RegExp(`\\b${badword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                return regex.test(messageContent);
            });

            if (!detectedWord) return;

            await message.delete().catch(err => {
                console.error('Failed to delete message with badword:', err);
            });

            guildData = await guildsData.get(message.guild.id);

            if (!guildData.data.warnings) {
                guildData.data.warnings = {};
            }

            if (!guildData.data.warnings[message.author.id]) {
                guildData.data.warnings[message.author.id] = [];
            }

            guildData.data.warnings[message.author.id].push({
                reason: `${getLang("useOfBadword")}: ${detectedWord}`,
                warnedBy: message.guild.members.me.id,
                warnedAt: new Date().toISOString()
            });

            await guildsData.set(message.guild.id, guildData.data.warnings, 'data.warnings');

            guildData = await guildsData.get(message.guild.id);
            const warningCount = (guildData.data.warnings[message.author.id] || []).length;

            if (warningCount >= 3) {
                try {
                    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
                        console.error('Bot lacks kick permissions for badword auto-moderation');
                        return;
                    }

                    const dmEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle(`🔨 ${getLang("badwordKick", message.guild.name)}`)
                        .setDescription(getLang("badwordKickDesc"))
                        .addFields(
                            { name: getLang("lastViolation"), value: detectedWord, inline: true }
                        )
                        .setTimestamp();

                    await message.author.send({ embeds: [dmEmbed] }).catch(() => {});
                    
                    await message.member.kick(`Badword filter: 3 warnings - Last word: ${detectedWord}`);
                } catch (error) {
                    console.error('Failed to kick user for badwords:', error);
                }
            } else {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle(`⚠️ ${getLang("badwordDetected")}`)
                        .setDescription(getLang("badwordDetectedDesc"))
                        .addFields(
                            { name: getLang("reason"), value: getLang("useOfBadword"), inline: true },
                            { name: getLang("totalWarnings"), value: `${warningCount}/3`, inline: true }
                        )
                        .setFooter({ text: `⚠️ ${getLang("kickWarning")}` })
                        .setTimestamp();

                    await message.author.send({ embeds: [dmEmbed] }).catch(() => {});
                } catch (error) {
                    console.error('Failed to send DM to user:', error);
                }

                const channelEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setDescription(`<@${message.author.id}> ⚠️ ${getLang("badwordDetected")}\n${getLang("badwordDetectedDesc")}\n\n📊 ${getLang("totalWarnings")}: ${warningCount}/3\n⚠️ ${getLang("kickWarning")}`);

                const warningMessage = await message.channel.send({ embeds: [channelEmbed] });
                
                setTimeout(() => {
                    warningMessage.delete().catch(() => {});
                }, 10000);
            }

        } catch (error) {
            console.error('Badwords onChat error:', error);
        }
    }
};
