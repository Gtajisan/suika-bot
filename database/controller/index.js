module.exports = async function() {
    const UserModel = require('../models/User.js');
    const GuildModel = require('../models/Guild.js');
    const CommandStatsModel = require('../models/CommandStats.js');

    global.db.userModel = UserModel;
    global.db.guildModel = GuildModel;
    global.db.commandStatsModel = CommandStatsModel;
    global.db.allCommandStats = [];

    global.db.usersData = await require('./usersData.js')(UserModel);
    global.db.guildsData = await require('./guildsData.js')(GuildModel);
    global.db.commandStatsData = await require('./commandStatsData.js')(CommandStatsModel);

    return true;
};
