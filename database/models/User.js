const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    money: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    settings: {
        type: Object,
        default: {
            sortHelp: "name",
            language: "en"
        }
    },
    data: {
        type: Object,
        default: {}
    },
    stats: {
        type: Object,
        default: {
            totalMessages: 0,
            totalCommandsUsed: 0
        }
    },
    banned: {
        status: { type: Boolean, default: false },
        reason: { type: String, default: "" },
        date: { type: String, default: "" }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
