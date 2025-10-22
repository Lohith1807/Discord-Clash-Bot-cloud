// compo.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const https = require("https");
const {getEmoji} = require('../../utils/emoji.js')
const { cocApiToken } = require("../../config/config.json");
const COC_API_KEY = cocApiToken;
const COC_API_URL = "https://api.clashofclans.com/v1/clans/";

const thEmojis = {
  17: getEmoji("th17"),
  16: getEmoji("th16"),
  15: getEmoji("th15"),
  14: getEmoji("th14"),
  13: getEmoji("th13"),
  12: getEmoji("th12"),
  11: getEmoji("th11"),
};

function cocFetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { headers: { Authorization: `Bearer ${COC_API_KEY}` } },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(data));
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          });
        }
      )
      .on("error", (err) => reject(err));
  });
}

async function buildClanEmbed(clan) {
  const thCounts = {};
  let totalTH = 0;
  let totalMembers = 0;

  for (const member of clan.memberList) {
    const th = member.townHallLevel;
    thCounts[th] = (thCounts[th] || 0) + 1;
    totalTH += th;
    totalMembers++;
  }

  const sortedTH = Object.entries(thCounts).sort((a, b) => b[0] - a[0]);

  let desc = "";
  for (const [th, count] of sortedTH) {
    const emoji = thEmojis[th] || "🏰";
    desc += `**TH${th}** ${emoji} **${count}**\n`;
  }

  const avgTH = totalMembers > 0 ? (totalTH / totalMembers).toFixed(2) : "N/A";

  return new EmbedBuilder()
    .setTitle(`${clan.name} Townhalls`)
    .setDescription(desc || "No data")
    .setColor("Red")
    .setThumbnail(clan.badgeUrls.medium)
    .setFooter({
      text: `Accounts: ${totalMembers} | Avg Townhall: ${avgTH}`,
    });
}

module.exports = {
  name: "compo",
  description: "Show clan townhall composition",
  async execute(message, args) {
    try {
      await message.delete().catch(() => {});

      if (!args[0]) {
        return message.channel.send("⚠ Usage: `;compo #CLANTAG` or `;compo all`");
      }

      if (args[0].toLowerCase() === "all") {
        return message.channel.send("⚠ The refresh reaction is only available for single clan tag requests.");
      }

      let clanTag = args[0];
      if (!clanTag.startsWith("#")) {
        return message.channel.send("⚠ Please provide a valid clan tag starting with `#`");
      }

      // URL-encode the tag for API
      const encodedTag = clanTag.replace("#", "%23");
      const clan = await cocFetch(`${COC_API_URL}${encodedTag}`);
      const embed = await buildClanEmbed(clan);

      const sentMessage = await message.channel.send({ embeds: [embed] });

      // Add refresh emoji reaction
      await sentMessage.react("🔄");

      // Set up reaction collector (only the original user, only 🔄)
      const filter = (reaction, user) =>
        reaction.emoji.name === "🔄" && user.id === message.author.id;

      const collector = sentMessage.createReactionCollector({ filter, time: 10 * 24 * 60 * 60 * 1000 });

      collector.on("collect", async (reaction, user) => {
        try {
          // Remove user's reaction so they can press it again
          await reaction.users.remove(user.id).catch(() => {});

          const updatedClan = await cocFetch(`${COC_API_URL}${encodedTag}`);
          const updatedEmbed = await buildClanEmbed(updatedClan);

          await sentMessage.edit({ embeds: [updatedEmbed] });
        } catch (err) {
          console.error("❌ Error refreshing clan data:", err);
          await message.channel.send("⚠ Failed to refresh data.");
        }
      });

      collector.on("end", () => {
        // Remove the 🔄 emoji to indicate the refresh is disabled
        sentMessage.reactions.cache.get("🔄")?.remove().catch(() => {});
      });
    } catch (error) {
      console.error("❌ Error in compo command:", error);
      try {
        await message.channel.send("⚠ There was an error processing your command.");
      } catch {}
    }
  },
};
