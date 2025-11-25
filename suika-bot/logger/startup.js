const console2 = require('./console.js');

async function showStartupMenu(botInfo, commandStats, dbStats) {
    console2.logo();
    
    console2.section('BOT INFORMATION');
    console2.table(['Property', 'Value'], [
        ['Bot Name', botInfo.botName || 'Suika Bot'],
        ['Username', `@${botInfo.username}`],
        ['User ID', botInfo.userId],
        ['Framework', 'Telegraf.js'],
        ['Language', 'Node.js'],
        ['Developer', 'Gtajisan'],
        ['Version', '1.0.0'],
    ]);
    console2.blank();

    console2.section('COMMANDS LOADED');
    console2.success(`Total Commands: ${commandStats.total}`);
    const categories = Object.entries(commandStats.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => [cat, count]);
    console2.table(['Category', 'Count'], categories);
    console2.blank();

    console2.section('DATABASE STATUS');
    console2.table(['Property', 'Value'], [
        ['Type', dbStats.type],
        ['Status', dbStats.status],
        ['Path', dbStats.path],
        ['Collections', dbStats.collections],
    ]);
    console2.blank();

    console2.section('SYSTEM INFORMATION');
    console2.table(['Property', 'Value'], [
        ['Platform', process.platform],
        ['Node Version', process.version],
        ['Memory', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`],
        ['Launch Time', new Date().toLocaleTimeString()],
    ]);
    console2.blank();

    console2.success(`Suika Bot is ready and operational!`);
    console2.info(`Dashboard available at: http://0.0.0.0:5000`);
    console2.divider('═');
}

async function showStatusUpdate(stats) {
    console2.section('STATUS UPDATE');
    console2.table(['Metric', 'Value'], [
        ['Uptime', `${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m`],
        ['Messages Processed', stats.messagesProcessed],
        ['Commands Executed', stats.commandsExecuted],
        ['Active Users', stats.activeUsers],
        ['Memory', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`],
    ]);
}

module.exports = {
    showStartupMenu,
    showStatusUpdate,
};
