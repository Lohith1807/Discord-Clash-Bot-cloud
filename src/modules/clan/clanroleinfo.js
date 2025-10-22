const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const cc = "1410138154484240424";
const ccEmoji = `<:clancastle:${cc}>`;
const { cocApiToken } = require("./config.json");
// Clash of Clans API Key (keep this secure)
const COC_API_KEY = cocApiToken; // loaded from config.json

// Function to fetch clan data
async function fetchClan(tag) {
  const encodedTag = encodeURIComponent(tag); // Encode # to %23
  const url = `https://api.clashofclans.com/v1/clans/${encodedTag}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${COC_API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }

  return await response.json();
}

module.exports = {
  name: 'crinfo',
  description: 'List clans linked',

  async execute(message, args) {
     if (message.deletable) message.delete().catch(() => {});
    let data;
    try {
      const filepath = './clanrole.json';
      data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (err) {
      console.error('❌ Error loading info', err);
      return message.reply('❌ Could not load. Please try again');
    }

    const clanTags = Object.keys(data);
    if (clanTags.length === 0) {
      return message.reply('⚠️ No clans found.');
    }

    const results = [];

    for (const tag of clanTags) {
      try {
        const clan = await fetchClan(tag);
        results.push({ tag: clan.tag, name: clan.name });
      } catch (err) {
        console.error(`❌ Error fetching clan for tag ${tag}:`, err.message);
        results.push({ tag: tag, name: '**Name not found**' });
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${ccEmoji}Blood Alliance Clans`)
      .setColor(0x2ECC71)
      .setDescription(results.map(res => `\`${res.tag}\` — ${res.name}`).join('\n'))
      .setFooter({ text: `Total Clans: ${results.length}` });

    await message.reply({ embeds: [embed] });
  }
};
