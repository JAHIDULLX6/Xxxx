const axios = require("axios");

module.exports = {
 config: {
 name: "dl",
 version: "1.0",
 author: "SaGor",
 countDown: 5,
 role: 0,
 shortDescription: "Stream media from URL",
 longDescription: "Streams a video or image from the given URL without downloading",
 category: "utility",
 guide: "{pn} <media_url>"
 },

 onStart: async function ({ api, event, args }) {
 const url = args[0];

 if (!url || !/^https?:\/\//.test(url)) {
 return api.sendMessage("❌ Please provide a valid media URL.\nExample: /dl https://example.com/image.jpg", event.threadID, event.messageID);
 }

 try {
 const res = await axios.get(url, { responseType: "stream" });
 const contentType = res.headers["content-type"];

 if (!["image", "video"].some(type => contentType.startsWith(type))) {
 return api.sendMessage("❌ Unsupported media type. Only direct image or video links are allowed.", event.threadID, event.messageID);
 }

 api.sendMessage({
 body: `🔗 Streaming: ${url}`,
 attachment: res.data
 }, event.threadID, event.messageID);

 } catch (e) {
 api.sendMessage("❌ Failed to stream media. The link may be invalid or blocked.", event.threadID, event.messageID);
 }
 }
};
