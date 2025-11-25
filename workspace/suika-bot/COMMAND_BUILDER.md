# 🍈 Suika Bot - Command Builder Guide

Complete reference for creating Telegram bot commands with full structure, aliases, multilingual support, and error handling.

---

## Table of Contents

1. [Command File Structure](#command-file-structure)
2. [Config Object](#config-object)
3. [Languages System](#languages-system)
4. [onStart Function](#onstart-function)
5. [Available Parameters](#available-parameters)
6. [Command Examples](#command-examples)
7. [Adapter Classes](#adapter-classes)
8. [Database Operations](#database-operations)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## Command File Structure

Every command file must export an object with these properties:

```javascript
module.exports = {
    config: { /* Command metadata */ },
    langs: { /* Multi-language strings */ },
    onStart: async ({ /* parameters */ }) => { /* Command logic */ }
};
```

---

## Config Object

### Required Properties

```javascript
config: {
    // Command name (must be unique)
    name: "commandname",
    
    // Alternative command names
    aliases: ["alias1", "alias2"],
    
    // Version number
    version: "1.0",
    
    // Original author
    author: "Developer Name",
    
    // Cooldown in seconds (prevents spam)
    countDown: 5,
    
    // Required role (0 = all users, 1 = bot admin, 2 = super admin)
    role: 0,
    
    // Category for help display
    category: "economy",
    
    // Description in multiple languages
    description: {
        en: "English description here",
        ne: "Nepali description here"
    },
    
    // Usage guide in multiple languages
    guide: {
        en: "/commandname <argument>",
        ne: "/commandname <argument>"
    },
    
    // Whether command works with slash commands
    slash: true,
    
    // Optional: Slash command options
    options: [
        {
            name: "user",
            description: "Target user",
            type: 6, // User type
            required: false
        }
    ]
}
```

### Configuration Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| name | string | - | **Required** Unique command identifier |
| aliases | array | [] | Alternative command names |
| version | string | "1.0" | Command version |
| author | string | "Unknown" | Creator name |
| countDown | number | 0 | Cooldown seconds (0 = no cooldown) |
| role | number | 0 | 0=Everyone, 1=Admin, 2=SuperAdmin |
| category | string | "general" | Grouping for help command |
| description | object | {} | Descriptions by language |
| guide | object | {} | Usage examples by language |
| slash | boolean | false | Enable slash command support |
| options | array | [] | Slash command parameters |

---

## Languages System

Define multi-language strings for your command:

```javascript
langs: {
    en: {
        // Simple strings
        noPerms: "❌ You don't have permission",
        
        // Strings with placeholders
        // %1 = first parameter, %2 = second, etc.
        userBalance: "💰 **%1's Balance**\nWallet: $%2\nBank: $%3",
        
        // Command responses
        success: "✅ Command executed successfully",
        error: "⚠️ An error occurred"
    },
    ne: {
        // Nepali translations
        noPerms: "❌ तपाईंसँग अनुमति छैन",
        userBalance: "💰 **%1 को ब्यालेन्स**\nवालेट: $%2\nबैंक: $%3",
        success: "✅ कमान्ड सफलतापूर्वक कार्यान्वित भयो",
        error: "⚠️ एक त्रुटि उत्पन्न भयो"
    }
}
```

### Language Keys

Use `getLang()` function to retrieve strings with automatic placeholder replacement:

```javascript
getLang("userBalance", "John", 1000, 5000)
// Returns: "💰 **John's Balance**\nWallet: $1000\nBank: $5000"
```

---

## onStart Function

The main command logic function. Called when user executes the command.

```javascript
onStart: async ({
    ctx,              // Telegraf context object
    message,          // Raw Telegram message
    args,             // Array of command arguments
    user,             // Current user data from database
    usersData,        // Database access object
    bot,              // Telegraf bot instance
    getLang           // Language string getter function
}) => {
    // Your command logic here
}
```

---

## Available Parameters

### ctx (Telegraf Context)

Main Telegram context object:

```javascript
// Send message
await ctx.reply("Hello!");

// Send message with keyboard
await ctx.reply("Choose:", Markup.keyboard([['/cmd1', '/cmd2']]).resize());

// Get user info
ctx.from.id              // Telegram user ID
ctx.from.first_name      // User's first name
ctx.from.username        // User's username (@username)
ctx.chat.id              // Chat/channel ID
ctx.message.text         // Message text

// Edit message
await ctx.telegram.editMessageText(chatId, messageId, undefined, "New text");

// Delete message
await ctx.deleteMessage();

// React to message
await ctx.react('👍');
```

### args (Command Arguments)

Array of words after the command:

```javascript
// User types: /balance @john 500
// args = ['@john', '500']

if (!args[0]) return ctx.reply("Please specify amount");
const amount = parseInt(args[1]);
```

### user (User Database Object)

Current user's data:

```javascript
user.telegramId        // Unique Telegram ID
user.money            // Wallet amount
user.bank             // Bank amount
user.level            // User level
user.experience       // Experience points
user.firstName        // User's first name
```

### usersData (Database Interface)

Access and modify user data:

```javascript
// Get user data
const userData = await usersData.get(userId);

// Update user data
await usersData.set(userId, {
    money: userData.money + 100,
    experience: userData.experience + 50
});

// Update specific fields
await usersData.update(userId, { level: 5 });

// Get all users
const allUsers = await usersData.getAll();
```

### bot (Telegraf Bot)

Bot instance for advanced operations:

```javascript
// Get bot info
const botInfo = await bot.telegram.getMe();

// Send message to specific user
await bot.telegram.sendMessage(userId, "Hello!");

// Get user chat
await bot.telegram.getChat(userId);
```

---

## Command Examples

### Example 1: Simple Echo Command

```javascript
// File: commands/echo.js
module.exports = {
    config: {
        name: "echo",
        aliases: ["say"],
        version: "1.0",
        author: "Developer",
        countDown: 2,
        role: 0,
        category: "fun",
        description: {
            en: "Repeat your message",
            ne: "आफ्नो सन्देश दोहोर्याउनुहोस्"
        },
        guide: {
            en: "/echo <text>",
            ne: "/echo <पाठ>"
        }
    },

    langs: {
        en: {
            noText: "❌ Please provide text to echo",
            echo: "🔊 %1"
        },
        ne: {
            noText: "❌ प्रतिध्वनि गर्न पाठ प्रदान गर्नुहोस्",
            echo: "🔊 %1"
        }
    },

    onStart: async ({ ctx, args, getLang }) => {
        if (args.length === 0) {
            return ctx.reply(getLang("noText"));
        }

        const text = args.join(" ");
        ctx.reply(getLang("echo", text));
    }
};
```

### Example 2: Economy Command with Database

```javascript
// File: commands/addmoney.js
module.exports = {
    config: {
        name: "addmoney",
        aliases: ["add"],
        version: "1.0",
        author: "Developer",
        countDown: 5,
        role: 1, // Admin only
        category: "economy",
        description: {
            en: "Add money to user's wallet",
            ne: "प्रयोगकर्ताको वालेटमा पैसा थप्नुहोस्"
        },
        guide: {
            en: "/addmoney <@user> <amount>",
            ne: "/addmoney <@प्रयोगकर्ता> <रकम>"
        }
    },

    langs: {
        en: {
            noPerms: "❌ Admin only",
            noUser: "❌ Please mention a user",
            noAmount: "❌ Please specify amount",
            success: "✅ Added $%1 to %2's wallet",
            error: "⚠️ Invalid amount"
        },
        ne: {
            noPerms: "❌ केवल प्रशासकको लागि",
            noUser: "❌ कृपया प्रयोगकर्ता उल्लेख गर्नुहोस्",
            noAmount: "❌ कृपया रकम निर्दिष्ट गर्नुहोस्",
            success: "✅ %2 को वालेटमा $%1 थपियो",
            error: "⚠️ अमान्य रकम"
        }
    },

    onStart: async ({ ctx, args, user, usersData, getLang }) => {
        // Check admin
        if (user.role < 1) {
            return ctx.reply(getLang("noPerms"));
        }

        // Parse arguments
        if (args.length < 2) {
            return ctx.reply(getLang("noUser"));
        }

        // Extract user ID from mention or direct ID
        let targetId = args[0].replace(/[<@!>]/g, '');
        if (isNaN(targetId)) {
            return ctx.reply(getLang("noUser"));
        }

        // Get amount
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return ctx.reply(getLang("error"));
        }

        // Update database
        const targetUser = await usersData.get(targetId);
        await usersData.set(targetId, {
            money: targetUser.money + amount
        });

        ctx.reply(getLang("success", amount, targetUser.firstName));
    }
};
```

### Example 3: Advanced Command with Interactions

```javascript
// File: commands/shop.js
const { EmbedBuilder, InlineKeyboard } = require('../adapters/discord-to-telegram.js');

module.exports = {
    config: {
        name: "shop",
        aliases: ["store", "buy"],
        version: "1.0",
        author: "Developer",
        countDown: 3,
        role: 0,
        category: "economy",
        description: {
            en: "Browse and buy items",
            ne: "वस्तुहरु ब्राउज र किन्नुहोस्"
        },
        guide: {
            en: "/shop",
            ne: "/shop"
        }
    },

    langs: {
        en: {
            shopTitle: "🏪 **Suika Bot Shop**",
            item1: "💎 Diamond - $1000",
            item2: "👑 Crown - $500",
            item3: "🎁 Gift Box - $100",
            purchased: "✅ You bought: %1",
            insufficientFunds: "❌ Not enough money",
            error: "⚠️ Something went wrong"
        },
        ne: {
            shopTitle: "🏪 **Suika Bot दोकान**",
            item1: "💎 हीरा - $1000",
            item2: "👑 ताज - $500",
            item3: "🎁 उपहार बक्स - $100",
            purchased: "✅ तपनी किन्नुभयो: %1",
            insufficientFunds: "❌ पैसा अपर्याप्त छ",
            error: "⚠️ केहि गलत भयो"
        }
    },

    onStart: async ({ ctx, user, usersData, getLang }) => {
        const shop = [
            { name: "Diamond", price: 1000, emoji: "💎" },
            { name: "Crown", price: 500, emoji: "👑" },
            { name: "Gift Box", price: 100, emoji: "🎁" }
        ];

        let shopText = getLang("shopTitle") + "\n\n";
        
        shop.forEach((item, index) => {
            shopText += `${item.emoji} ${item.name} - $${item.price}\n`;
        });

        // Send message with buy buttons
        const buttons = [
            [
                { text: "💎 Diamond ($1000)", callback_data: "buy_diamond" },
                { text: "👑 Crown ($500)", callback_data: "buy_crown" }
            ],
            [
                { text: "🎁 Gift Box ($100)", callback_data: "buy_gift" }
            ]
        ];

        await ctx.reply(shopText, {
            reply_markup: {
                inline_keyboard: buttons
            }
        });

        // Handle button clicks
        ctx.action('buy_diamond', async (btnCtx) => {
            if (user.money < 1000) {
                return btnCtx.answerCbQuery(getLang("insufficientFunds"));
            }
            
            await usersData.set(user.telegramId, {
                money: user.money - 1000
            });
            
            btnCtx.editMessageText(getLang("purchased", "💎 Diamond"));
        });
    }
};
```

---

## Adapter Classes

Use these classes to build formatted messages:

### EmbedBuilder

Create rich message embeds:

```javascript
const { EmbedBuilder } = require('../adapters/discord-to-telegram.js');

const embed = new EmbedBuilder()
    .setTitle("User Profile")
    .setDescription("Here is your profile information")
    .setColor(0xFFD700)
    .addFields(
        { name: "Level", value: "10", inline: true },
        { name: "Experience", value: "1500", inline: true }
    )
    .setThumbnail("https://example.com/image.jpg")
    .setImage("https://example.com/banner.jpg")
    .setFooter({ text: "Suika Bot", iconURL: "https://example.com/icon.jpg" })
    .setTimestamp();

await ctx.reply("", { embeds: [embed] });
```

### ButtonBuilder

Create interactive buttons:

```javascript
const { ButtonBuilder, ButtonStyle } = require('../adapters/discord-to-telegram.js');

const button = new ButtonBuilder()
    .setLabel("Click Me")
    .setCustomId("my_button")
    .setStyle(ButtonStyle.Primary);
```

### ActionRowBuilder

Group buttons in rows:

```javascript
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('../adapters/discord-to-telegram.js');

const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setLabel("Yes")
            .setCustomId("btn_yes")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setLabel("No")
            .setCustomId("btn_no")
            .setStyle(ButtonStyle.Danger)
    );
```

---

## Database Operations

### Get User Data

```javascript
const user = await usersData.get(userId);
console.log(user);
// Output: {
//   telegramId: "123456789",
//   money: 1000,
//   bank: 5000,
//   level: 5,
//   experience: 2500
// }
```

### Update User Data

```javascript
// Replace values
await usersData.set(userId, {
    money: 2000,
    level: 6
});

// Or use update (same effect)
await usersData.update(userId, {
    experience: user.experience + 100
});
```

### Get All Users

```javascript
const allUsers = await usersData.getAll();
allUsers.forEach(user => {
    console.log(`${user.firstName}: Level ${user.level}`);
});
```

### Increment Values

```javascript
// Add money without replacing
const user = await usersData.get(userId);
await usersData.set(userId, {
    money: user.money + 100  // Add 100
});
```

---

## Error Handling

Always use try-catch and provide user feedback:

```javascript
onStart: async ({ ctx, args, usersData, getLang }) => {
    try {
        // Your command logic
        if (!args[0]) {
            return ctx.reply(getLang("noArgs"));
        }

        const result = await usersData.get(args[0]);
        
        if (!result) {
            return ctx.reply(getLang("notFound"));
        }

        ctx.reply(getLang("success"));

    } catch (error) {
        console.error("Command error:", error);
        ctx.reply(getLang("error") || "❌ An error occurred");
    }
}
```

---

## Best Practices

### 1. Command Naming
- Use lowercase, no spaces
- Be descriptive: `addmoney` not `add`
- Use underscores for multi-word: `rank_card`

### 2. Aliases
```javascript
aliases: ["bal", "money", "wallet"]  // Common alternatives
```

### 3. Permission System
```javascript
role: 0,  // Everyone
role: 1,  // Bot admin only
role: 2   // Super admin only
```

### 4. Cooldowns
```javascript
countDown: 5  // 5 second cooldown (prevents spam)
```

### 5. User Feedback
```javascript
// Good: Clear, emoji-enhanced
"✅ Successfully added $500 to wallet"

// Bad: Generic
"done"
```

### 6. Error Messages
```javascript
// Always provide actionable feedback
if (!amount) {
    return ctx.reply(getLang("noAmount", "/addmoney @user 100"));
}
```

### 7. Input Validation
```javascript
// Always validate user input
const amount = parseInt(args[0]);
if (isNaN(amount) || amount <= 0) {
    return ctx.reply(getLang("invalidAmount"));
}
```

### 8. Database Safety
```javascript
// Always check before operations
const user = await usersData.get(userId);
if (!user) {
    return ctx.reply(getLang("userNotFound"));
}
```

---

## Quick Template

Use this as a starting point for new commands:

```javascript
module.exports = {
    config: {
        name: "newcommand",
        aliases: ["alias1"],
        version: "1.0",
        author: "Your Name",
        countDown: 5,
        role: 0,
        category: "general",
        description: {
            en: "Command description",
            ne: "कमान्ड विवरण"
        },
        guide: {
            en: "/newcommand <args>",
            ne: "/newcommand <args>"
        }
    },

    langs: {
        en: {
            error: "❌ An error occurred",
            success: "✅ Command executed"
        },
        ne: {
            error: "❌ एक त्रुटि उत्पन्न भयो",
            success: "✅ कमान्ड कार्यान्वित भयो"
        }
    },

    onStart: async ({ ctx, args, user, usersData, getLang }) => {
        try {
            // Your logic here
            ctx.reply(getLang("success"));
        } catch (error) {
            console.error(error);
            ctx.reply(getLang("error"));
        }
    }
};
```

---

## Command Registration

Commands are automatically loaded from the `commands/` folder. Just create a new `.js` file and restart the bot!

```bash
# Workflow automatically loads all commands
npm start
```

---

## Support

For issues or questions about command creation, check:
- Existing commands in `commands/` folder
- Bot logs for error messages
- README.md for general setup

Happy coding! 🍈
