module.exports = {
  config: {
    name: "prefix",
    version: "2.0",
    author: "SaGor",
    role: 0,
    category: "tools",
    shortDescription: "Show bot prefix"
  },

  onStart: async function ({ message, usersData }) {

    const adminID = global.GoatBot.config.adminBot[0];
    const data = await usersData.get(adminID);

    const msg = `┌─❖
│ 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘 : ${global.GoatBot.config.nickNameBot}
│ 🔰 𝗣𝗥𝗘𝗙𝗜𝗫   : ${global.GoatBot.config.prefix}
│ 👤 𝗔𝗗𝗠𝗜𝗡    : ${data.name}
│
│ 🌐 𝗣𝗥𝗢𝗙𝗜𝗟𝗘
│ https://www.facebook.com/profile.php?id=${adminID}
└─❖`;

    return message.reply(msg);
  },

  onChat: async function ({ event, message, usersData }) {

    if (!event.body || event.body.trim().toLowerCase() !== "prefix") return;

    const adminID = global.GoatBot.config.adminBot[0];
    const data = await usersData.get(adminID);

    const msg = `┌─❖
│ 🤖 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘 : ${global.GoatBot.config.nickNameBot}
│ 🔰 𝗣𝗥𝗘𝗙𝗜𝗫   : ${global.GoatBot.config.prefix}
│ 👤 𝗔𝗗𝗠𝗜𝗡    : ${data.name}
│
│ 🌐 𝗣𝗥𝗢𝗙𝗜𝗟𝗘
│ https://www.facebook.com/profile.php?id=${adminID}
└─❖`;

    return message.reply(msg);
  }
};