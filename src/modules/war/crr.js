const fs = require("fs");
const { EmbedBuilder } = require("discord.js");
const emojis = require("../../utils/emoji.js");

// ✅ Only users with these roles can use this command
const ALLOWED_ROLES = [
  "1153997630112792577", // Head Admin
  "1397128468461916282", // Clan Manager
];

// 🎨 Helper: random color for embeds
function getRandomColor() {
  return Math.floor(Math.random() * 0xffffff);
}

// 🧱 Helper: create embed
function buildEmbed(title, description, color = 0x2ecc71) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

module.exports = {
  name: "removeclanrole",
  description: "Remove a clan-role mapping",

  async execute(message, args) {
    if (!message.content.startsWith(";") || message.author.bot) return;
	 if (message.deletable) message.delete().catch(() => {});
    // 🛑 Role check
    const hasPermission = message.member.roles.cache.some(role =>
      ALLOWED_ROLES.includes(role.id)
    );

    if (!hasPermission) {
      const embed = buildEmbed(
        "🚫 Access Denied",
        "You do not have permission to use this command.",
        0xe74c3c
      );
      return message.reply({ embeds: [embed] });
    }

    // ⚙️ Argument check
    if (args.length < 1) {
      const embed = buildEmbed(
        "⚠️ Missing Clan Tag",
        "Usage: `;crr #CLANTAG`",
        0xe67e22
      );
      return message.reply({ embeds: [embed] });
    }

    const clanTag = args[0].toUpperCase();

    if (!clanTag.startsWith("#")) {
      const embed = buildEmbed(
        "⚠️ Invalid Clan Tag",
        "Clan tag must start with `#`.",
        0xe67e22
      );
      return message.reply({ embeds: [embed] });
    }

    // 📁 Load clanrole.json
    let clanroles = {};
    try {
      clanroles = JSON.parse(fs.readFileSync("./clanrole.json", "utf8"));
    } catch (err) {
      const embed = buildEmbed(
        "⚠️ File Missing",
        "No `clanrole.json` file found.",
        0xe67e22
      );
      return message.reply({ embeds: [embed] });
    }

    // ❌ Check if tag exists
    if (!clanroles[clanTag]) {
      const embed = buildEmbed(
        "❌ Not Found",
        `Clan tag **${clanTag}** is not registered.`,
        0xe74c3c
      );
      return message.reply({ embeds: [embed] });
    }

    // 🗑️ Delete entry
    delete clanroles[clanTag];
    fs.writeFileSync("./clanrole.json", JSON.stringify(clanroles, null, 2));

    // ✅ Success message
    const embed = buildEmbed(
      "🗑️ Clan Role Removed",
      `Clan **${clanTag}** has been successfully removed from the list.`,
      getRandomColor()
    );

    return message.reply({ embeds: [embed] });
  }
};
