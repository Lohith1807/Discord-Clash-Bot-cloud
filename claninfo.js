const { cocApiToken } = require("./config.json");
const COC_API_KEY = cocApiToken;
// clan.js (Discord.js v14)
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { getEmoji } = require("./emoji.js");

const dataFile = path.join(__dirname, "clandata.json");
const clanRoleFile = path.join(__dirname, "clanrole.json"); // ✅ new file path

function loadData() {
  if (!fs.existsSync(dataFile)) return {};
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function loadClanRoles() { // ✅ new helper
  if (!fs.existsSync(clanRoleFile)) return {};
  return JSON.parse(fs.readFileSync(clanRoleFile, "utf8"));
}

function fetchClan(tag) {
  return new Promise((resolve, reject) => {
    const url = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(tag)}`;
    const options = {
      headers: { Authorization: `Bearer ${COC_API_KEY}` }
    };

    https.get(url, options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        } else {
          resolve(null);
        }
      });
    }).on("error", reject);
  });
}

function calculateEmbedSize(embed) {
  let size = 0;
  if (embed.data.title) size += embed.data.title.length;
  if (embed.data.description) size += embed.data.description.length;
  if (embed.data.footer?.text) size += embed.data.footer.text.length;
  if (embed.data.author?.name) size += embed.data.author.name.length;
  if (embed.data.fields) {
    for (const field of embed.data.fields) {
      size += field.name.length + field.value.length;
    }
  }
  return size;
}

async function buildClanEmbed(clanTag, data) {
  const clanData = await fetchClan(clanTag);
  if (!clanData) return null;

  const stored = data[clanTag] || { leaders: [], coLeaders: [] };
  const tagNoHash = clanTag.replace("#", "");
  const tagWithHash = encodeURIComponent("#" + tagNoHash);

  const diamondEmoji = getEmoji("whitefwa");
  const leaderEmoji = getEmoji("fwalead");
  const th17Emoji = getEmoji("th17");
  const th16Emoji = getEmoji("th16");
  const th15Emoji = getEmoji("th15");
  const th14Emoji = getEmoji("th14");
  const capitalEmoji = getEmoji("ccw");
  const castleEmoji = getEmoji("clancastle");
  const leagueEmoji = getEmoji("cwl");
  const arrowEmoji = getEmoji("arrow");
  const clashEmoji = getEmoji("coc");
  const crownEmoji = getEmoji("crown");

  let description =
    `${diamondEmoji} **FWA** ${diamondEmoji}\n` +
    `${leaderEmoji} **Accepting:** ${th17Emoji} ${th16Emoji} ${th15Emoji} ${th14Emoji}\n` +
    `${capitalEmoji} **Clan Capital:** ${clanData.clanCapital?.capitalHallLevel || "?"}\n` +
    `${castleEmoji} **Clan Level:** ${clanData.clanLevel}\n` +
    `${leagueEmoji} **CWL:** Lazy Cwl\n\n` +
    `${arrowEmoji} **Open in Game:** [Click Here](https://link.clashofclans.com/en?action=OpenClanProfile&tag=${tagNoHash})\n` +
    `${clashEmoji} **Clash of Stats:** [Click Here](https://www.clashofstats.com/clans/${tagNoHash})\n` +
    `${arrowEmoji} **CC Link:** [Click Here](https://cc.fwafarm.com/cc_n/clan.php?tag=${tagWithHash})\n\n` +
    `${crownEmoji} **Leaders**:\n${stored.leaders.join("\n") || "None"}\n` +
    `${crownEmoji} **Co-Leaders**:\n${stored.coLeaders.join("\n") || "None"}\n\n`;

  if (description.length > 4096) {
    description = description.slice(0, 4093) + "...";
  }

  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle(`${clanData.name} (${clanTag})`)
    .setThumbnail(clanData.badgeUrls.large)
    .setDescription(description);
}

module.exports = {
  name: "clan",
  async execute(client, message, args, commandName) {
    const data = loadData();
    const clanRoles = loadClanRoles(); // ✅ load clanrole.json

    if (message.deletable) message.delete().catch(() => {});

    // ;clans → fetch all clans from JSON (sorted by clan level)
    if (commandName === "clans") {
      const clanTags = Object.keys(data).filter(tag => tag.startsWith("#"));
      if (!clanTags.length) return message.channel.send("No clans stored in clandata.json.");

      const clanEntries = [];
      for (const tag of clanTags) {
        const clanData = await fetchClan(tag);
        if (!clanData) continue;

        const embed = await buildClanEmbed(tag, data);
        if (embed) {
          clanEntries.push({
            tag,
            level: clanData.clanLevel || 0,
            embed
          });
        }
      }

      if (!clanEntries.length) return message.channel.send("Could not fetch info for any stored clans.");

      // ✅ Sort by clan level (highest first)
      clanEntries.sort((a, b) => b.level - a.level);

      // Send in safe chunks (≤10 embeds, ≤6000 characters)
      let chunk = [];
      let totalSize = 0;

      for (const entry of clanEntries) {
        const size = calculateEmbedSize(entry.embed);

        if (chunk.length >= 10 || totalSize + size > 5900) {
          await message.channel.send({ embeds: chunk });
          chunk = [];
          totalSize = 0;
        }

        chunk.push(entry.embed);
        totalSize += size;
      }

      if (chunk.length > 0) {
        await message.channel.send({ embeds: chunk });
      }

      return;
    }

    // ;clan @user
    if (message.mentions.users.size > 0) {
      const userId = message.mentions.users.first().id;
      const entry = Object.entries(data).find(([clanTag, info]) =>
        (info.leaders && info.leaders.includes(`<@${userId}>`)) ||
        (info.coLeaders && info.coLeaders.includes(`<@${userId}>`))
      );

      if (!entry) return message.channel.send("That user is not linked to any clan.");

      const [clanTag] = entry;
      const embed = await buildClanEmbed(clanTag, data);
      if (!embed) return message.channel.send("Could not fetch clan info from Clash of Clans.");

      return message.channel.send({ embeds: [embed] });
    }

    // ✅ ;clan <nickname> support
    if (args[0]) {
      const arg = args[0].toUpperCase();
      let clanTag = null;

      // Check if nickname exists in clanrole.json
      for (const [tag, info] of Object.entries(clanRoles)) {
        if (info.nickName && info.nickName.toUpperCase() === arg) {
          clanTag = tag;
          break;
        }
      }

      // If not found by nickname, check if it's a clan tag
      if (!clanTag) {
        clanTag = arg.startsWith("#") ? arg : `#${arg}`;
      }

      const embed = await buildClanEmbed(clanTag, data);
      if (!embed) return message.channel.send("Could not fetch clan info from Clash of Clans.");

      return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send("Syntax: `;clan #CLANTAG`, `;clan @user`, `;clan nickname`, or `;clans`");
  }
};
