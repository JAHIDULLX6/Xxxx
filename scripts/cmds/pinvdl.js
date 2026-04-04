const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "autopdl",
    version: "4.0",
    author: "SaGor",
    role: 0,
    category: "media",
    usePrefix: false
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const { threadID, body } = event;

    if (!body) return;

    const match = body.match(/https?:\/\/[^\s]+/);
    if (!match) return;

    const link = match[0];

    if (!/pin\.it|pinterest/.test(link)) return;

    const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);

    try {
      let msgID;
      api.sendMessage("Downloading...", threadID, (err, info) => {
        if (!err) {
          msgID = info.messageID;
          setTimeout(() => api.unsendMessage(msgID), 5000);
        }
      });

      const apiUrl = `https://media-downloader-api-sagor.vercel.app/api/pinterest/download?url=${encodeURIComponent(link)}`;
      const res = await axios.get(apiUrl);

      let videoUrl;

      if (Array.isArray(res?.data?.data?.downloads)) {
        const list = res.data.data.downloads;

        const mp4s = list
          .filter(i => i.format === "MP4")
          .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

        if (mp4s.length > 0) {
          videoUrl = mp4s[0].url;
        }
      }

      if (!videoUrl) return;

      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, Buffer.from(response.data));

      api.sendMessage(
        {
          body: "Pinterest Video Downloaded",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath)
      );

    } catch (e) {
      api.sendMessage("Download failed", threadID);
    }
  }
};
