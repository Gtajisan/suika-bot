const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const pathData = path.join(__dirname, 'assets', 'hubble', 'nasa.json');

let hubbleData;

module.exports = {
    config: {
        name: "hubble",
        version: "1.0",
        author: "Samir",
        countDown: 5,
        role: 0,
        description: {
            en: "View Hubble telescope images by date",
            ne: "मितिअनुसार Hubble टेलिस्कोप छविहरू हेर्नुहोस्"
        },
        category: "fun",
        guide: {
            en: "{prefix}hubble <date (mm-dd)>\n"
                + "Example: {prefix}hubble 03-15\n"
                + "Get a Hubble space telescope image taken on that date",
            ne: "{prefix}hubble <मिति (mm-dd)>\n"
                + "उदाहरण: {prefix}hubble 03-15\n"
                + "त्यो मितिमा लिइएको Hubble अन्तरिक्ष टेलिस्कोप छवि प्राप्त गर्नुहोस्"
        },
        slash: true,
        options: [
            {
                name: "date",
                description: "Date in mm-dd format (e.g., 03-15)",
                type: 3,
                required: true
            }
        ]
    },

    langs: {
        en: {
            invalidDate: "❌ The date you entered is invalid, please enter in the mm-dd format",
            noImage: "❌ No images were found on this day",
            error: "❌ An error occurred: %1"
        },
        ne: {
            invalidDate: "❌ तपाईंले प्रविष्ट गर्नुभएको मिति अमान्य छ, कृपया mm-dd ढाँचामा प्रविष्ट गर्नुहोस्",
            noImage: "❌ यो दिनमा कुनै छविहरू फेला परेन",
            error: "❌ त्रुटि देखा पर्यो: %1"
        }
    },

    onLoad: async function () {
        try {
            const assetDir = path.join(__dirname, 'assets', 'hubble');
            if (!fs.existsSync(assetDir)) {
                fs.mkdirSync(assetDir, { recursive: true });
            }

            if (!fs.existsSync(pathData)) {
                const res = await axios.get('https://raw.githubusercontent.com/notsopreety/Rento-Bot/main/scripts/commands/assets/hubble/nasa.json');
                fs.writeFileSync(pathData, JSON.stringify(res.data, null, 2));
                hubbleData = res.data;
            } else {
                hubbleData = JSON.parse(fs.readFileSync(pathData, 'utf-8'));
            }
            
            if (!hubbleData || !Array.isArray(hubbleData)) {
                hubbleData = [];
            }
        } catch (error) {
            console.error('[HUBBLE] Error loading data:', error.message);
            hubbleData = [];
        }
    },

    onStart: async ({ message, interaction, args, getLang }) => {
        try {
            // Defer the interaction immediately to prevent timeout
            if (interaction && !interaction.deferred && !interaction.replied) {
                await interaction.deferReply();
            }

            // Ensure hubbleData is loaded
            if (!hubbleData || !Array.isArray(hubbleData) || hubbleData.length === 0) {
                try {
                    if (fs.existsSync(pathData)) {
                        hubbleData = JSON.parse(fs.readFileSync(pathData, 'utf-8'));
                    } else {
                        const res = await axios.get('https://raw.githubusercontent.com/notsopreety/Rento-Bot/main/scripts/commands/assets/hubble/nasa.json');
                        hubbleData = res.data;
                        fs.writeFileSync(pathData, JSON.stringify(res.data, null, 2));
                    }
                } catch (err) {
                    const errorMsg = "Failed to load Hubble data. Please try again later.";
                    return message ? ctx.reply(errorMsg) : interaction.editReply(errorMsg);
                }
            }

            let dateInput;

            if (interaction) {
                dateInput = interaction.options.getString('date');
            } else if (message) {
                dateInput = args[0] || "";
            }

            const dateText = checkValidDate(dateInput || "");
            if (!dateInput || !dateText) {
                const response = getLang('invalidDate');
                return message ? ctx.reply(response) : interaction.editReply(response);
            }

            const data = hubbleData.find(e => e.date.startsWith(dateText));
            if (!data) {
                const response = getLang('noImage');
                return message ? ctx.reply(response) : interaction.editReply(response);
            }

            const { image, name, caption, url } = data;
            const imageUrl = 'https://imagine.gsfc.nasa.gov/hst_bday/images/' + image;

            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const attachment = new AttachmentBuilder(Buffer.from(imageResponse.data), {
                name: image
            });

            const embed = {}
                // Title: `🔭 ${name}`
                // Description: caption
                // Fields: 
            /*
                    { name: '📅 Date', value: dateText, inline: true },
                    { name: '🔗 Source', value: `[NASA Hubble](${url})`, inline: true }
                )
                // Image: `attachment://${image}`*/ //(0x1E3A8A
                .setTimestamp();

            if (message) {
                return ctx.reply({
                    embeds: [embed],
                    files: [attachment]
                });
            } else {
                return interaction.editReply({
                    embeds: [embed],
                    files: [attachment]
                });
            }
        } catch (error) {
            const errorMsg = getLang('error', error.message);
            if (message) {
                return ctx.reply(errorMsg);
            } else {
                if (interaction.deferred) {
                    return interaction.editReply(errorMsg);
                } else {
                    return ctx.reply(errorMsg);
                }
            }
        }
    }
};

const monthText = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function checkValidDate(date) {
    const dateArr = date.split(/[-/]/);
    if (dateArr.length !== 2)
        return false;
    let day;
    let month;
    if (parseInt(dateArr[0]) < 13) {
        month = parseInt(dateArr[0]);
        day = parseInt(dateArr[1]);
    } else {
        day = parseInt(dateArr[0]);
        month = parseInt(dateArr[1]);
    }
    if (month < 1 || month > 12)
        return false;
    if (day < 1 || day > 31)
        return false;
    if (month === 2 && day > 29)
        return false;
    if ([4, 6, 9, 11].includes(month) && day > 30)
        return false;
    return monthText[month - 1] + ' ' + day;
}
