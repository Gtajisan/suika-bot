const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

function getTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function box(text, color = 'cyan', width = 60) {
    const line = '═'.repeat(width - 2);
    const padding = Math.max(0, width - 4 - text.length);
    const paddingL = Math.floor(padding / 2);
    const paddingR = padding - paddingL;
    
    console.log(`${colors[color]}╔${line}╗${colors.reset}`);
    console.log(`${colors[color]}║${' '.repeat(paddingL)}${text}${' '.repeat(paddingR)}║${colors.reset}`);
    console.log(`${colors[color]}╚${line}╝${colors.reset}`);
}

function table(headers, rows) {
    const colWidths = headers.map((h, i) => {
        const maxLen = Math.max(h.length, ...rows.map(r => String(r[i]).length));
        return maxLen + 2;
    });

    // Header
    console.log(`${colors.cyan}┌${'─'.repeat(colWidths.reduce((a, b) => a + b) + headers.length - 1)}┐${colors.reset}`);
    let header = `${colors.cyan}│${colors.reset}`;
    headers.forEach((h, i) => {
        header += ` ${colors.bright}${h.padEnd(colWidths[i])}${colors.reset} ${colors.cyan}│${colors.reset}`;
    });
    console.log(header);
    console.log(`${colors.cyan}├${'─'.repeat(colWidths.reduce((a, b) => a + b) + headers.length - 1)}┤${colors.reset}`);

    // Rows
    rows.forEach((row, idx) => {
        let line = `${colors.cyan}│${colors.reset}`;
        row.forEach((cell, i) => {
            const color = idx % 2 === 0 ? colors.white : colors.cyan;
            line += ` ${color}${String(cell).padEnd(colWidths[i])}${colors.reset} ${colors.cyan}│${colors.reset}`;
        });
        console.log(line);
    });

    console.log(`${colors.cyan}└${'─'.repeat(colWidths.reduce((a, b) => a + b) + headers.length - 1)}┘${colors.reset}`);
}

module.exports = {
    // Logo
    logo: () => {
        console.log(`
${colors.magenta}╔════════════════════════════════════════╗${colors.reset}
${colors.magenta}║${colors.reset}       SUIKA BOT - TELEGRAM             ${colors.magenta}║${colors.reset}
${colors.magenta}║${colors.reset}   Powerful Moderation & Games         ${colors.magenta}║${colors.reset}
${colors.magenta}╚════════════════════════════════════════╝${colors.reset}
        `);
    },

    info: (msg) => {
        const time = getTime();
        console.log(`${colors.cyan}[${time}] [INFO] ${msg}${colors.reset}`);
    },

    success: (msg) => {
        const time = getTime();
        console.log(`${colors.green}${colors.bright}[${time}] [DONE] ${msg}${colors.reset}`);
    },

    warn: (msg) => {
        const time = getTime();
        console.log(`${colors.yellow}${colors.bright}[${time}] [WARN] ${msg}${colors.reset}`);
    },

    error: (msg) => {
        const time = getTime();
        console.log(`${colors.red}${colors.bright}[${time}] [FAIL] ${msg}${colors.reset}`);
    },

    debug: (msg) => {
        const time = getTime();
        console.log(`${colors.magenta}[${time}] [DEBUG] ${msg}${colors.reset}`);
    },

    title: (text) => {
        const width = Math.min(text.length + 4, 60);
        box(text, 'magenta', width);
    },

    section: (text) => {
        console.log(`\n${colors.bright}${colors.blue}[${text}]${colors.reset}`);
        console.log(`${colors.blue}${'═'.repeat(text.length + 2)}${colors.reset}\n`);
    },

    command: (name, count, total) => {
        const percentage = Math.round((count / total) * 100);
        const barLength = 25;
        const filled = Math.round((percentage / 100) * barLength);
        const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
        console.log(`  ${colors.cyan}[${bar}]${colors.reset} ${count}/${total} - ${colors.green}${name}${colors.reset}`);
    },

    stats: (data) => {
        table(['Metric', 'Value'], Object.entries(data));
    },

    box: box,
    table: table,

    divider: (char = '─') => {
        console.log(`${colors.cyan}${char.repeat(60)}${colors.reset}\n`);
    },

    blank: () => console.log(''),

    colors: colors,
};
