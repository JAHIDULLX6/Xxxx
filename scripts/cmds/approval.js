const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "approval",
    version: "1.0",
    author: "SaGor",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Manage group approval system"
    },
    longDescription: {
      en: "Turn on/off group approval system and get group invite link"
    },
    category: "group",
    guide: {
      en: "{p}approval on - Enable approval mode\n{p}approval off - Disable approval mode\n{p}approval status - Check current approval status\n{p}approval link - Get group invite link"
    }
  },

  langs: {
    en: {
      processing: "⏳ Processing...",
      noPermission: "❌ Only group admins can use this command.",
      notGroup: "❌ This command can only be used in groups.",
      alreadyOn: "⚠️ Approval mode is already **ENABLED** for this group.",
      alreadyOff: "⚠️ Approval mode is already **DISABLED** for this group.",
      turnedOn: "✅ **Approval mode has been ENABLED!**\n━━━━━━━━━━━━━━━━━━\nNew members will now require admin approval to join.",
      turnedOff: "✅ **Approval mode has been DISABLED!**\n━━━━━━━━━━━━━━━━━━\nAnyone can now join without approval.",
      statusOn: "📊 **GROUP APPROVAL STATUS**\n━━━━━━━━━━━━━━━━━━\n📌 Group: {groupName}\n🆔 ID: {threadID}\n🔒 Status: **ENABLED** ✅\n👥 Members: {memberCount}\n━━━━━━━━━━━━━━━━━━",
      statusOff: "📊 **GROUP APPROVAL STATUS**\n━━━━━━━━━━━━━━━━━━\n📌 Group: {groupName}\n🆔 ID: {threadID}\n🔓 Status: **DISABLED** ❌\n👥 Members: {memberCount}\n━━━━━━━━━━━━━━━━━━",
      linkError: "❌ Failed to generate group link. Make sure I'm an admin.",
      linkSuccess: "🔗 **GROUP INVITE LINK**\n━━━━━━━━━━━━━━━━━━\n📌 Group: {groupName}\n🔗 Link: {link}\n━━━━━━━━━━━━━━━━━━\n💡 Note: Link expires in 24 hours.",
      error: "❌ Error: {error}"
    }
  },

  onStart: async function ({ api, event, args, message, getLang, threadsData }) {
    try {
      const { threadID, isGroup, senderID } = event;

      // Check if in group
      if (!isGroup) {
        return message.reply(getLang("notGroup"));
      }

      // Get thread info
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
      
      // Check if user is admin
      if (!adminIDs.includes(senderID) && !global.GoatBot.config.adminBot.includes(senderID)) {
        return message.reply(getLang("noPermission"));
      }

      const threadData = await threadsData.get(threadID);
      const currentStatus = threadData.settings?.approval || false;

      if (!args[0]) {
        // Show status if no args
        const statusMsg = currentStatus ? getLang("statusOn") : getLang("statusOff");
        return message.reply(
          statusMsg
            .replace("{groupName}", threadInfo.name || "Unnamed Group")
            .replace("{threadID}", threadID)
            .replace("{memberCount}", threadInfo.participantIDs.length)
        );
      }

      const action = args[0].toLowerCase();

      switch (action) {
        case "on":
          if (currentStatus) {
            return message.reply(getLang("alreadyOn"));
          }
          
          if (!threadData.settings) threadData.settings = {};
          threadData.settings.approval = true;
          await threadsData.set(threadID, threadData.settings, "settings");
          
          return message.reply(getLang("turnedOn"));

        case "off":
          if (!currentStatus) {
            return message.reply(getLang("alreadyOff"));
          }
          
          if (!threadData.settings) threadData.settings = {};
          threadData.settings.approval = false;
          await threadsData.set(threadID, threadData.settings, "settings");
          
          return message.reply(getLang("turnedOff"));

        case "status":
          const statusMsg = currentStatus ? getLang("statusOn") : getLang("statusOff");
          return message.reply(
            statusMsg
              .replace("{groupName}", threadInfo.name || "Unnamed Group")
              .replace("{threadID}", threadID)
              .replace("{memberCount}", threadInfo.participantIDs.length)
          );

        case "link":
          const processingMsg = await message.reply(getLang("processing"));
          
          try {
            // Check if bot is admin
            if (!adminIDs.includes(api.getCurrentUserID())) {
              await message.unsend(processingMsg.messageID);
              return message.reply("❌ I need to be an admin to generate invite link!");
            }

            // Generate invite link
            const inviteLink = await api.getGroupLink(threadID);
            
            await message.unsend(processingMsg.messageID);
            
            return message.reply(
              getLang("linkSuccess")
                .replace("{groupName}", threadInfo.name || "Unnamed Group")
                .replace("{link}", inviteLink)
            );
          } catch (error) {
            await message.unsend(processingMsg.messageID);
            console.error("Link generation error:", error);
            return message.reply(getLang("linkError"));
          }

        default:
          const prefix = global.GoatBot.config.prefix;
          return message.reply(
            `❌ Invalid option!\n\n` +
            `📌 **Usage:**\n` +
            `• ${prefix}approval on - Enable approval\n` +
            `• ${prefix}approval off - Disable approval\n` +
            `• ${prefix}approval status - Check status\n` +
            `• ${prefix}approval link - Get invite link`
          );
      }

    } catch (error) {
      console.error("Approval command error:", error);
      return message.reply(getLang("error").replace("{error}", error.message));
    }
  },

  // Auto-handle new join requests when approval is on
  onEvent: async function ({ api, event, threadsData }) {
    try {
      if (event.logMessageType === "log:subscribe") {
        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        
        // If approval mode is on, notify admins
        if (threadData.settings?.approval) {
          const newMembers = event.logMessageData.addedParticipants;
          const threadInfo = await api.getThreadInfo(threadID);
          const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
          
          for (const member of newMembers) {
            const userID = member.userFbId;
            const userName = member.fullName;
            
            // Notify admins
            for (const adminID of adminIDs) {
              if (adminID !== api.getCurrentUserID()) {
                api.sendMessage(
                  `👤 **New Join Request**\n━━━━━━━━━━━━━━━━━━\n` +
                  `Name: ${userName}\n` +
                  `ID: ${userID}\n` +
                  `Group: ${threadInfo.name}\n` +
                  `━━━━━━━━━━━━━━━━━━\n` +
                  `Use /approval to manage settings.`,
                  adminID
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Approval onEvent error:", error);
    }
  }
};
