const { getEmoji } = require("./emoji.js");
const { cocApiToken } = require("./config.json");
// ⚔️ Your CoC API key
const COC_API_KEY = cocApiToken;
const { EmbedBuilder } = require("discord.js");

// --- Utility to fetch JSON safely ---
async function fetchJson(url, headers = {}) {
  try {
    const res = await fetch(url, { headers, timeout: 20000 });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("❌ fetchJson error:", err.message);
    return null;
  }
}

// --- Fetch CoC clan info + members ---
async function fetchCocClanAndMembers(clanTag) {
  const base = "https://api.clashofclans.com/v1";
  const headers = { Authorization: `Bearer ${COC_API_KEY}` };

  const clanRes = await fetchJson(`${base}/clans/${encodeURIComponent(clanTag)}`, headers);
  if (!clanRes) return { clan: null, members: null };

  const membersRes = await fetchJson(`${base}/clans/${encodeURIComponent(clanTag)}/members`, headers);
  return { clan: clanRes, members: membersRes?.items || [] };
}

// --- Fetch FWA data from mirror API (no scraping, works reliably) ---
async function fetchFwaData(tagNoHash) {
  const url = `https://fwa-api.vercel.app/api/clan?tag=${encodeURIComponent(tagNoHash)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "DiscordBot" }, timeout: 15000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
      association: data.association ?? "Unavailable",
      category: data.category ?? "Unavailable",
      points: data.points ?? "N/A",
      activeFwa: !!data.active
    };
  } catch (err) {
    console.warn("⚠️ FWA fetch failed:", err.message);
    return {
      association: "Unavailable",
      category: "Unavailable",
      points: "N/A",
      activeFwa: false
    };
  }
}

// --- Build Discord embed with data ---
function buildEmbedFromData(clan, membersArray, fwa) {
  const leaderObj = membersArray.find(m => m.role === "leader");
  const leaderName = leaderObj?.name || "Unknown";

  const counts = { coLeader: 0, elder: 0, member: 0 };
  membersArray.forEach(m => {
    if (m.role === "coLeader") counts.coLeader++;
    else if (m.role === "admin") counts.elder++;
    else if (m.role === "member") counts.member++;
  });

  const membersCount = `${clan.members || "N/A"}/50`;
  const location = clan.location?.name || "Unknown";
  const warLeague = clan.warLeague?.name || "Unranked";
  const wins = clan.warWins ?? "N/A";
  const losses = clan.warLosses ?? "N/A";
  const draws = clan.warTies ?? "N/A";
  const streak = clan.warWinStreak ?? "N/A";

  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle(`${clan.name} (${clan.tag})`)
    .setThumbnail(clan.badgeUrls?.large || "")
    .addFields(
      {
        name: "👑 Clan Information",
        value: `**Leader:** ${leaderName}\n**Members:** ${membersCount}\n**Location:** ${location}\n**War League:** ${warLeague}`,
        inline: false
      },
      {
        name: "📊 War Statistics",
        value: `**Wins:** ${wins}\n**Losses:** ${losses}\n**Draws:** ${draws}\n**Win Streak:** ${streak}`,
        inline: false
      },
      {
        name: "👥 Leadership",
        value: `**Co-Leaders:** ${counts.coLeader}\n**Elders:** ${counts.elder}\n**Members:** ${counts.member}`,
        inline: false
      },
      {
        name: "📌 FWA Information",
        value:
          `**Association:** ${fwa.association}\n` +
          `**Category:** ${fwa.category}\n` +
          `**Point Balance:** ${fwa.points}\n` +
          `**Active FWA:** ${fwa.activeFwa ? "✅ Yes" : "❌ No"}`,
        inline: false
      },
      {
        name: "🔗 Useful Links",
        value:
          `➡️ [In-Game](https://link.clashofclans.com/en?action=OpenClanProfile&tag=${encodeURIComponent(clan.tag.replace("#", ""))})\n` +
          `➡️ [Clash of Stats](https://www.clashofstats.com/clans/${encodeURIComponent(clan.tag.replace("#", ""))})\n` +
          `➡️ [FWA Tracker](https://cc.fwafarm.com/cc_n/clan.php?tag=%23${encodeURIComponent(clan.tag.replace("#", ""))})\n` +
          `➡️ [FWA Points](https://points.fwafarm.com/clan?tag=${encodeURIComponent(clan.tag.replace("#", ""))})`,
        inline: false
      }
    )
    .setFooter({ text: "Data from Clash of Clans API + FWA Mirror" })
    .setTimestamp();

  return embed;
}

// --- Command Export ---
module.exports = {
  name: "clan",
  description: "Get detailed clan info, war stats, and FWA association.",
  async execute(client, message, args) {
    if (!args[0]) return message.reply("Usage: `;clan #CLANTAG`");

    let clanTag = args[0].toUpperCase();
    if (!clanTag.startsWith("#")) clanTag = "#" + clanTag;
    const tagNoHash = clanTag.replace("#", "");

    try {
      if (message.deletable) message.delete().catch(() => {});

      const { clan, members } = await fetchCocClanAndMembers(clanTag);
      if (!clan) return message.channel.send("❌ Could not fetch clan from Clash of Clans API.");

      const fwa = await fetchFwaData(tagNoHash);
      const embed = buildEmbedFromData(clan, members, fwa);

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("❌ Error in ;clan command:", err);
      return message.channel.send("❌ An error occurred while fetching clan info.");
    }
  }
};
