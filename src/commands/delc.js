const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

// ✅ Only these roles can use this command
const ALLOWED_ROLES_DELETE = ["1397128468461916282", "1153997630112792577"];

// 🎨 Helper: random color
function getRandomColor() {
  return Math.floor(Math.random() * 0xffffff);
}

// 🧱 Helper: build embed
function buildEmbed(title, description, color = 0x2ecc71) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

module.exports = {
  name: "delc",
  description: "Deletes the current category and all its channels",
  async run(client, message, args) {
       if (message.deletable) message.delete().catch(() => {});
    // 🔒 Role Check
    const hasPermission = message.member.roles.cache.some(role =>
      ALLOWED_ROLES_DELETE.includes(role.id)
    );

    if (!hasPermission) {
      const embed = buildEmbed(
        "🚫 Access Denied",
        "You do not have permission to use this command.",
        0xe74c3c
      );
      return message.reply({ embeds: [embed] });
    }

    // 🏷️ Check if inside a category
    const category = message.channel.parent;
    if (!category) {
      const embed = buildEmbed(
        "⚠️ Invalid Channel",
        "This channel is not inside a category.",
        0xe67e22
      );
      return message.reply({ embeds: [embed] });
    }

    // ⚠️ Ask for confirmation
    const confirmEmbed = buildEmbed(
      "⚠️ Confirm Deletion",
      `Are you sure you want to delete **${category.name}** and all its channels?\n\nReact with ✅ to confirm or ❌ to cancel.`,
      0xf1c40f
    );
    const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

    await confirmMsg.react("✅");
    await confirmMsg.react("❌");

    const filter = (reaction, user) => {
      if (!["✅", "❌"].includes(reaction.emoji.name)) return false;
      if (user.id !== message.author.id) {
        reaction.users.remove(user.id).catch(() => {});
        return false;
      }
      return true;
    };

    try {
      const collected = await confirmMsg.awaitReactions({ filter, max: 1, time: 15000 });
      const reaction = collected.first();

      if (reaction.emoji.name === "✅") {
        // ✅ Success message before deletion
        const startEmbed = buildEmbed(
          "🗑️ Deletion Started",
          `Deleting category **${category.name}** and all its channels...`,
          0x3498db
        );
        await message.channel.send({ embeds: [startEmbed] });

        // Delete all child channels
        const children = message.guild.channels.cache.filter(c => c.parentId === category.id);
        for (const ch of children.values()) {
          await ch.delete().catch(console.error);
        }

        // Delete the category
        await category.delete().catch(console.error);

        const doneEmbed = buildEmbed(
          "✅ Deletion Complete",
          `Category **${category.name}** and all its channels have been deleted.`,
          getRandomColor()
        );
        return message.channel.send({ embeds: [doneEmbed] });

      } else {
        const cancelEmbed = buildEmbed(
          "❌ Deletion Cancelled",
          "You cancelled the deletion process.",
          0xe74c3c
        );
        return message.reply({ embeds: [cancelEmbed] });
      }
    } catch {
      const timeoutEmbed = buildEmbed(
        "⏳ Timeout",
        "No reaction received within 15 seconds. Deletion cancelled.",
        0xe67e22
      );
      return message.reply({ embeds: [timeoutEmbed] });
    }
  }
};
