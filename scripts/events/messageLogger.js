const { Events } = require('discord.js');
const logMessage = require('../../logger/logMessage');

module.exports = {
    config: {
        name: "messageLogger",
        version: "1.0",
        author: "Samir"
    },

    onStart: async ({ client }) => {
        client.on(Events.MessageCreate, (message) => {
            if (message.author.bot) return;
            
            logMessage(message);
        });
    }
};
