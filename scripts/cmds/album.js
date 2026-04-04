const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API = "https://sagor-apis-xyz.vercel.app";
const KEY = "sagor";

const lastVideo = {};

module.exports = {
config: {
name: "album",
version: "4.0",
author: "SAGOR",
role: 0,
countDown: 5,
category: "media"
},

onStart: async function ({ api, event, args }) {

try {

// CATEGORY MENU
if (!args[0]) {

const res = await axios.get(`${API}/category/list?key=${KEY}`);
const categories = res.data.categories;

let msg = "╔════『 📂 ALBUM MENU 』════╗\n\n";

categories.forEach((c,i)=>{
msg += `${i+1} ➤ ${c.toUpperCase()}\n`;
});

msg += "\n╚════════════════════════╝";
msg += "\n🔰 REPLY WITH NUMBER";

api.sendMessage(msg,event.threadID,(err,info)=>{

global.GoatBot.onReply.set(info.messageID,{
commandName:this.config.name,
author:event.senderID,
categories,
menu:info.messageID
});

});

return;

}


// VIDEO LIST
if (args[0] === "list") {

const res = await axios.get(
`${API}/video/list?key=${KEY}&name=${args[1]}`
);

let msg = `📂 ${args[1]} videos\n\n`;

res.data.videos.forEach(v=>{
msg += `${v.id}. ${v.url}\n`;
});

return api.sendMessage(msg,event.threadID);

}


// ADD VIDEO
if (args[0] === "add") {

if (!event.messageReply)
return api.sendMessage("⚠️ Reply video",event.threadID);

const video = event.messageReply.attachments[0].url;

const res = await axios.get(
`${API}/category/add?key=${KEY}&name=${args[1]}&url=${encodeURIComponent(video)}`
);

return api.sendMessage(
`✅ Video Added\n📂 ${args[1]}\n🎬 Total: ${res.data.total}`,
event.threadID
);

}


// RANDOM / SPECIFIC VIDEO
const category = args[0];

let videoURL;

// specific video
if (args.length === 2 && !isNaN(args[1])) {

const res = await axios.get(
`${API}/video/list?key=${KEY}&name=${category}`
);

const videos = res.data.videos;
const index = parseInt(args[1]) - 1;

if (!videos[index])
return api.sendMessage("❌ Video not found",event.threadID);

videoURL = videos[index].url;

}

// random video
else {

const res = await axios.get(
`${API}/category/get?key=${KEY}&name=${category}`
);

videoURL = res.data.video;

if (lastVideo[category] === videoURL) {

const newRes = await axios.get(
`${API}/category/get?key=${KEY}&name=${category}`
);

videoURL = newRes.data.video;

}

lastVideo[category] = videoURL;

}


// GET VIDEO COUNT
const list = await axios.get(
`${API}/video/list?key=${KEY}&name=${category}`
);

const total = list.data.videos.length;


// DOWNLOAD VIDEO
const cache = path.join(__dirname,"cache");

if (!fs.existsSync(cache))
fs.mkdirSync(cache);

const file = path.join(cache,`${Date.now()}.mp4`);

const video = await axios({
url: videoURL,
method: "GET",
responseType: "arraybuffer"
});

fs.writeFileSync(file,Buffer.from(video.data));

api.sendMessage({
body:`🎬 ${category.toUpperCase()}\n📊 Total Videos: ${total}`,
attachment:fs.createReadStream(file)
},event.threadID,()=>fs.unlinkSync(file));

}catch(err){

console.log(err);
api.sendMessage("❌ API Error",event.threadID);

}

},


// REPLY SELECT
onReply: async function ({ api,event,Reply }) {

if(event.senderID !== Reply.author) return;

const num = parseInt(event.body);

if(isNaN(num)) return;

const category = Reply.categories[num-1];

const res = await axios.get(
`${API}/category/get?key=${KEY}&name=${category}`
);

const videoURL = res.data.video;

const list = await axios.get(
`${API}/video/list?key=${KEY}&name=${category}`
);

const total = list.data.videos.length;

const cache = path.join(__dirname,"cache");

const file = path.join(cache,`${Date.now()}.mp4`);

const video = await axios({
url:videoURL,
method:"GET",
responseType:"arraybuffer"
});

fs.writeFileSync(file,Buffer.from(video.data));

api.sendMessage({
body:`🎬 ${category.toUpperCase()}\n📊 Total Videos: ${total}`,
attachment:fs.createReadStream(file)
},event.threadID,()=>fs.unlinkSync(file));

api.unsendMessage(Reply.menu).catch(()=>{});
api.unsendMessage(event.messageID).catch(()=>{});

}

};
