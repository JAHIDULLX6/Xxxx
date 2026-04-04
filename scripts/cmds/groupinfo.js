module.exports = {
  config: {
    name: "groupinfo",
    version: "1.4",
    author: "SaGor",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Show full group information"
    },
    description: {
      en: "Display detailed information about the current group with image"
    },
    category: "box chat",
    guide: {
      en: "{pn}"
    }
  },

  langs: {
    en: {
      onlyGroup: "❌ | This command can only be used in a group.",
      error: "❌ | Unable to get group info.\n%1"
    }
  },

  onStart: async function ({ api, event, message, getLang }) {
    try {
      if (!event.isGroup)
        return message.reply(getLang("onlyGroup"));

      const threadInfo = await api.getThreadInfo(event.threadID);

      const members = Array.isArray(threadInfo.userInfo) ? threadInfo.userInfo : [];
      const participantIDs = Array.isArray(threadInfo.participantIDs) ? threadInfo.participantIDs : [];
      const adminIDs = Array.isArray(threadInfo.adminIDs) ? threadInfo.adminIDs : [];
      const nicknames = threadInfo.nicknames || {};

      const cleanText = (value) => {
        return String(value ?? "Unknown")
          .replace(/[\r\n]+/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
      };

      const extractInviteLink = (value) => {
        if (!value)
          return null;

        if (typeof value === "string")
          return value;

        if (typeof value === "object") {
          const directKeys = ["link", "url", "inviteLink", "threadInviteLink", "join_link", "href"];

          for (const key of directKeys) {
            if (typeof value[key] === "string" && value[key].trim())
              return value[key];
          }

          for (const key of Object.keys(value)) {
            const found = extractInviteLink(value[key]);
            if (found)
              return found;
          }
        }

        return null;
      };

      let male = 0;
      let female = 0;
      let unknown = 0;
      let botCount = 0;

      for (const user of members) {
        if (user.gender === "MALE" || user.gender === 2)
          male++;
        else if (user.gender === "FEMALE" || user.gender === 1)
          female++;
        else
          unknown++;

        if (
          user.type === "page" ||
          user.type === "Page" ||
          user.isMessengerUser === false
        ) {
          botCount++;
        }
      }

      const adminList = adminIDs.length
        ? adminIDs
            .map((item, index) => {
              const id = item.id || item;
              const user = members.find(u => String(u.id) === String(id));
              const name = cleanText(user?.name || id);
              return `│ ${index + 1}. ${name}`;
            })
            .join("\n")
        : "│ None";

      const nicknameCount = Object.keys(nicknames).length;

      const muteUntil = threadInfo.muteUntil
        ? new Date(Number(threadInfo.muteUntil)).toLocaleString("en-BD", {
            timeZone: "Asia/Dhaka"
          })
        : "Not muted";

      const inviteLink =
        extractInviteLink(threadInfo.inviteLink) ||
        extractInviteLink(threadInfo.threadInviteLink) ||
        "Not available";

      const groupName = cleanText(threadInfo.threadName || threadInfo.name || "Unnamed Group");
      const threadID = threadInfo.threadID || event.threadID;
      const memberCount = participantIDs.length || members.length || 0;
      const adminCount = adminIDs.length;
      const approvalMode = threadInfo.approvalMode ? "On" : "Off";
      const emoji = cleanText(threadInfo.emoji || "None");
      const themeColor = threadInfo.color
        ? `#${String(threadInfo.color).replace(/^#/, "").toUpperCase()}`
        : "Default";
      const messageCount = threadInfo.messageCount || 0;
      const archived = threadInfo.isArchived ? "Yes" : "No";
      const subscribed = threadInfo.isSubscribed ? "Yes" : "No";
      const imageUrl = threadInfo.imageSrc || null;
      const imageStatus = imageUrl ? "Available" : "No image";

      const body =
        "╭───〔 GROUP INFO 〕───╮\n" +
        `│ 📝 Name        : ${groupName}\n` +
        `│ 🆔 Thread ID   : ${threadID}\n` +
        `│ 👥 Members     : ${memberCount}\n` +
        `│ 👑 Admins      : ${adminCount}\n` +
        "│ 📛 Admin List  :\n" +
        `${adminList}\n` +
        `│ 🙋 Male        : ${male}\n` +
        `│ 🙋 Female      : ${female}\n` +
        `│ ❔ Unknown     : ${unknown}\n` +
        `│ 🤖 Bots        : ${botCount}\n` +
        `│ 🏷️ Nicknames   : ${nicknameCount}\n` +
        `│ ✅ Approval    : ${approvalMode}\n` +
        `│ 😊 Emoji       : ${emoji}\n` +
        `│ 🎨 Theme Color : ${themeColor}\n` +
        `│ 💬 Messages    : ${messageCount}\n` +
        `│ 🔕 Mute Until  : ${muteUntil}\n` +
        `│ 📦 Archived    : ${archived}\n` +
        `│ 🔔 Subscribed  : ${subscribed}\n` +
        `│ 🖼️ Image       : ${imageStatus}\n` +
        `│ 🔗 Invite Link : ${inviteLink}\n` +
        "╰─────────────────────╯";

      if (imageUrl) {
        const attachment = await global.utils.getStreamFromURL(imageUrl);
        return message.reply({
          body,
          attachment
        });
      }

      return message.reply(body);
    }
    catch (error) {
      return message.reply(getLang("error", error.message));
    }
  }
};
