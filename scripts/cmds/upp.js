const os = require("os");

module.exports = {
  config: {
    name: "upp",
    version: "1.1",
    author: "SaGor",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Show stylish bot uptime"
    },
    description: {
      en: "Display bot uptime, ping, RAM usage and system information in a stylish format"
    },
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  langs: {
    en: {
      uptime:
        "╭─❖ 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘\n" +
        "│\n" +
        "│ ⏰ 𝗨𝗽𝘁𝗶𝗺𝗲: %1\n" +
        "│ 📡 𝗣𝗶𝗻𝗴: %2ms\n" +
        "│ 💾 𝗥𝗔𝗠: %3 MB\n" +
        "│ 🖥️ 𝗛𝗼𝘀𝘁: %4\n" +
        "│ ⚙️ 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: %5\n" +
        "│ 🧠 𝗖𝗣𝗨 𝗖𝗼𝗿𝗲𝘀: %6\n" +
        "│ ⌚ 𝗧𝗶𝗺𝗲 𝗡𝗼𝘄: %7\n" +
        "╰─────────────❖"
    }
  },

  onStart: async function ({ message, event, getLang }) {
    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    const ping = Math.max(1, Date.now() - Number(event.timestamp || Date.now()));
    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const host = os.hostname();
    const platform = `${os.type()} ${os.release()}`;
    const cpuCores = os.cpus().length;

    const timeNow = new Date().toLocaleTimeString("en-BD", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    return message.reply(
      getLang("uptime", uptime, ping, ram, host, platform, cpuCores, timeNow)
    );
  }
};
