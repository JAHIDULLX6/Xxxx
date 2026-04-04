let runningThreads = new Set();

module.exports = {
  config: {
    name: "addactive",
    version: "3.0",
    author: "SaGor",
    role: 2,
    shortDescription: "Add last 7 days active members",
    category: "group",
    guide: "{pn} on / off"
  },

  onStart: async function ({ api, event, args }) {

    const threadID = event.threadID;

    if (args[0] === "off") {
      runningThreads.delete(threadID);
      return api.sendMessage("❌ Add Active System OFF", threadID);
    }

    if (args[0] !== "on") {
      return api.sendMessage("Use: addactive on / off", threadID);
    }

    runningThreads.add(threadID);

    api.sendMessage("✅ Add Active System STARTED", threadID);

    try {

      const currentThread = await api.getThreadInfo(threadID);
      const currentMembers = new Set(currentThread.participantIDs || []);
      const botID = api.getCurrentUserID();

      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const activeMembers = new Set();

      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      for (const thread of threads) {

        if (!thread.isGroup || thread.threadID == threadID) continue;

        try {

          const history = await api.getThreadHistory(thread.threadID, 200);

          for (const msg of history) {

            if (!msg.senderID || !msg.timestamp) continue;

            if (now - msg.timestamp <= sevenDays) {

              if (
                msg.senderID !== botID &&
                !currentMembers.has(msg.senderID)
              ) {
                activeMembers.add(msg.senderID);
              }

            }

          }

        } catch {
          continue;
        }

      }

      const users = [...activeMembers];

      let added = 0;
      let failed = 0;

      for (const uid of users) {

        if (!runningThreads.has(threadID)) break;

        try {

          await api.addUserToGroup(uid, threadID);
          added++;

          await new Promise(r => setTimeout(r, 1200));

        } catch {
          failed++;
        }

      }

      api.sendMessage(
        `✅ ACTIVE ADD COMPLETE

Added: ${added}
Failed: ${failed}`,
        threadID
      );

      runningThreads.delete(threadID);

    } catch (err) {

      api.sendMessage("Error: " + err.message, threadID);

    }

  }
};