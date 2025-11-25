
const axios = require('axios');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { AttachmentBuilder } = require('../adapters/discord-to-telegram.js');

const cacheDirectory = path.join(__dirname, 'tmp');

module.exports = {
  config: {
    name: "nc",
    aliases: ["nepcalender", "nepalicalender", "calender"],
    version: "1.0",
    author: "Samir",
    role: 0,
    countDown: 5,
    description: {
      en: "Display Nepali calendar",
      ne: "नेपाली पात्रो देखाउनुहोस्"
    },
    category: "utility",
    guide: {
      en: "{pn} - Display the current Nepali calendar",
      ne: "{pn} - हालको नेपाली पात्रो देखाउनुहोस्"
    },
    slash: true
  },

  onStart: async function ({ message, interaction }) {
    const isSlash = !!interaction;

    if (isSlash) {
      await interaction.deferReply();
    }

    try {
      const response = await axios.get('https://calendar.bloggernepal.com/api/today');
      const data = response.data;

      const canvas = createCanvas(540, 460);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#f2f2f2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawCalendar(ctx, canvas, data);

      const imageBuffer = canvas.toBuffer();
      const imagePath = path.join(cacheDirectory, 'nepali_calendar.png');
      await fs.promises.mkdir(cacheDirectory, { recursive: true });
      await fs.promises.writeFile(imagePath, imageBuffer);

      const attachment = new AttachmentBuilder(imagePath, { name: 'nepali_calendar.png' });

      if (isSlash) {
        await interaction.editReply({ files: [attachment] });
      } else {
        await ctx.reply({ files: [attachment] });
      }

      // Clean up
      setTimeout(() => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }, 10000);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      const errorMsg = 'Sorry, I couldn\'t fetch the Nepali calendar. Please try again later.';
      
      if (isSlash) {
        await interaction.editReply(errorMsg);
      } else {
        await ctx.reply(errorMsg);
      }
    }
  }
};

function drawCalendar(ctx, canvas, data) {
  ctx.font = '20px Arial';

  const cellWidth = 65;
  const cellHeight = 65;
  const startX = 40;
  const startY = 55;
  const nameYearY = 20;

  ctx.fillStyle = 'lime';
  ctx.shadowColor = 'black';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  const nameYearText = `${nepaliToRoman(data.res.name)} / ${nepaliToArabic(data.res.year)}`;
  ctx.fillText(nameYearText, startX, nameYearY);

  const engMonthYearText = `${data.res.eng2} / ${data.res.engYear}`;
  ctx.fillText(engMonthYearText, startX + 325, nameYearY);

  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < days.length; i++) {
    ctx.fillText(days[i], startX + (i * cellWidth) + (cellWidth / 2), startY - 10);
  }

  const totalDays = data.res.days.length;
  let row = 0;
  let col = 0;
  const drawnDates = [];
  const preDates = [];

  for (let i = 0; i < totalDays; i++) {
    const day = data.res.days[i];
    const x = startX + (col * cellWidth);
    const y = startY + (row * cellHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cellWidth, cellHeight);

    const isPreTag = day.tag === "pre";

    if (isPreTag) {
      preDates.push(day.bs);
      ctx.globalAlpha = 0.5;
    } else if (preDates.includes(day.bs)) {
      ctx.globalAlpha = 1;
    } else if (drawnDates.includes(day.bs)) {
      ctx.globalAlpha = 0.5;
    } else {
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = day.tag === "today" ? 'red' : 'white';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = 'black';
    const bs = nepaliToArabic(day.bs);
    ctx.fillText(bs, x + 20, y + 40);
    ctx.font = '12px Arial';
    ctx.fillText(day.ad, x + cellWidth - 35, y + 20);
    ctx.font = '20px Arial';

    if (day.tag === "today") {
      ctx.font = '10px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText("Today", x + 25, y + cellHeight - 5);
      ctx.font = '20px Arial';
    }

    ctx.globalAlpha = 1;

    if (!drawnDates.includes(day.bs)) {
      drawnDates.push(day.bs);
    }

    col++;
    if (col === 7) {
      col = 0;
      row++;
    }
  }
}

function nepaliToArabic(nepaliNumeral) {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const arabicDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let arabicNumeral = '';
  for (let i = 0; i < nepaliNumeral.length; i++) {
    const index = nepaliDigits.indexOf(nepaliNumeral[i]);
    if (index !== -1) {
      arabicNumeral += arabicDigits[index];
    } else {
      arabicNumeral += nepaliNumeral[i];
    }
  }
  return arabicNumeral;
}

function nepaliToRoman(nepaliName) {
  const nepaliMonthMap = {
    'बैशाख': 'Baisakh',
    'जेठ': 'Jestha',
    'असार': 'Asar',
    'साउन': 'Shrawan',
    'भदौ': 'Bhadra',
    'असोज': 'Ashwin',
    'कार्तिक': 'Kartik',
    'मंसिर': 'Mangsir',
    'पुष': 'Poush',
    'माघ': 'Magh',
    'फागुन': 'Falgun',
    'चैत्र': 'Chaitra'
  };
  return nepaliMonthMap[nepaliName] || nepaliName;
}
