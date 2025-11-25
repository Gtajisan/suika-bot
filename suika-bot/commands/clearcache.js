
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "clearcache",
        aliases: ["cc", "clearimagecache"],
        version: "1.0",
        author: "Samir",
        countDown: 10,
        role: 2,
        slash: true,
        description: {
            en: "Clear the rank card image cache to free up space",
            ne: "स्पेस खाली गर्न रैंक कार्ड छवि क्यास खाली गर्नुहोस्"
        },
        category: "admin",
        guide: {
            en: "{prefix}clearcache - Clear all cached rank card images",
            ne: "{prefix}clearcache - सबै क्यास गरिएको रैंक कार्ड छविहरू खाली गर्नुहोस्"
        }
    },

    langs: {
        en: {
            analyzing: "🔍 Analyzing cache directory...",
            scanning: "📊 Found **%1** files | Total size: **%2 MB**",
            deleting: "🗑️ Deleting cache files... [%1/%2]",
            success: "✅ **Cache Cleared Successfully!**\n\n📁 Files deleted: **%1**\n💾 Space freed: **%2 MB**\n⏱️ Time taken: **%3s**",
            error: "❌ Failed to clear cache: %1",
            empty: "ℹ️ Cache is already empty - nothing to clear!"
        },
        ne: {
            analyzing: "🔍 क्यास डाइरेक्टरी विश्लेषण गर्दै...",
            scanning: "📊 **%1** फाइलहरू भेटियो | कुल आकार: **%2 MB**",
            deleting: "🗑️ क्यास फाइलहरू मेटाउँदै... [%1/%2]",
            success: "✅ **क्यास सफलतापूर्वक खाली भयो!**\n\n📁 मेटाइएका फाइलहरू: **%1**\n💾 खाली भएको स्थान: **%2 MB**\n⏱️ लिइएको समय: **%3s**",
            error: "❌ क्यास खाली गर्न असफल भयो: %1",
            empty: "ℹ️ क्यास पहिले नै खाली छ - खाली गर्न केही छैन!"
        }
    },

    onStart: async ({ message, interaction, getLang }) => {
        const startTime = Date.now();
        
        try {
            const isSlash = !!interaction;
            let sentMessage;

            // Initial reply
            if (isSlash) {
                await interaction.reply(getLang("analyzing"));
                sentMessage = await interaction.fetchReply();
            } else {
                sentMessage = await message.reply(getLang("analyzing"));
            }

            const CACHE_DIR = path.join(__dirname, 'tmp');
            
            // Check if cache directory exists
            if (!fs.existsSync(CACHE_DIR)) {
                const emptyMsg = getLang("empty");
                return isSlash ? interaction.editReply(emptyMsg) : sentMessage.edit(emptyMsg);
            }

            const files = fs.readdirSync(CACHE_DIR);
            const filesToDelete = files.filter(file => file !== '.gitkeep');
            
            if (filesToDelete.length === 0) {
                const emptyMsg = getLang("empty");
                return isSlash ? interaction.editReply(emptyMsg) : sentMessage.edit(emptyMsg);
            }

            // Calculate total size
            let totalSize = 0;
            for (const file of filesToDelete) {
                const filePath = path.join(CACHE_DIR, file);
                try {
                    const stats = fs.statSync(filePath);
                    totalSize += stats.size;
                } catch (err) {
                    console.error(`Failed to stat ${file}:`, err);
                }
            }

            const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
            
            // Update message with scan results
            if (isSlash) {
                await interaction.editReply(getLang("scanning", filesToDelete.length, sizeMB));
            } else {
                await sentMessage.edit(getLang("scanning", filesToDelete.length, sizeMB));
            }
            
            // Wait a moment for visual effect
            await new Promise(resolve => setTimeout(resolve, 800));

            // Delete files with progress updates
            let deletedCount = 0;
            for (let i = 0; i < filesToDelete.length; i++) {
                const file = filesToDelete[i];
                const filePath = path.join(CACHE_DIR, file);
                
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    
                    // Update progress every 5 files or on last file
                    if ((i + 1) % 5 === 0 || i === filesToDelete.length - 1) {
                        if (isSlash) {
                            await interaction.editReply(getLang("deleting", i + 1, filesToDelete.length));
                        } else {
                            await sentMessage.edit(getLang("deleting", i + 1, filesToDelete.length));
                        }
                    }
                } catch (err) {
                    console.error(`Failed to delete ${file}:`, err);
                }
            }

            // Calculate time taken
            const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

            // Final success message
            if (isSlash) {
                await interaction.editReply(getLang("success", deletedCount, sizeMB, timeTaken));
            } else {
                await sentMessage.edit(getLang("success", deletedCount, sizeMB, timeTaken));
            }

        } catch (error) {
            console.error('Clear cache error:', error);
            const errorMsg = getLang("error", error.message);
            
            if (interaction) {
                return interaction.replied || interaction.deferred
                    ? interaction.editReply(errorMsg)
                    : interaction.reply(errorMsg);
            } else {
                return message.reply(errorMsg);
            }
        }
    }
};
