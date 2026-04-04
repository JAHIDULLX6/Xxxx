const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
config: {
name: "uptime",
aliases: ["upt","up","rtm"],
version: "10.0",
author: "SAGOR",
countDown: 5,
role: 0,
shortDescription: "Stylish uptime canvas",
longDescription: "Uptime bar with canvas",
category: "system",
guide: "{pn}"
},

onStart: async function ({ api, event }) {

const react = (e) => api.setMessageReaction(e, event.messageID, event.threadID, () => {}, true);

try {

  react("⏳");

  const canvas = Canvas.createCanvas(500, 200);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const uptime = process.uptime();

  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const percent = Math.min(100, (uptime / 86400) * 100);

  ctx.fillStyle = "#555";
  ctx.fillRect(50, 120, 400, 30);

  let fillColor = "#00FF00";

  if (percent < 30) fillColor = "#FF0000";
  else if (percent < 70) fillColor = "#FFFF00";
  else if (percent < 95) fillColor = "#FFA500";

  ctx.fillStyle = fillColor;
  ctx.fillRect(50, 120, 4 * percent, 30);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 120, 400, 30);

  ctx.fillStyle = "#ffffff";
  ctx.font = "22px Arial";

  ctx.fillText(`Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`, 50, 80);
  ctx.fillText(`Progress: ${percent.toFixed(1)}%`, 50, 180);

  const cachePath = path.join(__dirname, "cache");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

  const imgPath = path.join(cachePath, "uptime.png");

  fs.writeFileSync(imgPath, canvas.toBuffer());

  react("✅");

  await api.sendMessage({
    attachment: fs.createReadStream(imgPath)
  }, event.threadID, () => fs.unlinkSync(imgPath));

} catch (err) {

  console.log(err);
  react("❌");

  api.sendMessage("⚠️ Uptime canvas error.", event.threadID);
}

}
};