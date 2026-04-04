const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "bin",
    version: "6.1",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "File/Text uploader",
    category: "utility",
    guide: "{p}bin <filename>\n{p}bin text <text>"
  },

  onStart: async function ({ api, event, args }) {

    if (!args.length) {
      return api.sendMessage("Use: bin <file> or bin text <text>", event.threadID);
    }

    const msg = await api.sendMessage("Processing...", event.threadID);

    try {
      let content = "";
      let name = "text";

      if (args[0].toLowerCase() === "text") {
        content = args.slice(1).join(" ");
        if (!content) {
          await api.unsendMessage(msg.messageID);
          return api.sendMessage("Give text", event.threadID);
        }
      } else {
        const fileName = args[0].replace(/\.js$/, "");

        const paths = [
          path.join(__dirname, "..", "cmds", fileName + ".js"),
          path.join(__dirname, "..", "commands", fileName + ".js"),
          path.join(process.cwd(), "cmds", fileName + ".js"),
          path.join(process.cwd(), "commands", fileName + ".js")
        ];

        const filePath = paths.find(p => fs.existsSync(p));

        if (!filePath) {
          await api.unsendMessage(msg.messageID);
          return api.sendMessage(`File '${fileName}.js' not found`, event.threadID);
        }

        content = fs.readFileSync(filePath, "utf8");
        name = fileName + ".js";
      }

      const res = await axios.post(
        "https://sry-api-nx.vercel.app/upload",
        {
          key: "sagor",
          text: content,
          title: name
        }
      );

      await api.unsendMessage(msg.messageID);

      if (res.data.status !== "success") {
        return api.sendMessage("Upload failed", event.threadID);
      }

      return api.sendMessage(res.data.raw, event.threadID);

    } catch (err) {
      await api.unsendMessage(msg.messageID);
      return api.sendMessage("Error: " + err.message, event.threadID);
    }
  }
};
