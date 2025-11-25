const User = require('./models/User.js');
const log = require('../logger/log.js');

class UsersData {
    async get(telegramId) {
        try {
            let user = await User.findOne({ telegramId: String(telegramId) });
            if (!user) {
                user = new User({ telegramId: String(telegramId) });
                await user.save();
            }
            return {
                telegramId: user.telegramId,
                money: user.money,
                bank: user.bank,
                level: user.level,
                experience: user.experience
            };
        } catch (error) {
            return { telegramId: String(telegramId), money: 0, bank: 0, level: 1, experience: 0 };
        }
    }

    async set(telegramId, data) {
        try {
            return await User.findOneAndUpdate(
                { telegramId: String(telegramId) },
                { ...data, updatedAt: new Date() },
                { new: true, upsert: true }
            );
        } catch (error) {
            return null;
        }
    }

    async update(telegramId, data) {
        return this.set(telegramId, data);
    }

    async getAll() {
        try {
            return await User.find({});
        } catch (error) {
            return [];
        }
    }
}

module.exports = new UsersData();
