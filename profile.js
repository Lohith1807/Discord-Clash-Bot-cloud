const { cocApiToken } = require("./config.json");
const token = cocApiToken;

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getEmoji, getEmojiObject } = require("./emoji.js");
const fs = require("fs");
const cocwarEmoji = getEmoji("cocfight");
const arrowEmoji = getEmoji("arrow");
const throphyEmoji = getEmoji("throphy");
const leftEmoji = getEmojiObject("larrow");
const rightEmoji = getEmojiObject("rarrow");
const uparrowEmoji = getEmoji("uparrow");
const downarrowEmoji = getEmoji("downarrow");
const graphEmoji = getEmoji("graph");
const cgEmoji = getEmoji("clangames");
const capitalgoldEmoji = getEmoji("capitalgold");
const ccEmoji = getEmoji("clancastle");
const crownEmoji = getEmoji("crown");
const xpEmoji = getEmoji("xp");
const sheildEmoji = getEmoji("sheild");
const whitefwaEmoji = getEmoji("whitefwa");
const cocEmoji = getEmoji("coc");

function formatRole(role) {
  if (!role) return "None";
  switch (role.toLowerCase()) {
    case "leader": return "Leader";
    case "coleader": return "Co-Leader";
    case "admin": return "Elder";
    case "member": return "Member";
    default: return role;
  }
}

function loadUserData() {
  try {
    const raw = fs.readFileSync("userdata.json", "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

async function fetchPlayer(tag) {
  const cleanTag = tag.replace("#", "").toUpperCase();
  const response = await fetch(
    `https://api.clashofclans.com/v1/players/%23${cleanTag}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error fetching data (Status ${response.status}): ${errorText}`);
  }
  return await response.json();
}

module.exports = {
  name: "profile",
  description: "Show linked Clash of Clans accounts or fetch by tag",
  async execute(message, args) {
    let targetUser = null;
    let tagArg = null;
    await message.delete().catch(() => {});

    if (args.length === 0) {
      targetUser = message.author;
    } else if (message.mentions.users.size > 0) {
      targetUser = message.mentions.users.first();
    } else if (args[0].startsWith("#")) {
      tagArg = args[0];
    } else {
      targetUser = message.author;
    }

    const userData = loadUserData();

    // Direct lookup by tag
    if (tagArg) {
      try {
        const data = await fetchPlayer(tagArg);
        const thEmoji = getEmoji(`th${data.townHallLevel}`) || "<:th8:1154298019328565348>";
        const openInGame = `[Open in Game](https://link.clashofclans.com/en/?action=OpenPlayerProfile&tag=${encodeURIComponent(data.tag)})`;
		const fwaLink = `[Chocolate Clash](https://cc.fwafarm.com/cc_n/member.php?tag=${encodeURIComponent(data.tag)})`;
  
// Town Hall image URLs (11–17)
const thImages = {
  11: "https://images-ext-1.discordapp.net/external/s4kOlzYIsU1oiUcyMxsjlrilmed2yhcJo1GzmLr9NBc/https/assets.clashk.ing/home-base/town-hall-pics/town-hall-11.png?format=webp&quality=lossless&width=236&height=263",
  12: "https://images-ext-1.discordapp.net/external/PJBaOL8V_NLzuWrr3EQK54KO-l9iCVMm2AyDJcOvFps/https/assets.clashk.ing/home-base/town-hall-pics/town-hall-12.png?format=webp&quality=lossless&width=229&height=254",
  13: "https://images-ext-1.discordapp.net/external/cnrNFhgjVfVCCYxYCInKziyJs4xqfShmw1rvQKP0gpI/https/assets.clashk.ing/home-base/town-hall-pics/town-hall-13.png?format=webp&quality=lossless&width=255&height=263",
  14: "https://images-ext-1.discordapp.net/external/bekXanAALUUMv_M_tKV8TtRCh682CqWcxPMY4sHxeBE/https/assets.clashk.ing/home-base/town-hall-pics/town-hall-14.png?format=webp&quality=lossless&width=255&height=271",
  15: "https://images-ext-1.discordapp.net/external/7n_mhahmF5iXGgrv7Ps2itUZQIDva-WeUTO2cGydh7Y/https/assets.clashk.ing/home-base/town-hall-pics/town-hall-15.png?format=webp&quality=lossless&width=250&height=275",
  16: "https://images-ext-1.discordapp.net/external/3KA43gX30pOW3X8wugaS8eP5RswjPeNX07yqa12dh8s/https/assets.clashk.ing/home-base/town-hall-pics/town-hall-16.png?format=webp&quality=lossless&width=690&height=864",
  17: "https://images-ext-1.discordapp.net/external/MILVrSQyhUmOWrxNJKMtcXTKmZcv37Yp3US-OmQ1lqI/https/assets.clashk.ing/home-base/town-hall-pics/town-hall-17.png?format=webp&quality=lossless&width=1030&height=1030"
};

// Fallback thumbnail for TH < 11
const defaultThumbnail = "https://static.wikia.nocookie.net/clashofclans/images/6/6d/Town_Hall1.png";

const townHallLevel = data.townHallLevel;
const thumbnailUrl = thImages[townHallLevel] || defaultThumbnail;

const embed = new EmbedBuilder()
  .setColor(0x9B59B6) 
  .setTitle(`Clash of Clans - ${data.name}™`)
  .setThumbnail(thumbnailUrl)
  .setDescription(
    `**════ Profile Info ════**\n` +
    `**Tag:** \`${data.tag}\`\n` +
    `**Clan:** ${data.clan?.name || "None"} ${data.clan?.tag ? `(\`${data.clan.tag}\`)` : ""}\n` +
    `**Role:** ${formatRole(data.role)}\n` +
    `${thEmoji}:${data.townHallLevel}\t\t ${xpEmoji}:${data.expLevel}\t\t\n\n` +

    `**— Battles & Trophies —**\n` +
    `${throphyEmoji} **Trophies:** ${data.builderBaseTrophies || 0} / ${data.trophies || 0}\n` +
    `${cocwarEmoji} **Attack Wins:** ${data.attackWins || 0}\n` +
    `${sheildEmoji} **Defense Wins:** ${data.defenseWins || 0}\n` +
    `${cocEmoji} **War Stars:** ${data.warStars || 0}\n\n` +

    `**— Donations —**\n` +
    `${uparrowEmoji} **Donated:** ${data.donations}\n` +
    `${downarrowEmoji} **Received:** ${data.donationsReceived}\n` +
    `${graphEmoji} **Ratio:** ${(data.donations / (data.donationsReceived || 1)).toFixed(2)}\n\n` +

    `**— Key Achievements —**\n` +
    `${ccEmoji} **Total Donations:** ${data.achievements?.find(a => a.name === "Friend in Need")?.value || 0}\n` +
    `${throphyEmoji} **Best Trophies:** ${data.bestTrophies || 0}\n` +
    `${cgEmoji} **Clan Games:** ${data.achievements?.find(a => a.name === "Games Champion")?.value || 0}\n` +
    `${cocwarEmoji} **Capital Gold Raided:** ${data.achievements?.find(a => a.name === "Most Valuable Clanmate")?.value || 0}\n` +
    `${capitalgoldEmoji} **Capital Gold Donated:** ${data.achievements?.find(a => a.name === "Clan Capital Contributions")?.value || 0}\n\n` +

    `${arrowEmoji} ${openInGame}\n` +
    `${whitefwaEmoji} ${fwaLink}`
  )
  .setTimestamp();




        return message.channel.send({ embeds: [embed] });
      } catch (err) {
        return message.channel.send(`❌ Could not fetch tag ${tagArg}: ${err.message}`);
      }
    }

    // No tag given — show linked accounts
    const userId = targetUser.id;
    if (!userData[userId] || userData[userId].length === 0) {
      return message.channel.send(
        `⚠️ ${targetUser.username} has not linked any Clash of Clans accounts yet.`
      );
    }

    // Fetch linked accounts data
    const accounts = [];
    for (const account of userData[userId]) {
      try {
        const data = await fetchPlayer(account.tag);
        const openInGame = `[Open in Game](https://link.clashofclans.com/en/?action=OpenPlayerProfile&tag=${encodeURIComponent(data.tag)})`;
        const thEmoji = getEmoji(`th${data.townHallLevel}`) || "<:th8:1154298019328565348>";

        accounts.push({
          name: `${thEmoji} ${data.name} • ${data.tag}`,
          value:
            `• **Clan:** ${data.clan?.name || "None"}\n` +
            `• **Role:** ${formatRole(data.role)}\n` +
            `• **Trophies:** ${throphyEmoji} ${data.trophies || 0}\n` +
            `• **Attack:** ${data.attackWins || 0} | **War Stars:** ${data.warStars || 0}\n` +
            `${arrowEmoji} ${openInGame}`,
          townHallLevel: data.townHallLevel,
        });
      } catch (err) {
        accounts.push({
          name: `❌ Account ${account.tag}`,
          value: `Error fetching data.`,
          townHallLevel: 0,
        });
      }
    }

    accounts.sort((a, b) => b.townHallLevel - a.townHallLevel);

    let page = 0;
    const perPage = 5;
    const totalPages = Math.ceil(accounts.length / perPage);

    const getEmbed = (pg) => {
      const start = pg * perPage;
      const currentAccounts = accounts.slice(start, start + perPage);

      return new EmbedBuilder()
        .setTitle(`Profile of ${targetUser.tag} (Page ${pg + 1}/${totalPages})`)
        .setColor(0x5865F2)
        .addFields(currentAccounts)
        .addFields([{ name: "👤 Linked Discord", value: `<@${targetUser.id}>` }])
        .setFooter({ text: "Use your reaction buttons to change pages." })
        .setTimestamp();
    };

    const msg = await message.channel.send({ embeds: [getEmbed(page)] });

    // React with your custom emojis using their IDs
    await msg.react(leftEmoji.id);
    await msg.react(rightEmoji.id);

    const filter = (reaction, user) =>
      [leftEmoji.id, rightEmoji.id].includes(reaction.emoji.id) &&
      user.id === message.author.id;

    const collector = msg.createReactionCollector({ filter, time: 300000 });

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.id === leftEmoji.id) {
          page = page > 0 ? page - 1 : totalPages - 1;
        } else if (reaction.emoji.id === rightEmoji.id) {
          page = (page + 1) % totalPages;
        }

        await msg.edit({ embeds: [getEmbed(page)] });
        await reaction.users.remove(user.id);
      } catch (err) {
        console.error("Collector error:", err.message);
      }
    });

  collector.on("end", async () => {
  try {
    await msg.reactions.removeAll();
    await msg.delete().catch(() => {});  // Delete the message, ignore errors if already deleted
  } catch (err) {
    console.warn("Failed to remove reactions or delete message:", err.message);
 	 }
	});
  },
};
