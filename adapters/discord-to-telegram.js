// Discord.js compatibility adapter for Telegram
class EmbedBuilder {
    constructor() { this.data = {}; }
    setTitle(t) { this.data.title = t; return this; }
    setDescription(d) { this.data.description = d; return this; }
    setColor(c) { this.data.color = c; return this; }
    addFields(...f) { this.data.fields = f; return this; }
    setThumbnail(u) { this.data.thumbnail = u; return this; }
    setImage(u) { this.data.image = u; return this; }
    setFooter(f) { this.data.footer = f; return this; }
    setTimestamp() { this.data.timestamp = new Date(); return this; }
    setAuthor(a) { this.data.author = a; return this; }
}

class ActionRowBuilder {
    constructor() { this.components = []; }
    addComponents(...c) { this.components.push(...c); return this; }
}

class ButtonBuilder {
    constructor() { this.data = {}; }
    setLabel(l) { this.data.label = l; return this; }
    setCustomId(id) { this.data.customId = id; return this; }
    setStyle(s) { this.data.style = s; return this; }
    setURL(u) { this.data.url = u; return this; }
}

const ButtonStyle = { Primary: 1, Secondary: 2, Success: 3, Danger: 4, Link: 5 };

class StringSelectMenuBuilder {
    constructor() { this.data = {}; }
    setCustomId(id) { this.data.customId = id; return this; }
    addOptions(...o) { this.data.options = o; return this; }
}

const PermissionFlagsBits = { Administrator: 8, SendMessages: 2048, ManageGuild: 32 };

module.exports = {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    PermissionFlagsBits,
    MessageEmbed: EmbedBuilder
};
