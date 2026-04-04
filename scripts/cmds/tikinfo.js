const axios = require("axios");

module.exports = {
  config: {
    name: "tikinfo",
    version: "4.1",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "TikTok Full Info",
    longDescription: "Get full TikTok user info",
    category: "media",
    guide: "{pn} username"
  },

  onStart: async function ({ api, event, args }) {
    const username = args[0];

    if (!username) {
      return api.sendMessage("❌ | Enter username", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const url = `https://tik-info-apis-nx.vercel.app/sagor?username=${username}&apikey=sagor`;

      const res = await axios.get(url);
      const d = res.data.data;

      if (!d) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ | User not found", event.threadID, event.messageID);
      }

      const msg = `
╭───〔 TIKTOK FULL INFO 〕───╮
│ 👤 Username: ${d.username}
│ 📝 Name: ${d.fullname}
│ 🆔 User ID: ${d.userId}
│ 🔑 SecUID: ${d.secUid}
│ 🌍 Region: ${d.region}
│ 🌐 Language: ${d.language}
│
│ 👥 Followers: ${d.followers}
│ ➕ Following: ${d.following}
│ ❤️ Likes: ${d.likes}
│ 🎬 Videos: ${d.videos}
│
│ 📌 Bio:
${d.bio || "No bio available"}
│
│ 🔗 Profile:
https://tiktok.com/@${d.username}
╰────────────────────────╯`;

      await api.sendMessage({
        body: msg,
        attachment: await global.utils.getStreamFromURL(d.profile_image)
      }, event.threadID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ | API Error", event.threadID, event.messageID);
    }
  }
};
