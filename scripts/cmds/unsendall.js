module.exports = {
  config: {
    name: "unsendall",
    version: "1.0",
    author: "SaGor",
    role: 2,
    shortDescription: "Unsend all bot messages",
    category: "group"
  },

  onStart: async function ({ api, event }) {

    const threadID = event.threadID;
    const botID = api.getCurrentUserID();

    try {

      const history = await api.getThreadHistory(threadID, 500);

      let count = 0;

      for (const msg of history) {

        if (msg.senderID === botID && msg.messageID) {

          try {
            await api.unsendMessage(msg.messageID);
            count++;
          } catch {}

          await new Promise(r => setTimeout(r, 500));
        }

      }

      api.sendMessage("Unsent messages: " + count, threadID);

    } catch (err) {
      api.sendMessage("Error: " + err.message, threadID);
    }

  }
};