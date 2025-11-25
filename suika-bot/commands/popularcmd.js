
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');
const { createCanvas } = require('canvas');

module.exports = {
    config: {
        name: "popularcmd",
        aliases: ["topcmd", "cmdstats"],
        version: "2.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "Display a chart of the most used commands",
            ne: "सबैभन्दा धेरै प्रयोग गरिएका आदेशहरूको चार्ट प्रदर्शन गर्नुहोस्"
        },
        category: "info",
        guide: {
            en: "{prefix}popularcmd [limit] [type]\nTypes: bar, pie (default: bar)\nExample: {prefix}popularcmd 10 pie",
            ne: "{prefix}popularcmd [सीमा] [प्रकार]\nप्रकारहरू: bar, pie (पूर्वनिर्धारित: bar)\nउदाहरण: {prefix}popularcmd 10 pie"
        },
        slash: true,
        options: [
            {
                name: "limit",
                description: "Number of top commands to display (default: 10)",
                type: 4,
                required: false
            },
            {
                name: "type",
                description: "Chart type (bar or pie)",
                type: 3,
                required: false,
                choices: [
                    { name: "Bar Chart", value: "bar" },
                    { name: "Pie Chart", value: "pie" }
                ]
            }
        ]
    },

    langs: {
        en: {
            noStats: "❌ No command statistics available yet!",
            generating: "🎨 Generating command statistics chart...",
            title: "📊 Most Popular Commands",
            totalExecutions: "Total Command Executions",
            viewAll: "📈 View detailed statistics"
        },
        ne: {
            noStats: "❌ अहिलेसम्म कुनै आदेश तथ्याङ्क उपलब्ध छैन!",
            generating: "🎨 आदेश तथ्याङ्क चार्ट उत्पन्न गर्दै...",
            title: "📊 सबैभन्दा लोकप्रिय आदेशहरू",
            totalExecutions: "कुल आदेश कार्यान्वयन",
            viewAll: "📈 विस्तृत तथ्याङ्क हेर्नुहोस्"
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        try {
            // Defer reply for slash commands
            if (interaction) {
                await interaction.deferReply();
            } else if (message) {
                await message.channel.send(getLang("generating"));
            }

            // Get command statistics
            const allCommandStats = global.db.allCommandStats || [];
            
            // Filter commands with at least 5 uses
            const filteredStats = allCommandStats.filter(stat => stat.executionCount >= 5);
            
            if (filteredStats.length === 0) {
                const response = getLang("noStats");
                return interaction ? interaction.editReply(response) : message.reply(response);
            }

            // Get limit and type from args
            let limit = 10;
            let chartType = "bar";
            
            if (interaction) {
                limit = interaction.options?.getInteger('limit') || 10;
                chartType = interaction.options?.getString('type') || "bar";
            } else if (args) {
                limit = parseInt(args[0]) || 10;
                chartType = (args[1] || "bar").toLowerCase();
            }

            const displayLimit = Math.min(Math.max(limit, 5), 20); // Between 5 and 20

            // Sort commands by execution count
            const sortedStats = filteredStats
                .sort((a, b) => b.executionCount - a.executionCount)
                .slice(0, displayLimit);

            // Calculate total executions (only for filtered stats)
            const totalExecutions = sortedStats.reduce((sum, stat) => sum + stat.executionCount, 0);

            // Create canvas
            const width = 1200;
            const height = 600;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Background
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(getLang("title"), width / 2, 50);

            // Subtitle
            ctx.font = '18px Arial';
            ctx.fillStyle = '#a8a8a8';
            ctx.fillText(`${getLang("totalExecutions")}: ${totalExecutions.toLocaleString()} (${sortedStats.length} commands with 5+ uses)`, width / 2, 85);

            if (chartType === "pie") {
                // Draw Pie Chart
                const centerX = width / 2;
                const centerY = height / 2 + 20;
                const radius = 180;
                
                const colors = [
                    '#ffd700', '#c0c0c0', '#cd7f32', '#00d4ff', '#ff6b6b',
                    '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9',
                    '#a29bfe', '#fd79a8', '#fdcb6e', '#6c5ce7', '#00b894',
                    '#e17055', '#0984e3', '#b2bec3', '#fab1a0', '#ff7675'
                ];

                let currentAngle = -Math.PI / 2; // Start at top

                sortedStats.forEach((stat, index) => {
                    const sliceAngle = (stat.executionCount / totalExecutions) * 2 * Math.PI;
                    
                    // Draw slice
                    ctx.fillStyle = colors[index % colors.length];
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                    ctx.closePath();
                    ctx.fill();

                    // Draw slice border
                    ctx.strokeStyle = '#1a1a2e';
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Calculate percentage
                    const percentage = ((stat.executionCount / totalExecutions) * 100).toFixed(1);

                    // Draw percentage and count on slice (for larger slices)
                    if (parseFloat(percentage) > 5) {
                        const labelAngle = currentAngle + sliceAngle / 2;
                        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 14px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(`${percentage}%`, labelX, labelY);
                        ctx.font = '12px Arial';
                        ctx.fillText(stat.executionCount.toLocaleString(), labelX, labelY + 16);
                    }

                    currentAngle += sliceAngle;
                });

                // Draw legend
                const legendX = 50;
                const legendY = height / 2 - (sortedStats.length * 25) / 2;
                const legendItemHeight = 25;

                sortedStats.forEach((stat, index) => {
                    const y = legendY + (index * legendItemHeight);
                    
                    // Color box
                    ctx.fillStyle = colors[index % colors.length];
                    ctx.fillRect(legendX, y, 20, 20);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(legendX, y, 20, 20);

                    // Command name and stats
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'left';
                    const cmdName = stat.commandName.length > 12 
                        ? stat.commandName.substring(0, 10) + '..' 
                        : stat.commandName;
                    const percentage = ((stat.executionCount / totalExecutions) * 100).toFixed(1);
                    ctx.fillText(`${cmdName}: ${stat.executionCount} (${percentage}%)`, legendX + 30, y + 15);
                });

            } else {
                // Draw Bar Chart
                const chartX = 100;
                const chartY = 120;
                const chartWidth = width - 200;
                const chartHeight = height - 180;

                // Calculate bar dimensions
                const barWidth = chartWidth / sortedStats.length;
                const maxCount = Math.max(...sortedStats.map(d => d.executionCount));
                const scale = chartHeight / maxCount;

                // Draw bars
                sortedStats.forEach((stat, index) => {
                    const barHeight = stat.executionCount * scale;
                    const x = chartX + (index * barWidth);
                    const y = chartY + chartHeight - barHeight;

                    // Bar gradient
                    const barGradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                    
                    // Color based on rank
                    if (index === 0) {
                        barGradient.addColorStop(0, '#ffd700');
                        barGradient.addColorStop(1, '#ffaa00');
                    } else if (index === 1) {
                        barGradient.addColorStop(0, '#c0c0c0');
                        barGradient.addColorStop(1, '#a0a0a0');
                    } else if (index === 2) {
                        barGradient.addColorStop(0, '#cd7f32');
                        barGradient.addColorStop(1, '#b8722d');
                    } else {
                        barGradient.addColorStop(0, '#00d4ff');
                        barGradient.addColorStop(1, '#0099cc');
                    }

                    ctx.fillStyle = barGradient;
                    
                    // Draw rounded bar
                    const barPadding = 10;
                    const actualBarWidth = barWidth - (barPadding * 2);
                    const radius = 5;
                    
                    ctx.beginPath();
                    ctx.moveTo(x + barPadding + radius, y + barHeight);
                    ctx.lineTo(x + barPadding, y + barHeight);
                    ctx.lineTo(x + barPadding, y + radius);
                    ctx.arcTo(x + barPadding, y, x + barPadding + radius, y, radius);
                    ctx.lineTo(x + barPadding + actualBarWidth - radius, y);
                    ctx.arcTo(x + barPadding + actualBarWidth, y, x + barPadding + actualBarWidth, y + radius, radius);
                    ctx.lineTo(x + barPadding + actualBarWidth, y + barHeight);
                    ctx.closePath();
                    ctx.fill();

                    // Draw count on top of bar
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    const countText = stat.executionCount.toLocaleString();
                    ctx.fillText(countText, x + barWidth / 2, y - 10);

                    // Draw command name below chart
                    ctx.save();
                    ctx.translate(x + barWidth / 2, chartY + chartHeight + 20);
                    ctx.rotate(-Math.PI / 4);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'right';
                    const cmdName = stat.commandName.length > 15 
                        ? stat.commandName.substring(0, 12) + '...' 
                        : stat.commandName;
                    ctx.fillText(cmdName, 0, 0);
                    ctx.restore();

                    // Draw percentage
                    const percentage = ((stat.executionCount / totalExecutions) * 100).toFixed(1);
                    ctx.fillStyle = '#a8a8a8';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${percentage}%`, x + barWidth / 2, chartY + chartHeight + 55);
                });

                // Draw axis lines
                ctx.strokeStyle = '#444444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(chartX - 10, chartY + chartHeight);
                ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
                ctx.stroke();
            }

            // Create attachment
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { 
                name: 'popular-commands.png' 
            });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(getLang("title"))
                .setDescription(
                    `${getLang("totalExecutions")}: **${totalExecutions.toLocaleString()}**\n` +
                    `Chart Type: **${chartType === 'pie' ? 'Pie Chart' : 'Bar Chart'}**\n` +
                    `Commands shown: **${sortedStats.length}** (with 5+ uses)\n\n` +
                    `[${getLang("viewAll")}](https://rento.samirb.com.np/commands?sort=usage)`
                )
                .setColor(chartType === 'pie' ? 0xFF6B6B : 0x00AE86)
                .setImage('attachment://popular-commands.png')
                .setFooter({ text: `Use ${chartType === 'pie' ? 'bar' : 'pie'} chart with: popularcmd ${displayLimit} ${chartType === 'pie' ? 'bar' : 'pie'}` })
                .setTimestamp();

            return interaction 
                ? interaction.editReply({ embeds: [embed], files: [attachment] })
                : message.reply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error('Error generating popular commands chart:', error);
            const errorMsg = "❌ An error occurred while generating the chart.";
            return interaction 
                ? interaction.editReply(errorMsg)
                : message.reply(errorMsg);
        }
    }
};
