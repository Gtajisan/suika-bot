const _ = require("lodash");
const { CustomError, TaskQueue, getType } = global.utils;

const taskQueue = new TaskQueue(function (task, callback) {
    if (getType(task) === "AsyncFunction") {
        task()
            .then(result => callback(null, result))
            .catch(err => callback(err));
    } else {
        try {
            const result = task();
            callback(null, result);
        } catch (err) {
            callback(err);
        }
    }
});

module.exports = async function (commandStatsModel) {
    let CommandStats = [];

    CommandStats = (await commandStatsModel.find({}).lean()).map(stat => _.omit(stat, ["_id", "__v"]));
    global.db.allCommandStats = CommandStats;

    async function save(commandName, commandData, mode) {
        try {
            let index = _.findIndex(global.db.allCommandStats, { commandName });

            switch (mode) {
                case "create": {
                    let dataCreated = await commandStatsModel.create(commandData);
                    dataCreated = _.omit(dataCreated._doc, ["_id", "__v"]);
                    global.db.allCommandStats.push(dataCreated);
                    return _.cloneDeep(dataCreated);
                }
                case "update": {
                    if (index === -1) {
                        throw new CustomError({
                            name: "COMMAND_STATS_NOT_FOUND",
                            message: `Can't find command stats with commandName: ${commandName} in database`
                        });
                    }
                    let dataUpdated = await commandStatsModel.findOneAndUpdate({ commandName }, commandData, { returnDocument: 'after' });
                    dataUpdated = _.omit(dataUpdated._doc, ["_id", "__v"]);
                    global.db.allCommandStats[index] = dataUpdated;
                    return _.cloneDeep(dataUpdated);
                }
                default:
                    break;
            }
        } catch (err) {
            throw err;
        }
    }

    async function create(commandName) {
        const commandData = {
            commandName: commandName,
            executionCount: 0,
            lastUsed: null
        };
        return await save(commandName, commandData, "create");
    }

    async function get(commandName) {
        const stat = global.db.allCommandStats.find(s => s.commandName === commandName);
        if (!stat) {
            return await create(commandName);
        }
        return _.cloneDeep(stat);
    }

    async function incrementUsage(commandName) {
        let statData = await get(commandName);
        statData.executionCount = (statData.executionCount || 0) + 1;
        statData.lastUsed = new Date();
        return await save(commandName, statData, "update");
    }

    async function getAll() {
        return _.cloneDeep(global.db.allCommandStats);
    }

    async function getTopCommands(limit = 10) {
        const stats = await getAll();
        return stats.sort((a, b) => b.executionCount - a.executionCount).slice(0, limit);
    }

    return { create, get, incrementUsage, save, getAll, getTopCommands };
};
