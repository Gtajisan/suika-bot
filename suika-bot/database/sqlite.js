const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');

const DB_PATH = path.join(__dirname, '../../data/suika.db');

class SQLiteDatabase {
    constructor() {
        fs.ensureDirSync(path.dirname(DB_PATH));
        this.db = new Database(DB_PATH);
        this.db.pragma('journal_mode = WAL');
        this.initializeTables();
    }

    initializeTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                telegramId TEXT PRIMARY KEY,
                firstName TEXT,
                lastName TEXT,
                username TEXT,
                money REAL DEFAULT 0,
                bank REAL DEFAULT 0,
                level INTEGER DEFAULT 1,
                experience REAL DEFAULT 0,
                lastDaily TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async get(telegramId) {
        try {
            const stmt = this.db.prepare('SELECT * FROM users WHERE telegramId = ?');
            let user = stmt.get(String(telegramId));

            if (!user) {
                this.db.prepare('INSERT INTO users (telegramId) VALUES (?)').run(String(telegramId));
                user = stmt.get(String(telegramId));
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
            const id = String(telegramId);
            const keys = Object.keys(data);
            const fields = keys.map(k => `${k} = ?`).join(', ');
            this.db.prepare(
                `UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE telegramId = ?`
            ).run(...Object.values(data), id);
            return await this.get(id);
        } catch (error) {
            return null;
        }
    }

    async update(telegramId, data) {
        return this.set(telegramId, data);
    }

    async getAll() {
        try {
            return this.db.prepare('SELECT * FROM users').all() || [];
        } catch (error) {
            return [];
        }
    }
}

module.exports = new SQLiteDatabase();
