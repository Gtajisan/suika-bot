
const axios = require('axios');
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "gitclone",
        aliases: ["ghclone", "gitdownload", "ghzip"],
        version: "1.0",
        author: "Samir",
        countDown: 15,
        role: 0,
        description: {
            en: "Download GitHub repository as a ZIP file",
            ne: "GitHub रिपोजिटरी ZIP फाइलको रूपमा डाउनलोड गर्नुहोस्"
        },
        category: "utility",
        guide: {
            en: "{prefix}gitclone <github repo url or username/repo>\n\nExamples:\n• {prefix}gitclone https://github.com/user/repo\n• {prefix}gitclone user/repo\n• {prefix}gitclone https://github.com/user/repo/tree/branch-name",
            ne: "{prefix}gitclone <github रिपो url वा username/repo>\n\nउदाहरणहरू:\n• {prefix}gitclone https://github.com/user/repo\n• {prefix}gitclone user/repo"
        },
        slash: true,
        options: [
            {
                name: "repository",
                description: "GitHub repository URL or username/repo format",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            noInput: "❌ Please provide a GitHub repository URL or username/repo format!",
            invalidUrl: "❌ Invalid GitHub repository URL or format!\n\n**Valid formats:**\n• `https://github.com/username/repo`\n• `username/repo`\n• `https://github.com/username/repo/tree/branch`",
            downloading: "⏳ Downloading repository...",
            processing: "⚙️ Processing repository data...",
            repoNotFound: "❌ Repository not found or is private!\n\nPlease check:\n• Repository exists\n• Repository is public\n• URL is correct",
            tooLarge: "❌ Repository is too large to download!\n\n**Size:** %1 MB\n**Limit:** 25 MB\n\nPlease download directly from GitHub.",
            error: "❌ An error occurred while downloading the repository:\n\n```\n%1\n```",
            success: "✅ Repository downloaded successfully!",
            apiError: "❌ GitHub API error: %1",
            downloadError: "❌ Failed to download repository ZIP file.",
            fileError: "❌ Failed to process the downloaded file.",
            rateLimit: "❌ GitHub API rate limit exceeded!\n\nPlease try again later.",
            networkError: "❌ Network error occurred. Please check your connection and try again."
        },
        ne: {
            noInput: "❌ कृपया GitHub रिपोजिटरी URL वा username/repo ढाँचा प्रदान गर्नुहोस्!",
            invalidUrl: "❌ अमान्य GitHub रिपोजिटरी URL वा ढाँचा!",
            downloading: "⏳ रिपोजिटरी डाउनलोड गर्दै...",
            processing: "⚙️ रिपोजिटरी डेटा प्रशोधन गर्दै...",
            repoNotFound: "❌ रिपोजिटरी फेला परेन वा निजी छ!",
            tooLarge: "❌ रिपोजिटरी डाउनलोड गर्न धेरै ठूलो छ!",
            error: "❌ रिपोजिटरी डाउनलोड गर्दा त्रुटि देखा पर्यो:\n\n```\n%1\n```",
            success: "✅ रिपोजिटरी सफलतापूर्वक डाउनलोड गरियो!",
            apiError: "❌ GitHub API त्रुटि: %1",
            downloadError: "❌ रिपोजिटरी ZIP फाइल डाउनलोड गर्न असफल।",
            fileError: "❌ डाउनलोड गरिएको फाइल प्रशोधन गर्न असफल।",
            rateLimit: "❌ GitHub API दर सीमा नाघेको छ!",
            networkError: "❌ नेटवर्क त्रुटि देखा पर्यो। कृपया आफ्नो जडान जाँच गर्नुहोस्।"
        }
    },

    onStart: async function ({ message, interaction, args, getLang }) {
        const isSlash = !!interaction;
        const user = isSlash ? interaction.user : message.author;

        let repoInput = '';

        if (isSlash) {
            repoInput = interaction.options.getString('repository');
        } else {
            if (args.length === 0) {
                return message.reply(getLang("noInput"));
            }
            repoInput = args.join(' ');
        }

        if (!repoInput) {
            const msg = getLang("noInput");
            return isSlash ? interaction.reply({ content: msg, ephemeral: true }) : message.reply(msg);
        }

        const loadingEmbed = new EmbedBuilder()
            .setDescription(getLang("downloading"))
            .setColor(0xFFA500)
            .setFooter({ text: user.username, iconURL: user.displayAvatarURL() })
            .setTimestamp();

        let sentMessage;
        if (isSlash) {
            await interaction.reply({ embeds: [loadingEmbed] });
            sentMessage = { interaction, isSlash: true };
        } else {
            sentMessage = await message.reply({ embeds: [loadingEmbed] });
            sentMessage.isSlash = false;
        }

        try {
            const repoInfo = this.parseGitHubUrl(repoInput);
            
            if (!repoInfo) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(getLang("invalidUrl"))
                    .setColor(0xED4245)
                    .setFooter({ text: user.username, iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                if (sentMessage.isSlash) {
                    return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    return await sentMessage.edit({ embeds: [errorEmbed] });
                }
            }

            const processingEmbed = new EmbedBuilder()
                .setDescription(getLang("processing"))
                .setColor(0xFFA500)
                .setFooter({ text: user.username, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            if (sentMessage.isSlash) {
                await sentMessage.interaction.editReply({ embeds: [processingEmbed] });
            } else {
                await sentMessage.edit({ embeds: [processingEmbed] });
            }

            const repoData = await this.getRepositoryInfo(repoInfo.owner, repoInfo.repo);

            if (!repoData) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(getLang("repoNotFound"))
                    .setColor(0xED4245)
                    .setFooter({ text: user.username, iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                if (sentMessage.isSlash) {
                    return await sentMessage.interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    return await sentMessage.edit({ embeds: [errorEmbed] });
                }
            }

            const sizeInMB = (repoData.size / 1024).toFixed(2);
            if (repoData.size > 25000) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("📦 Repository Too Large")
                    .setDescription(getLang("tooLarge", sizeInMB))
                    .setColor(0xED4245)
                    .addFields(
                        { name: '📊 Repository', value: `\`${repoInfo.owner}/${repoInfo.repo}\``, inline: true },
                        { name: '🔗 Branch', value: `\`${repoInfo.branch}\``, inline: true }
                    )
                    .setFooter({ text: user.username, iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Download on GitHub')
                        .setURL(`https://github.com/${repoInfo.owner}/${repoInfo.repo}/archive/refs/heads/${repoInfo.branch}.zip`)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('📥')
                );

                if (sentMessage.isSlash) {
                    return await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [row] });
                } else {
                    return await sentMessage.edit({ embeds: [errorEmbed], components: [row] });
                }
            }

            const zipBuffer = await this.downloadRepository(repoInfo.owner, repoInfo.repo, repoInfo.branch);

            const fileName = `${repoInfo.owner}-${repoInfo.repo}-${repoInfo.branch}.zip`;
            const tempPath = path.join(__dirname, 'tmp', fileName);
            
            await fs.ensureDir(path.join(__dirname, 'tmp'));
            await fs.writeFile(tempPath, zipBuffer);

            const stats = await fs.stat(tempPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            const attachment = new AttachmentBuilder(tempPath, { name: fileName });

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Repository Downloaded Successfully")
                .setDescription(`**${repoData.full_name}**\n${repoData.description || 'No description provided'}`)
                .setColor(0x00FF00)
                .setThumbnail(repoData.owner.avatar_url)
                .addFields(
                    { name: '👤 Owner', value: `[${repoInfo.owner}](https://github.com/${repoInfo.owner})`, inline: true },
                    { name: '📦 Repository', value: `[${repoInfo.repo}](${repoData.html_url})`, inline: true },
                    { name: '🔗 Branch', value: `\`${repoInfo.branch}\``, inline: true },
                    { name: '⭐ Stars', value: repoData.stargazers_count.toLocaleString(), inline: true },
                    { name: '🍴 Forks', value: repoData.forks_count.toLocaleString(), inline: true },
                    { name: '👁️ Watchers', value: repoData.watchers_count.toLocaleString(), inline: true },
                    { name: '📊 Size', value: `${sizeInMB} KB`, inline: true },
                    { name: '📄 ZIP Size', value: `${fileSizeMB} MB`, inline: true },
                    { name: '📅 Last Updated', value: new Date(repoData.updated_at).toLocaleDateString(), inline: true }
                )
                .setFooter({ text: `Requested by ${user.username} | Language: ${repoData.language || 'N/A'}`, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            if (repoData.homepage) {
                successEmbed.addFields({ name: '🌐 Homepage', value: `[Visit](${repoData.homepage})`, inline: true });
            }

            if (repoData.license) {
                successEmbed.addFields({ name: '📜 License', value: repoData.license.name, inline: true });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('View Repository')
                    .setURL(repoData.html_url)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('🔗'),
                new ButtonBuilder()
                    .setLabel('Issues')
                    .setURL(`${repoData.html_url}/issues`)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('🐛')
            );

            if (sentMessage.isSlash) {
                await sentMessage.interaction.editReply({ embeds: [successEmbed], files: [attachment], components: [row] });
            } else {
                await sentMessage.edit({ embeds: [successEmbed], files: [attachment], components: [row] });
            }

            setTimeout(async () => {
                try {
                    await fs.remove(tempPath);
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }
            }, 5000);

        } catch (error) {
            console.error('GitClone error:', error);

            let errorMessage = error.message || 'Unknown error';
            let errorColor = 0xED4245;
            let errorTitle = "❌ Error";

            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = getLang("repoNotFound");
                    errorTitle = "🔍 Repository Not Found";
                } else if (error.response.status === 403) {
                    errorMessage = getLang("rateLimit");
                    errorTitle = "⏱️ Rate Limited";
                } else if (error.response.status === 401) {
                    errorMessage = "Authentication required. This repository may be private.";
                    errorTitle = "🔒 Authentication Error";
                } else {
                    errorMessage = getLang("apiError", error.response.data?.message || error.response.statusText);
                }
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                errorMessage = getLang("networkError");
                errorTitle = "🌐 Network Error";
            }

            const errorEmbed = new EmbedBuilder()
                .setTitle(errorTitle)
                .setDescription(errorMessage)
                .setColor(errorColor)
                .setFooter({ text: user.username, iconURL: user.displayAvatarURL() })
                .setTimestamp();

            if (sentMessage.isSlash) {
                if (sentMessage.interaction.replied || sentMessage.interaction.deferred) {
                    await sentMessage.interaction.editReply({ embeds: [errorEmbed], components: [] });
                } else {
                    await sentMessage.interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            } else {
                await sentMessage.edit({ embeds: [errorEmbed], components: [] });
            }
        }
    },

    parseGitHubUrl(input) {
        input = input.trim();

        const patterns = [
            /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
            /^([^\/]+)\/([^\/]+)$/
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) {
                const owner = match[1];
                const repo = match[2].replace(/\.git$/, '');
                const branch = match[3] || 'main';

                return { owner, repo, branch };
            }
        }

        return null;
    },

    async getRepositoryInfo(owner, repo) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Discord-Bot-GitClone/1.0'
                },
                timeout: 10000
            });

            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async downloadRepository(owner, repo, branch) {
        try {
            const branches = ['main', 'master', branch];
            let zipBuffer = null;
            let lastError = null;

            for (const branchName of branches) {
                try {
                    const response = await axios.get(
                        `https://github.com/${owner}/${repo}/archive/refs/heads/${branchName}.zip`,
                        {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Discord-Bot-GitClone/1.0'
                            },
                            timeout: 60000,
                            maxContentLength: 26214400
                        }
                    );

                    zipBuffer = Buffer.from(response.data);
                    break;
                } catch (err) {
                    lastError = err;
                    continue;
                }
            }

            if (!zipBuffer) {
                throw lastError || new Error('Failed to download repository from any branch');
            }

            return zipBuffer;
        } catch (error) {
            if (error.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED') {
                throw new Error('Repository file is too large (>25MB)');
            }
            throw error;
        }
    }
};
