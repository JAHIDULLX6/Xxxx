const axios = require("axios");

const API_KEY = "sagor";
const API_JSON = "https://raw.githubusercontent.com/SAGOR-OFFICIAL-09/api/main/ApiUrl.json";

module.exports = {
  config: {
    name: "emojimix",
    version: "1.1",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "Emoji mix",
    category: "fun",
    guide: "{pn} 🤫👎 or {pn} 🤫 👎"
  },

  onStart: async function ({ message, args }) {

    if (!args.length) {
      return message.reply("❌ | Use: emojimix 🤫👎 or emojimix 🤫 👎");
    }

    let e1, e2;

    if (args.length === 1) {
      const emojis = [...args[0]];
      if (emojis.length < 2)
        return message.reply("❌ | Provide two emojis.");
      e1 = emojis[0];
      e2 = emojis[1];
    } else {
      e1 = args[0];
      e2 = args[1];
    }

    try {
      const json = await axios.get(API_JSON);
      const base = json.data.apis.emojimix;

      const api =
        `${base}/sagor?emoji1=${encodeURIComponent(e1)}&emoji2=${encodeURIComponent(e2)}&apikey=${API_KEY}`;

      const res = await axios.get(api);

      if (res.data.status !== "success") {
        return message.reply("❌ | " + (res.data.message || "API Error"));
      }

      const data = res.data.data;

      if (!data || data.length === 0) {
        return message.reply("❌ | Emoji mix not found.");
      }

      const imgUrl = data[0].image;

      const stream = await axios({
        url: imgUrl,
        method: "GET",
        responseType: "stream"
      });

      return message.reply({
        body: `✨ Emoji Mix\n${e1} + ${e2}`,
        attachment: stream.data
      });

    } catch (err) {
      return message.reply("❌ | API failed.");
    }
  }
};