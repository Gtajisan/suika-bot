const console2 = require('./console.js');

function displayCommandLoading(commandName, index, total) {
    const percentage = Math.round((index / total) * 100);
    const barLength = 30;
    const filled = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    process.stdout.write(`\r${console2.colors.cyan}[${bar}] ${percentage}% ${console2.colors.reset} Loading: ${commandName.padEnd(20)}`);
}

function displayLoadingComplete(total) {
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
    console2.success(`All ${total} commands loaded successfully!`, '⚡');
}

function displayCategoryStats(categories) {
    console2.section('📊 COMMAND CATEGORIES', '📦');
    const rows = Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => [cat, count]);
    console2.table(['Category', 'Count'], rows);
}

module.exports = {
    displayCommandLoading,
    displayLoadingComplete,
    displayCategoryStats,
};
