module.exports = {
  config: {
    name: "anti",
    version: "1.1",
    author: "SaGor",
    role: 0,
    shortDescription: "Re-add if user leaves (not when kicked)",
    category: "box chat"
  },

  onStart: async function () {},

  onEvent: async function ({ api, event }) {
    try {

      if (event.logMessageType === "log:unsubscribe") {

        const leftUser = event.logMessageData.leftParticipantFbId;
        const author = event.author;

        // if admin kick → do nothing
        if (author !== leftUser) return;

        // if bot leave → ignore
        if (leftUser === api.getCurrentUserID()) return;

        try {

          await api.addUserToGroup(leftUser, event.threadID);

          const info = await api.getUserInfo(leftUser);
          const name = info[leftUser].name;

          api.sendMessage({
            body: `😹 ${name} কোথায় যাস? আবার গ্রুপে ঢুক 😹`,
            mentions: [{ tag: name, id: leftUser }]
          }, event.threadID);

        } catch (e) {
          console.log("Can't re-add user");
        }
      }

    } catch (error) {
      console.error(error);
    }
  }
};