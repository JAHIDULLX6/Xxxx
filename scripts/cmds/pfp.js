const axios = require("axios");

module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp"],
    version: "2.0",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "Get profile picture",
    category: "utility"
  },

  onStart: async function ({ api, event, args }) {

    let targetID;

    // 👉 mention
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    // 👉 reply
    else if (event.messageReply) {
      targetID = event.messageReply.senderID;
    }

    // 👉 UID
    else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    }

    // 👉 self
    else {
      targetID = event.senderID;
    }

    try {

      // 🔥 TOKEN URL
      const url = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

      await api.sendMessage(
        {
          body: `📷 Profile Picture\n👤 UID: ${targetID}`,
          attachment: await global.utils.getStreamFromURL(url)
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      return api.sendMessage("❌ Failed to get profile picture", event.threadID);
    }
  }
};
