module.exports = {
  config: {
    name: "role",
    version: "5.0",
    author: "SaGor",
    role: 10,
    shortDescription: "Role panel system",
    category: "config"
  },

  onStart: async function ({ api, event, args, message }) {

    const config = global.GoatBot.config;

    const roleMap = {
      rootOwner: "Root Owner",
      managerUsers: "Manager",
      supportUsers: "Support",
      modUsers: "Moderator",
      vipUsers: "VIP",
      devUsers: "Developer",
      premiumUsers: "Premium",
      adminBot: "Admin"
    };

    // ROLE PANEL
    if (args[0] === "panel" || !args[0]) {

      return message.reply(`╭─❖ ROLE PANEL
│
│ 🔰 role 7 add @user
│ 🔰 role 2 remove @user
│
│ 📜 role list
│ 🔎 role check @user
│
│ 💡 reply → role 7 add
╰─────────────`);
    }

    // ROLE LIST
    if (args[0] === "list") {

      let msg = "📜 ROLE LIST\n\n";

      for (const key in roleMap) {

        const users = config[key] || [];

        if (!users.length) {
          msg += `• ${roleMap[key]} : none\n\n`;
          continue;
        }

        msg += `• ${roleMap[key]} :\n`;

        for (const uid of users) {

          const info = await api.getUserInfo(uid);
          const name = info[uid]?.name || "Unknown";

          msg += `- ${name} (${uid})\n`;
        }

        msg += "\n";
      }

      return message.reply(msg);
    }

    // GET UID
    let uid;

    if (Object.keys(event.mentions).length > 0)
      uid = Object.keys(event.mentions)[0];
    else if (event.messageReply)
      uid = event.messageReply.senderID;
    else
      uid = args[1];

    // ROLE CHECK
    if (args[0] === "check") {

      if (!uid)
        return message.reply("⚠ Tag / reply / uid needed");

      let roles = [];

      for (const key in roleMap) {
        if ((config[key] || []).includes(uid))
          roles.push(roleMap[key]);
      }

      const info = await api.getUserInfo(uid);
      const name = info[uid]?.name || uid;

      if (!roles.length)
        return message.reply(`👤 ${name}\nNo role assigned.`);

      return message.reply(
        `👤 Name: ${name}\nUID: ${uid}\n\nRoles:\n• ${roles.join("\n• ")}`
      );
    }

    return message.reply("⚠ Use: role panel / role list / role check @user");
  }
};