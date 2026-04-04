const axios = require("axios");

module.exports = {
  config: {
    name: "pin",
    version: "1.0",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "Pinterest image search",
    longDescription: "Search Pinterest images",
    category: "image",
    guide: "{pn} <query>"
  },

  onStart: async function ({ message, args }) {

    if (!args.length) {
      return message.reply("❌ | Please enter a search query.");
    }

    const query = args.join(" ");

    try {

      const json = await axios.get("https://raw.githubusercontent.com/SAGOR-OFFICIAL-09/api/refs/heads/main/ApiUrl.json");

      const apiBase = json.data.apis.pinterest;

      const api = `${apiBase}/sagor?q=${encodeURIComponent(query)}&limit=10&apikey=sagor`;

      const res = await axios.get(api);

      const images = res.data.images;

      if (!images || images.length === 0) {
        return message.reply("❌ | No images found.");
      }

      const attachments = [];

      for (const img of images) {
        const stream = await axios({
          url: img,
          method: "GET",
          responseType: "stream"
        });

        attachments.push(stream.data);
      }

      message.reply({
        body: `📌 Pinterest results for: ${query}`,
        attachment: attachments
      });

    } catch (err) {
      message.reply("❌ | Failed to fetch images.");
    }

  }
};