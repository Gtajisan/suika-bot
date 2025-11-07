const errorNotifier = require('./logger/errorNotifier');

process.on('unhandledRejection', error => {
    console.error('Unhandled Rejection:', error);
    errorNotifier.notifyError(error, { location: 'Unhandled Rejection', command: 'Global' }).catch(() => {});
});

process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
    errorNotifier.notifyError(error, { location: 'Uncaught Exception', command: 'Global' }).catch(() => {});
});

const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const config = require('./loadConfig.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember]
});

global.RentoBot = {
    startTime: Date.now(),
    commands: new Collection(),
    eventCommands: new Collection(),
    commandFilesPath: [],
    eventCommandsFilesPath: [],
    aliases: new Collection(),
    onReply: new Map(),
    onReaction: new Map(),
    onButton: new Map(),
    onSelectMenu: new Map(),
    onModal: new Map(),
    onChat: [],
    onChatEvents: [],
    config,
    client,
    presenceManager: null
};

global.db = {
    allGuildData: [],
    allUserData: [],
    guildModel: null,
    userModel: null,
    guildsData: null,
    usersData: null
};

global.client = {
    cache: {},
    database: {
        creatingGuildData: [],
        creatingUserData: []
    }
};

const utils = require("./utils.js");
global.utils = utils;

global.temp = {
    createGuildData: [],
    createUserData: []
};

const login = require('./login/login.js');
login(client, config);

module.exports = client;
