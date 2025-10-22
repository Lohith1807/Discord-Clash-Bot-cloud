const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const dataFile = path.join(__dirname, "clandata.json");

// ✅ Allowed roles (only these can use the command)
const ALLOWED_ROLES = [
  "1153997630112792577", // Example: ceo
  "1397128468461916282", // Example: admin
];

// 📂 Helper: load file
function loadData() {
  if (!fs.existsSync(dataFile)) return {};
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// 💾 Helper: save file
function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// 🎨 Helper: build embed
function buildEmbed(description, color = 0x2ecc71) {
  return new EmbedBuilder()
    .setColor(color)
    .setDescription(description)
    .setTimestamp();
}

module.exports = {
  name: "clanlink",
  async execute(client, message, args, commandName) {
    // 🛑 Permission check
    if (!message.member.roles.cache.some(r => ALLOWED_ROLES.includes(r.id))) {
      const noPermEmbed = buildEmbed(
        "🚫 You do not have permission to use this command.",
        0xe74c3c
      ).setTitle("Access Denied");
      return message.reply({ embeds: [noPermEmbed] });
    }
	 if (message.deletable) message.delete().catch(() => {});
    if (!args[0]) {
      return message.reply({
        embeds: [
          buildEmbed(
            "⚠️ Please provide a clan tag.\nExample: `;linklead #CLANTAG @user`",
            0xe67e22
          ).setTitle("Missing Clan Tag")
        ]
      });
    }

    const clanTag = args[0].toUpperCase();
    const mentions = message.mentions.users.map(u => `<@${u.id}>`);
    const data = loadData();

    // 🔗 LINK LEADER
    if (commandName === "linklead") {
      if (mentions.length === 0) {
        return message.reply({
          embeds: [buildEmbed("⚠️ Mention at least one user.", 0xe67e22).setTitle("Missing Mention")]
        });
      }

      if (!data[clanTag]) {
        data[clanTag] = { leaders: [], coLeaders: [] };
      }

      data[clanTag].leaders = [mentions[0]]; // only one leader
      saveData(data);
      return message.reply({
        embeds: [buildEmbed(`✅ Set **Leader** for clan **${clanTag}**: ${mentions[0]}`).setTitle("Leader Linked")]
      });
    }

    // 🔗 LINK CO-LEADERS
    if (commandName === "linkco") {
      if (mentions.length === 0) {
        return message.reply({
          embeds: [buildEmbed("⚠️ Mention at least one user.", 0xe67e22).setTitle("Missing Mention")]
        });
      }

      if (!data[clanTag]) {
        data[clanTag] = { leaders: [], coLeaders: [] };
      }

      data[clanTag].coLeaders = mentions; // multiple co-leaders
      saveData(data);
      return message.reply({
        embeds: [
          buildEmbed(
            `✅ Set **Co-Leaders** for clan **${clanTag}**:\n${mentions.join(", ")}`
          ).setTitle("Co-Leaders Linked")
        ]
      });
    }

    // 🔓 UNLINK LEADER
    if (commandName === "unlead") {
      if (!data[clanTag]) {
        return message.reply({
          embeds: [buildEmbed(`❌ Clan **${clanTag}** not found.`, 0xe74c3c).setTitle("Clan Not Found")]
        });
      }

      if (mentions.length === 0) {
        return message.reply({
          embeds: [buildEmbed("⚠️ Mention the leader you want to remove.", 0xe67e22).setTitle("Missing Mention")]
        });
      }

      data[clanTag].leaders = data[clanTag].leaders.filter(l => !mentions.includes(l));
      saveData(data);
      return message.reply({
        embeds: [
          buildEmbed(`✅ Removed **Leader(s)** from **${clanTag}**:\n${mentions.join(", ")}`, 0xe74c3c)
            .setTitle("Leader Unlinked")
        ]
      });
    }

    // 🔓 UNLINK CO-LEADERS
    if (commandName === "unco") {
      if (!data[clanTag]) {
        return message.reply({
          embeds: [buildEmbed(`❌ Clan **${clanTag}** not found.`, 0xe74c3c).setTitle("Clan Not Found")]
        });
      }

      if (mentions.length === 0) {
        return message.reply({
          embeds: [buildEmbed("⚠️ Mention the co-leader(s) you want to remove.", 0xe67e22).setTitle("Missing Mention")]
        });
      }

      data[clanTag].coLeaders = data[clanTag].coLeaders.filter(c => !mentions.includes(c));
      saveData(data);
      return message.reply({
        embeds: [
          buildEmbed(`✅ Removed **Co-Leader(s)** from **${clanTag}**:\n${mentions.join(", ")}`, 0xe74c3c)
            .setTitle("Co-Leaders Unlinked")
        ]
      });
    }

    // 🗑️ REMOVE CLAN ENTIRELY
    if (commandName === "removeclan") {
      if (!data[clanTag]) {
        return message.reply({
          embeds: [buildEmbed(`❌ Clan **${clanTag}** not found.`, 0xe74c3c).setTitle("Clan Not Found")]
        });
      }

      delete data[clanTag]; // remove clan and all leaders/co-leaders
      saveData(data);
      return message.reply({
        embeds: [
          buildEmbed(`🗑️ Removed clan **${clanTag}** from records.`, 0xe74c3c).setTitle("Clan Removed")
        ]
      });
    }

    // If invalid subcommand:
    return message.reply({
      embeds: [buildEmbed("⚠️ Invalid subcommand used. Use `;linklead`, `;linkco`, `;unlead`, `;unco`, or `;removeclan`.", 0xe67e22).setTitle("Invalid Command")]
    });
  }
};
