/**
 * Adapter to convert Discord.js patterns to Telegram
 */

class MessageEmbed {
    constructor() {
        this.data = {};
    }
    
    setTitle(title) {
        this.data.title = title;
        return this;
    }
    
    setDescription(desc) {
        this.data.description = desc;
        return this;
    }
    
    setColor(color) {
        this.data.color = color;
        return this;
    }
    
    addFields(...fields) {
        this.data.fields = fields;
        return this;
    }
    
    setThumbnail(url) {
        this.data.thumbnail = url;
        return this;
    }
    
    setImage(url) {
        this.data.image = url;
        return this;
    }
    
    setFooter(obj) {
        this.data.footer = obj;
        return this;
    }
    
    setTimestamp() {
        this.data.timestamp = new Date();
        return this;
    }
    
    toTelegram() {
        let message = '';
        
        if (this.data.title) {
            message += `*${this.data.title}*\n`;
        }
        
        if (this.data.description) {
            message += `${this.data.description}\n`;
        }
        
        if (this.data.fields && Array.isArray(this.data.fields)) {
            for (const field of this.data.fields) {
                if (field.name) {
                    message += `\n*${field.name}:*\n${field.value}\n`;
                }
            }
        }
        
        if (this.data.footer) {
            message += `\n_${this.data.footer.text}_`;
        }
        
        return message;
    }
}

const EmbedBuilder = MessageEmbed;

class ActionRowBuilder {
    constructor() {
        this.components = [];
    }
    
    addComponents(...components) {
        this.components.push(...components);
        return this;
    }
}

class ButtonBuilder {
    constructor() {
        this.data = {};
    }
    
    setLabel(label) {
        this.data.label = label;
        return this;
    }
    
    setCustomId(id) {
        this.data.customId = id;
        return this;
    }
    
    setStyle(style) {
        this.data.style = style;
        return this;
    }
    
    setURL(url) {
        this.data.url = url;
        return this;
    }
}

const ButtonStyle = {
    Primary: 1,
    Secondary: 2,
    Success: 3,
    Danger: 4,
    Link: 5
};

class StringSelectMenuBuilder {
    constructor() {
        this.data = {};
    }
    
    setCustomId(id) {
        this.data.customId = id;
        return this;
    }
    
    addOptions(...options) {
        this.data.options = options;
        return this;
    }
}

const PermissionFlagsBits = {
    Administrator: 0x8,
    SendMessages: 0x800,
    ManageMessages: 0x2000,
    ManageGuild: 0x20,
};

module.exports = {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    PermissionFlagsBits,
    MessageEmbed
};
