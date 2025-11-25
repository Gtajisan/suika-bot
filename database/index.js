const mongoose = require('mongoose');
const log = require('../logger/log.js');
const config = require('../loadConfig.js');

let databaseProvider = null;

async function initializeDatabase() {
    try {
        if (config.database.mongodbUri && config.database.mongodbUri !== '') {
            try {
                await mongoose.connect(config.database.mongodbUri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                databaseProvider = require('./usersData.js');
                log.info('✅ Using MongoDB');
                return databaseProvider;
            } catch (mongoError) {
                log.warn(`MongoDB failed: ${mongoError.message}`);
            }
        }

        databaseProvider = require('./sqlite.js');
        log.info('✅ Using SQLite');
        return databaseProvider;
    } catch (error) {
        log.error(`Database error: ${error.message}`);
        return require('./sqlite.js');
    }
}

module.exports = { initializeDatabase };
