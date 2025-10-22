
const { cocApiToken } = require("./config.json");
// ⚠️ COC API token
const COC_API_TOKEN = cocApiToken;
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");


// Emoji IDs for Elixir Troops
const ELIXIR_TROOPS_EMOJIS = {
  barbarian: "1415735258439094395",
  archer: "1415735283768623298",
  giant: "1415735308716212274",
  goblin: "1415735329100660940",
  wallbreaker: "1415735375841984643",
  balloon: "1415735360197103617",
  wizard: "1415735384939303032",
  healer: "1415735399053004921",
  dragon: "1415735446868201583",
  pekka: "1415735407852916930",
  babydragon: "1415735421488332930",
  miner: "1415735472428417214",
  electrodragon: "1415735431936348380",
  yeti: "1415735459241394296",
  flightbomb: "1415735494117167344",
  electrowizard: "1415735484151238839",
  rootrider: "1415735507471827064",
  thrower: "1415735517298950154"
};

// Helper for sending (works for both message + interaction)
function sendReply(ctx, content, isInteraction) {
  if (isInteraction) {
    return ctx.followUp ? ctx.followUp(content) : ctx.channel.send(content);
  } else {
    return ctx.reply(content);
  }
}

// Format troops with emojis into string lines
function formatTroopsWithEmoji(troops) {
  if (!troops.length) return "No data found.";

  return troops.map(t => {
    const key = t.name.toLowerCase().replace(/ /g, "").replace(/-/g, "");
    const emojiId = ELIXIR_TROOPS_EMOJIS[key];
    const emoji = emojiId ? `<:emoji_${key}:${emojiId}>` : "";
    return `${emoji} ${t.name}: ${t.level}/${t.maxLevel}`;
  });
}

// Function to split long text into chunks of max length
function splitLongText(text, maxLength = 1024) {
  const lines = text.split('\n');
  const chunks = [];
  let chunk = "";

  for (const line of lines) {
    if ((chunk + line + '\n').length > maxLength) {
      chunks.push(chunk);
      chunk = "";
    }
    chunk += line + '\n';
  }

  if (chunk) chunks.push(chunk);

  return chunks;
}

module.exports = {
  name: "player",
  description: "Show Clash of Clans player profile",

  async execute(ctx, args, isInteraction = false) {
    const dataFile = path.join(__dirname, "userdata.json");
    let data = {};
    if (fs.existsSync(dataFile)) {
      data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    }

    let tag = null;
    let accounts = [];

    // Case 1: Mentioned user
    if (!isInteraction && ctx.mentions && ctx.mentions.users.size > 0) {
      const user = ctx.mentions.users.first();
      accounts = data[user.id] || [];
    }
    // Case 2: Direct #TAG
    else if (args[0] && args[0].startsWith("#")) {
      tag = args[0];
    }
    // Case 3: Author’s own account
    else if (!isInteraction) {
      accounts = data[ctx.author.id] || [];
    }

    // Case 4: Called from interaction
    if (isInteraction && args[0]) {
      tag = args[0];
    }

    // If multiple accounts linked → show menu
    if (accounts.length > 1 && !tag) {
      const options = accounts.map(acc => ({
        label: `${acc.name} (${acc.tag})`,
        value: acc.tag
      }));

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_player_account")
          .setPlaceholder("Choose an account")
          .addOptions(options)
      );

      return sendReply(ctx, { content: "👉 Select an account:", components: [row] }, isInteraction);
    }

    // Single linked account
    if (accounts.length === 1 && !tag) {
      tag = accounts[0].tag;
    }

    // No tag found
    if (!tag) {
      return sendReply(ctx, "⚠️ No account linked. Use `;link` first or provide a tag.", isInteraction);
    }

    // Fetch player data
    const encodedTag = encodeURIComponent(tag.replace("#", ""));
    try {
      const res = await axios.get(
        `https://api.clashofclans.com/v1/players/%23${encodedTag}`,
        { headers: { Authorization: `Bearer ${COC_API_TOKEN}` } }
      );
      const p = res.data;

      // Filter Elixir troops (home village)
      const elixirTroops = p.troops?.filter(t => t.village === "home") || [];

      // Format troops with emojis and split into chunks
      const formattedTroops = formatTroopsWithEmoji(elixirTroops);
      const chunks = splitLongText(formattedTroops.join("\n"));

      const embed = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({ name: `${p.name} - ${p.tag}` })
        .setDescription(
          `🏰 Town Hall: **${p.townHallLevel}**\n` +
          `🏆 Trophies: **${p.trophies}** | ⭐ War Stars: **${p.warStars}**`
        )
        .addFields(
          { name: "Clan", value: p.clan ? p.clan.name : "Not in a clan", inline: true },
          { name: "Exp Level", value: `${p.expLevel}`, inline: true },
          { name: "League", value: p.league ? p.league.name : "None", inline: true }
        )
        .setFooter({ text: "Clash of Clans Profile" })
        .setTimestamp();

      // Add chunks of elixir troops as multiple fields to avoid length error
      chunks.forEach((chunkText, idx) => {
        embed.addFields({ name: idx === 0 ? "Elixir Troops" : "\u200b", value: chunkText, inline: false });
      });

      return sendReply(ctx, { embeds: [embed] }, isInteraction);

    } catch (err) {
      console.error(err.response?.data || err);
      return sendReply(ctx, "❌ Error fetching player data. Invalid tag?", isInteraction);
    }
  }
};
