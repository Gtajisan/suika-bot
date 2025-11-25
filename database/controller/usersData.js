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

module.exports = async function (userModel) {
    let Users = [];

    Users = (await userModel.find({}).lean()).map(user => {
        const userData = _.omit(user, ["_id", "__v"]);
        // Remove legacy level field if it exists
        delete userData.level;
        return userData;
    });
    global.db.allUserData = Users;

    async function save(userID, userData, mode) {
        try {
            let index = _.findIndex(global.db.allUserData, { userID });

            switch (mode) {
                case "create": {
                    let dataCreated = await userModel.create(userData);
                    dataCreated = _.omit(dataCreated._doc, ["_id", "__v"]);
                    global.db.allUserData.push(dataCreated);
                    return _.cloneDeep(dataCreated);
                }
                case "update": {
                    if (index === -1) {
                        throw new CustomError({
                            name: "USER_NOT_FOUND",
                            message: `Can't find user with userID: ${userID} in database`
                        });
                    }
                    let dataUpdated = await userModel.findOneAndUpdate({ userID }, userData, { returnDocument: 'after' });
                    dataUpdated = _.omit(dataUpdated._doc, ["_id", "__v"]);
                    global.db.allUserData[index] = dataUpdated;
                    return _.cloneDeep(dataUpdated);
                }
                default:
                    break;
            }
        } catch (err) {
            throw err;
        }
    }

    async function create(userID) {
        let userName = "";
        try {
            const client = global.RentoBot?.client;
            if (client) {
                const user = await client.users.fetch(userID).catch(() => null);
                if (user) userName = user.username || user.tag || "";
            }
        } catch (err) {
            console.error("Error fetching user:", err);
        }

        const defaultLanguage = global.RentoBot?.config?.bot?.language || "en";

        const userData = {
            userID: String(userID),
            name: userName,
            exp: 0,
            money: 0,
            bank: 0,
            settings: {
                sortHelp: "name",
                language: defaultLanguage
            },
            data: {},
            stats: {
                totalMessages: 0,
                totalCommandsUsed: 0
            },
            banned: {
                status: false,
                reason: "",
                date: ""
            }
        };
        return await save(userID, userData, "create");
    }

    async function getName(userID) {
        const user = await get(userID);
        if (user.name) return user.name;

        try {
            const client = global.RentoBot?.client;
            if (client) {
                const discordUser = await client.users.fetch(userID).catch(() => null);
                if (discordUser) {
                    const name = discordUser.username || discordUser.tag || "";
                    await set(userID, { name });
                    return name;
                }
            }
        } catch (err) {
            console.error("Error fetching user name:", err);
        }
        return userID;
    }

    async function get(userID) {
        const user = global.db.allUserData.find(u => u.userID == userID);
        if (!user) {
            return await create(userID);
        }
        const userData = _.cloneDeep(user);
        // Remove legacy level field if it exists
        delete userData.level;
        
        // Ensure legacy users have language setting (in-memory only, persists on next update)
        if (!userData.settings) {
            userData.settings = {};
        }
        if (!userData.settings.language) {
            const defaultLanguage = global.RentoBot?.config?.bot?.language || "en";
            userData.settings.language = defaultLanguage;
            
            // Persist to database and in-memory cache without triggering recursion
            const index = _.findIndex(global.db.allUserData, { userID });
            if (index !== -1) {
                global.db.allUserData[index].settings = global.db.allUserData[index].settings || {};
                global.db.allUserData[index].settings.language = defaultLanguage;
                
                // Update database directly without calling set()
                userModel.findOneAndUpdate(
                    { userID },
                    { $set: { 'settings.language': defaultLanguage } }
                ).catch(err => {
                    console.error("Error updating language for legacy user:", err);
                });
            }
        }
        
        return userData;
    }

    async function set(userID, updateData, path) {
        let userData = await get(userID);
        
        if (path) {
            _.set(userData, path, updateData);
        } else {
            userData = { ...userData, ...updateData };
        }
        
        return await save(userID, userData, "update");
    }

    async function getAll() {
        return _.cloneDeep(global.db.allUserData);
    }

    return { create, get, set, save, getName, getAll };
};
