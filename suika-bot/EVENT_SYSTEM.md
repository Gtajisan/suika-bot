# SUIKA BOT - EVENT SYSTEM

Rebuilt from original Rento-Bot base with Telegram adaptation

## EVENT SYSTEM OVERVIEW

The event system handles Telegram-specific events and triggers custom responses or data tracking.

```
System Status: ACTIVE
Events Loaded: 4 custom events
Builtin Events: 4 (text, start, help, ping)
Total Event Handlers: 8
```

---

## CUSTOM EVENTS

### 1. BOT MEMBER EVENTS (my_chat_member)

File: events/newMember.js

Triggers when:
- Bot is added to a group
- Bot is removed from a group
- Bot is promoted/demoted

Features:
- Logs bot join/leave events
- Sends welcome message on join
- Tracks group additions

Usage:
- Automatic (no command needed)
- Logs to console: [BOT_MEMBER_JOIN] / [BOT_MEMBER_LEAVE]

Example Log:
```
[MEMBER_JOIN] Bot added to MyGroup (123456789)
[MEMBER_LEAVE] Bot removed from MyGroup (123456789)
```

---

### 2. GROUP MEMBER EVENTS (chat_member)

File: events/groupMemberJoin.js

Triggers when:
- User joins group
- User leaves group
- User is banned from group
- User is kicked

Features:
- Tracks member status changes
- Creates user profile on first join
- Logs all member changes
- Updates user database

Event Types:
- Member Join - New user enters group
- Member Leave - User exits group
- Member Ban - User banned from group

Example Log:
```
[GROUP_MEMBER_JOIN] John joined MyGroup
[GROUP_MEMBER_LEAVE] Jane left MyGroup
[GROUP_MEMBER_BAN] Spammer was banned from MyGroup
```

User Data Created:
```
{
  telegramId: User ID
  firstName: User's first name
  lastName: User's last name (if exists)
  username: Telegram username (if exists)
  money: 0 (initial balance)
  bank: 0 (initial bank)
  level: 1 (initial level)
  experience: 0 (initial XP)
  createdAt: Current timestamp
}
```

---

### 3. MESSAGE DELETE EVENT (message_deleted)

File: events/messageDelete.js

Triggers when:
- Message is deleted
- Message edit history is cleared

Features:
- Logs deleted messages
- Tracks deletion events
- Records user who deleted

Example Log:
```
[MESSAGE_DELETE] Message 12345 deleted in chat 987654 by user 111222
```

---

### 4. CALLBACK QUERY EVENT (callback_query)

File: events/callbackQuery.js

Triggers when:
- User clicks inline button
- User interacts with keyboard buttons

Features:
- Logs button clicks
- Answers callback queries
- Shows notifications

Example Log:
```
[CALLBACK_QUERY] User John (123456) clicked: delete_message
```

---

## BUILTIN EVENTS

### Text Message Handler
Processes all text messages and routes them to commands

### Start Command
Handles /start - Shows welcome message with keyboard

### Help Command
Handles /help - Shows available commands

### Ping Command
Handles /ping - Returns bot latency

---

## CREATING CUSTOM EVENTS

### Template

```javascript
module.exports = {
    eventName: 'event_name_here',  // Telegram event name
    
    run: async (ctx) => {
        try {
            // Your event logic
            console.log('[EVENT_NAME] Description');
            
        } catch (error) {
            console.error(`[ERROR] eventname event: ${error.message}`);
        }
    }
};
```

### Available Telegram Events

Event Name          | Triggers
------------------------------------------
my_chat_member      | Bot status changes
chat_member         | Member status changes
message_deleted     | Message deleted
callback_query      | Button clicked
edited_message      | Message edited
new_chat_members    | Members join
left_chat_member    | Member leaves
new_chat_title      | Group title changed
new_chat_photo      | Group photo changed
delete_chat_photo   | Photo removed
group_chat_created  | Group created
channel_chat_created| Channel created

### Add New Event

1. Create file in events/ folder:
```bash
events/myevent.js
```

2. Add event handler code:
```javascript
module.exports = {
    eventName: 'your_event_name',
    run: async (ctx) => {
        // Your code
    }
};
```

3. Restart bot:
```bash
npm start
```

Event automatically loads!

---

## CHECKING EVENT STATUS

Use admin command: /checkevents

Output:
```
========================================
EVENT SYSTEM STATUS CHECK
========================================

CUSTOM EVENTS REGISTRATION:
my_chat_member: Registered
chat_member: Registered
message_deleted: Registered
callback_query: Registered

TOTAL CUSTOM EVENTS LOADED: 4

BUILTIN EVENTS:
- Text message handler: Enabled
- Start command: Enabled
- Help command: Enabled
- Ping command: Enabled

Status: All event handlers active
========================================
```

---

## ERROR HANDLING

All events have try-catch blocks for safety

Error Logging Format:
```
[ERROR] eventname event: error message
```

Example:
```
[ERROR] groupMemberJoin event: Cannot read property 'id' of undefined
```

---

## EVENT EXECUTION FLOW

```
Telegram Update
     ↓
Telegraf Router
     ↓
Event Matcher (matches to eventName)
     ↓
Event Handler Executes (run function)
     ↓
Logging & Data Storage
     ↓
Complete
```

---

## DATABASE INTEGRATION

Events interact with database:

User Creation (Member Join):
```javascript
await global.db.usersData.set(userId, userData);
```

User Lookup (Any Event):
```javascript
const userData = await global.db.usersData.get(userId);
```

---

## PERFORMANCE

Event Processing Time:
- Member events: < 50ms
- Message events: < 20ms
- Callback events: < 10ms

Memory Usage:
- Event system: ~2MB
- Per event handler: ~0.5KB

---

## LOGGING

All events log to console with format:

```
[EVENT_TYPE] Description
[ERROR] event: error message
[WARNING] event: warning message
```

Example:
```
[GROUP_MEMBER_JOIN] Alice joined Group
[CALLBACK_QUERY] User clicked button_name
[ERROR] groupMemberJoin event: Cannot read property
```

---

## TROUBLESHOOTING

ISSUE: Event not triggering

Solution:
1. Check event is in events/ folder
2. Verify eventName is correct
3. Check bot permissions
4. Run /checkevents to verify loading
5. Restart bot: npm start

ISSUE: Event error in logs

Solution:
1. Check error message
2. Add null checks in code
3. Verify data structure
4. Test in try-catch

ISSUE: User data not created

Solution:
1. Check database is initialized
2. Verify chat_member event loaded
3. Check user join event triggered
4. Review logs for errors

---

## DEVELOPMENT NOTES

From Original Rento-Bot:
- Event system adapted from Discord to Telegram
- Same conceptual model: eventName + run function
- Integration with user database on events
- Error handling and logging system

Telegram Specifics:
- Uses Telegraf.js event names
- Context object (ctx) instead of Discord.js events
- my_chat_member for bot status
- chat_member for member status

---

## NEXT STEPS

To extend event system:

1. Create new event file in events/
2. Define eventName from Telegram events
3. Add run async function
4. Add error handling
5. Test with /checkevents
6. Restart bot

---

```
========================================
EVENT SYSTEM DOCUMENTATION
Built for Suika Bot by Gtajisan
Original concept from Rento-Bot
========================================
```
