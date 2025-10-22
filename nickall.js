const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder,
    Collection,
    PermissionsBitField,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags,
    ChannelType, PermissionFlagsBits } = require("discord.js");
const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const { getEmoji } = require("./emoji.js");
const { handleInteraction } = require("./handler.js"); 
const { cocApiToken } = require("./config.json");
const COC_API_TOKEN = cocApiToken;
const prefix = ";";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});


const dataFile = path.join(__dirname, "userdata.json");

// load user data
function loadUserData() {
  if (!fs.existsSync(dataFile)) return {};
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// put your log channel ID here
const logChannelId = "1188515065889050746"; // 👈 replace with your channel ID

// Helper: sleep to avoid rate limit
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "nickall") {
    const userData = loadUserData();
    await message.guild.members.fetch();

    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    for (const [memberId, member] of message.guild.members.cache) {
      if (member.user.bot) continue;

      // Skip if name already starts with BLOOD |
      const currentName = member.nickname || member.user.username;
      if (currentName.toUpperCase().startsWith("BLOOD |")) continue;

      let newNick;

      if (userData[memberId] && userData[memberId].length > 0) {
        const accounts = userData[memberId];

        // Pick highest Town Hall if available
        let account = accounts[0];
        if (accounts.some(acc => acc.th)) {
          account = accounts.reduce((max, acc) =>
            acc.th && acc.th > (max.th || 0) ? acc : max,
            accounts[0]
          );
        }

        newNick = `BLOOD | ${account.name}`;
      } else {
        newNick = `BLOOD | ${member.user.username}`;
      }

      try {
        await member.setNickname(newNick);
        // Log only changed members
        await logChannel.send(`✅ Changed nickname for **${member.user.tag}** → \`${newNick}\``);
      } catch (err) {
        // Optionally log errors if you want
        await logChannel.send(`⚠️ Failed to change nickname for **${member.user.tag}**: \`${err.message}\``);
      }

      // small delay to avoid rate limiting
      await delay(1000);
    }
  }
});

// The bot login should be handled centrally (index.js). Do not login here.
// client.login(token)