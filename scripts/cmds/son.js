const fs = require("fs");
const path = __dirname + "/cache/son.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

module.exports.config = {
  name: "son",
  version: "1.0",
  author: "SaGor",
  category: "automation",
  role: 0
};

module.exports.onStart = async function ({ api, event, args }) {

  const permission = global.GoatBot.config.adminBot || [];

  if (!permission.includes(event.senderID)) {
    return api.sendMessage("ᴏɴʟʏ ʙᴏᴛ ᴀᴅᴍɪɴ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!", event.threadID, event.messageID);
  }

  let data = JSON.parse(fs.readFileSync(path));

  if (args[0] == "off") {
    delete data[event.threadID];
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage("sᴏɴ ᴏғғ", event.threadID);
  }

  if (args[0] == "on") {

    const mention = Object.keys(event.mentions)[0];
    if (!mention) return api.sendMessage("ᴍᴇɴᴛɪᴏɴ sᴏᴍᴇᴏɴᴇ!", event.threadID);

    data[event.threadID] = {
      uid: mention,
      index: 0
    };

    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    return api.sendMessage(`sᴏɴ sᴛᴀʀᴛᴇᴅ.${event.mentions[mention]}`, event.threadID);
  }

  return api.sendMessage("ᴜsᴀɢᴇ:\ɴsᴏɴ ᴏɴ @ᴜsᴇʀ\ɴsᴏɴ ᴏғғ", event.threadID);
};

module.exports.onChat = async function ({ api, event }) {

  if (!event.body) return;

  let data = JSON.parse(fs.readFileSync(path));

  if (!data[event.threadID]) return;

  const target = data[event.threadID].uid;

  if (event.senderID != target) return;

  const insults = [
    "খাংকির পোলা, তোর মার ভোদা তে গাধার মাল ফালাবো! 😈",
    "আমার সাগর বস তোর মা কে চুদে পল্টি মারবো! 😡",
    "তোর মার গুদে ফুল ট্যাবলেট পুশ করবো! 🤡",
    "তোর মার ভোদায় গাধার মতো মাল ফালিয়ে দেবো! রাকিব বস🔥",
    "তোর মাকে গাধার মতো চুদে বলবো এটা কার মাল? 😂",
    "চুদা খাওয়া তোর মার! 😛",
    "তোর মার গুদে ইনপুট দিয়ে আউটপুট নেবো! 💀"
  ];

  let index = data[event.threadID].index;

  api.sendMessage(
    insults[index % insults.length],
    event.threadID,
    event.messageID
  );

  data[event.threadID].index++;

  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};