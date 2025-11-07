const mongoose = require('mongoose');

const commandStatsSchema = new mongoose.Schema({
    commandName: { type: String, required: true, unique: true },
    executionCount: { type: Number, default: 0 },
    lastUsed: { type: Date, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model('CommandStats', commandStatsSchema);
