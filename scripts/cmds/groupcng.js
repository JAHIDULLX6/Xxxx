const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "gc",
    version: "2.1",
    author: "SaGor",
    role: 0,
    category: "group",
    shortDescription: "Group control",
    guide: {
      en: `
gc name <new name>
gc emoji <emoji>
gc photo (reply image)
gc admin add/remove (reply user)
gc nickname <name> (reply user)
gc theme <theme id>
`
    }
  },

  onStart: async function ({ api, event, args }) {

    const react = (e) => api.setMessageReaction(e, event.messageID, event.threadID, () => {}, true);

    if (!args[0]) {
      return api.sendMessage(
`⚙️ GROUP SETTINGS

gc name <name>
gc emoji <emoji>
gc photo (reply image)
gc admin add/remove (reply user)
gc nickname <name> (reply user)
gc theme <theme id>`,
        event.threadID,
        event.messageID
      );
    }

    const action = args[0].toLowerCase();

    try {

      // CHANGE NAME
      if (action === "name") {

        const name = args.slice(1).join(" ");
        if (!name) return api.sendMessage("❌ | Enter group name", event.threadID);

        react("⏳");
        await api.setTitle(name, event.threadID);
        react("✅");

      }

      // CHANGE EMOJI
      else if (action === "emoji") {

        const emoji = args[1];
        if (!emoji) return api.sendMessage("❌ | Enter emoji", event.threadID);

        react("⏳");
        await api.changeThreadEmoji(emoji, event.threadID);
        react("✅");

      }

      // CHANGE PHOTO
      else if (action === "photo") {

        if (event.type !== "message_reply")
          return api.sendMessage("❌ | Reply to image", event.threadID);

        const url = event.messageReply.attachments[0].url;
        const path = __dirname + "/gc.jpg";

        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(path, Buffer.from(res.data, "binary"));

        react("⏳");
        await api.changeGroupImage(fs.createReadStream(path), event.threadID);

        fs.unlinkSync(path);

        react("✅");

      }

      // ADMIN ADD
      else if (action === "admin" && args[1] === "add") {

        if (event.type !== "message_reply")
          return api.sendMessage("❌ | Reply user", event.threadID);

        const uid = event.messageReply.senderID;

        react("⏳");
        await api.changeAdminStatus(event.threadID, uid, true);
        react("✅");

      }

      // ADMIN REMOVE
      else if (action === "admin" && args[1] === "remove") {

        if (event.type !== "message_reply")
          return api.sendMessage("❌ | Reply admin", event.threadID);

        const uid = event.messageReply.senderID;

        react("⏳");
        await api.changeAdminStatus(event.threadID, uid, false);
        react("✅");

      }

      // NICKNAME
      else if (action === "nickname") {

        if (event.type !== "message_reply")
          return api.sendMessage("❌ | Reply user", event.threadID);

        const name = args.slice(1).join(" ");
        const uid = event.messageReply.senderID;

        if (!name) return api.sendMessage("❌ | Enter nickname", event.threadID);

        react("⏳");
        await api.changeNickname(name, event.threadID, uid);
        react("✅");

      }

      // THEME
      else if (action === "theme") {

        const theme = args[1];
        if (!theme) return api.sendMessage("❌ | Enter theme id", event.threadID);

        react("⏳");
        await api.changeThreadColor(theme, event.threadID);
        react("✅");

      }

      else {
        api.sendMessage("❌ | Invalid option", event.threadID);
      }

    } catch (err) {
      console.log(err);
      react("❌");
      api.sendMessage("⚠️ | Bot must be admin to change group settings.", event.threadID);
    }

  }
};