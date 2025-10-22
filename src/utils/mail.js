const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

// Load your clan-role-channel mappings
const clanRoles = JSON.parse(fs.readFileSync(path.join(__dirname, "clanrole.json"), "utf-8"));

async function fetchWarData(tag) {
  const url = `https://points.fwafarm.com/clan?tag=${tag.replace("#", "")}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DiscordBot/1.0; +https://yourdomain.com/bot)"
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch war data for ${tag} — status ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Grab the first war row from the table
  const warRow = $(".war-table tbody tr").first();

  if (!warRow || warRow.length === 0) {
    return { status: "no-war" };
  }

  // Extract war details
  const warId = warRow.find(".war-id-cell").text().trim() || "N/A";
  const clanScore = parseInt(warRow.find(".clan-score-cell").text().trim(), 10) || 0;
  const opponentScore = parseInt(warRow.find(".opponent-score-cell").text().trim(), 10) || 0;
  const opponentName = warRow.find(".opponent-name-cell").text().trim() || "Unknown";
  const syncNumber = warRow.find(".sync-number-cell").text().trim() || "N/A";

  // Try to detect war status from a status cell if available
  const warStatusRaw = warRow.find(".war-status-cell").text().trim().toLowerCase() || "";
  // Example detection (adjust this according to actual page)
  const status =
    warStatusRaw.includes("in progress") || warStatusRaw.includes("active")
      ? "current-war"
      : "last-war";

  return {
    status,
    warId,
    clanScore,
    opponentScore,
    opponentName,
    syncNumber,
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("checkallwars")
    .setDescription("Check the latest war results for all linked clans"),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const embeds = [];

      for (const tag of Object.keys(clanRoles)) {
        let warData;

        try {
          warData = await fetchWarData(tag);
        } catch (e) {
          console.error(`Error fetching for ${tag}: ${e.message}`);
          const embed = new EmbedBuilder()
            .setTitle(`Clan: ${tag}`)
            .setDescription(`❌ Failed to fetch war data.\n${e.message}`)
            .setColor("Red");
          embeds.push(embed);
          continue;
        }

        if (warData.status === "no-war") {
          const embed = new EmbedBuilder()
            .setTitle(`Clan: ${tag}`)
            .setDescription("⚠️ No current or last war data found.")
            .setColor("Yellow");
          embeds.push(embed);
          continue;
        }

        const won = warData.clanScore > warData.opponentScore;
        const resultText = won ? "🏆 Win" : "❌ Lose";

        const titlePrefix = warData.status === "current-war" ? "Current War" : "Last War";

        const embed = new EmbedBuilder()
          .setTitle(`${titlePrefix} Report for Clan ${tag}`)
          .setColor(warData.status === "current-war" ? "Green" : "Blue")
          .addFields(
            { name: "Result", value: resultText, inline: true },
            { name: "War ID", value: warData.warId, inline: true },
            { name: "Sync Number", value: warData.syncNumber, inline: true },
            { name: "Opponent", value: warData.opponentName, inline: true },
            { name: "Scores", value: `${warData.clanScore} - ${warData.opponentScore}`, inline: true }
          )
          .setTimestamp();

        embeds.push(embed);
      }

      // Discord limits 10 embeds per message
      const chunkSize = 10;
      for (let i = 0; i < embeds.length; i += chunkSize) {
        const chunk = embeds.slice(i, i + chunkSize);
        if (i === 0) {
          await interaction.editReply({ embeds: chunk });
        } else {
          await interaction.followUp({ embeds: chunk });
        }
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply("Failed to fetch war data for all clans. Please try again later.");
    }
  },
};
