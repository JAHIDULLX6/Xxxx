const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sing",
    aliases: ["song", "music"],
    version: "1.2",
    author: "SaGor",
    countDown: 5,
    role: 0,
    shortDescription: "Download song",
    category: "media",
    guide: "{pn} <song name>"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const react = (e) => api.setMessageReaction(e, event.messageID, event.threadID, () => {}, true);

      const query = args.join(" ");
      if (!query) return react("⚠️");

      react("🔍");

      const search = await yts(query);
      const video = search.videos[0];

      if (!video) return react("❌");

      react("⏳");

      const json = await axios.get("https://raw.githubusercontent.com/SAGOR-OFFICIAL-09/api/refs/heads/main/ApiUrl.json");
      const baseApi = json.data?.apis?.ytdl;

      if (!baseApi) return react("❌");

      const apiUrl = `${baseApi}/api/ytmp3?url=${encodeURIComponent(video.url)}`;

      const res = await axios.get(apiUrl);
      const data = res.data;

      const audioUrl =
        data.downloadUrl ||
        data.url ||
        data.data?.downloadUrl;

      if (!audioUrl) return react("❌");

      const stream = await axios({
        url: audioUrl,
        method: "GET",
        responseType: "stream"
      });

      const filePath = path.join(__dirname, "cache", `${Date.now()}.mp3`);

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        stream.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.sendMessage(
        {
          body: `🎧 ${video.title}\n⏱ ${video.timestamp}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID
      );

      fs.unlinkSync(filePath);

      react("✅");

    } catch {
      api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
    }
  }
};
