const fwaClanData = require("./fwadata.js");
const { getEmojiObject } = require("./emoji.js");

module.exports = {
  name: "ww",
  description: "Get FWA weight report for a clan",
  async execute(message, args) {
    const tag = args[0];
    if (!tag) {
      return message.reply("⚠️ Please provide a clan tag. Example: `;ww #CLANTAG`");
    }

    try {
      const pages = await fwaClanData(tag);
      if (pages.length === 0) return message.reply("❌ No data found.");

      let currentPage = 0;

      const leftEmoji = getEmojiObject("larrow");
      const rightEmoji = getEmojiObject("rarrow");

      // Send initial embed
      const msg = await message.channel.send({ embeds: [pages[currentPage]] });

      // React with custom emojis
      await msg.react(leftEmoji.id);
      await msg.react(rightEmoji.id);

      // Filter to only allow the command author and only left/right emoji
      const filter = (reaction, user) =>
        (reaction.emoji.id === leftEmoji.id || reaction.emoji.id === rightEmoji.id) &&
        user.id === message.author.id;

      const collector = msg.createReactionCollector({ filter, time: 30 * 60 * 1000 }); // 30 minutes

      collector.on("collect", async (reaction, user) => {
        try {
          if (reaction.emoji.id === rightEmoji.id && currentPage < pages.length - 1) {
            currentPage++;
          } else if (reaction.emoji.id === leftEmoji.id && currentPage > 0) {
            currentPage--;
          }

          await msg.edit({ embeds: [pages[currentPage]] });

          // Remove the user's reaction to keep UI clean
          await reaction.users.remove(user.id);
        } catch (err) {
          console.error("Reaction collector error:", err);
        }
      });

      collector.on("end", async () => {
        try {
          // Remove all reactions when collector ends
          await msg.reactions.removeAll();
        } catch (err) {
          console.warn("Failed to clear reactions:", err);
        }
      });
    } catch (err) {
      console.error(err);
      message.reply("Failed to fetch FWA weight data. Check the clan tag and try again.");
    }
  }
};
