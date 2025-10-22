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
const { botToken, cocApiToken } = require("./config/config.json");
const handler = require("./utils/handler");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const { getEmoji } = require("./utils/emoji.js");
const { handleInteraction } = require("./utils/handler.js"); 
const COC_API_TOKEN = cocApiToken;

const token = botToken;

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

// Startup event
client.once("ready", () => {
    console.log(`✅ Bot connected as ${client.user.tag}`);
    client.user.setPresence({
        status: "dnd",
        activities: [
            {
                name: "Blood Alliance !!",
                type: 3 // 👀 3 = Watching
            }
        ]
    });
});


// other file commands loaderr.........
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    try {
        if (commandName === "link") {
            const command = require("./commands/link.js");
            await command.execute(message, args);

        } else if (commandName === "profile" || commandName === "p") {
            const command = require("./commands/profile.js");
            await command.execute(message, args);

        } else if (commandName === "unlink") {
            const command = require("./commands/unlink.js");
            await command.execute(message, args);

        } else if (commandName === "cc" || commandName === "check") {
            const command = require("./commands/cc.js");
            await command.execute(message, args);
        } else if (commandName === "ww") {
 		    const command = require("./modules/war/ww.js");
    		await command.execute(message, args);
		} else if (commandName === "clansetup" || commandName === "cr") {
 		    const command = require("./modules/clan/clansetup.js");
    		await command.execute(message, args);
		} else if (commandName === "clansetupremove" || commandName === "crr") {
 		    const command = require("./modules/clan/clansetupremove.js");
    		await command.execute(message, args);
		} else if (commandName === 'crinfo') {
        	const command = require('./clanroleinfo.js');
        	command.execute(message, args);
    	} else if (commandName === 'player') {
        	const command = require('./player.js');
        	command.execute(message, args);
    	} else if (commandName === 'ls') {
        	const command = require('./linkedlist.js');
        	command.execute(message, args);
    	} else if (commandName === 'cctest') {
        	const command = require('./cctest.js');
        	command.execute(message, args);
    	} else if (["linklead", "linkco", "unlead", "unco", "removeclan"].includes(commandName)) {
            const command = require("./clanlink.js");
            await command.execute(client, message, args, commandName);

        } else if (["clan", "clans"].includes(commandName)) {
            const command = require("./claninfo.js");
            await command.execute(client, message, args, commandName);

        } else if (commandName === "ahelp") {
    		const { ahelp } = require("./help.js");
   			await ahelp.execute(message, args, client);

		} else if (commandName === "help") {
   			const { help } = require("./help.js");
    	    await help.execute(message, args, client);
            
		} else if (commandName === "ccc") {
            const command = require("./ccc.js");
            await command.run(client, message, args);

        } else if (commandName === "delc") {
            const command = require("./delc.js");
            await command.run(client, message, args);

        } else if (commandName === "delete") {
            const command = require("./delete.js");
            await command.run(client, message, args);
        } else if (commandName === "cwl") {
            const command = require("./cwl.js");
            await command.run(client, message, args);
        } else if (commandName === "compo") {
            const command = require("./compo.js");
            await command.execute(message, args);
        }

    } catch (err) {
        console.error(err);
        message.channel.send("⚠️ There was an error executing that command.");
    }
});
// ! cmds loaderrrrr
client.on("messageCreate", async (message) => {
    const prefix = "!";
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    try {
       if (commandName === "fwa") { 
       const command = require("./fwa.js"); 
       await command.execute(message, args); 
       } else if (commandName === "bases") { 
         const command = require("./bases.js"); 
         await command.execute(message, args); 
       } else if (commandName === "cwl") {
         const command = require("./cwl.js");
         await command.execute(client, message, args); // ✅ FIXED
        } else if (commandName === "lsc") {
         const command = require("./linkedlistclan.js");
         await command.execute(message, args); // ✅ FIXED
        } else if (commandName === "clan") {
         const command = require("./clan.js");
        await command.execute(client, message, args, command); // ✅ FIXED
        } else if (commandName === "war") { 
         const command = require("./war.js"); 
         await command.execute(message, args); 
       }
    } catch (err) {
        console.error(err);
        message.channel.send("⚠️ There was an error executing that command.");
    }
});

// ===============================
// Sync command autoload
// ===============================
const syncCommand = require("./sync.js");
if (syncCommand.setupWarChecker) {
    syncCommand.setupWarChecker(client);
}

client.on("messageCreate", async (message) => {
    const prefix = ";";
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    try {
        if (commandName === "sync") {
            await syncCommand.execute(client, message, args);
        }
    } catch (err) {
        console.error(err);
        message.channel.send("⚠️ There was an error executing that command.");
    }
});


const roleMention = '<@&1394230094675050616>';
const arrow = getEmoji("arrow");
const alaram = getEmoji("alaram");
const heart = getEmoji("heart");
// Helper: generate random hex color number
function getRandomColor() {
    return Math.floor(Math.random() * 0xFFFFFF);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (message.content.startsWith('!sync')) {
        const args = message.content.slice('!sync'.length).trim();

        if (!args) {
            await message.reply('❌ Please provide the time/message (e.g. `!sync <t:TIMESTAMP:F>`).');
            return;
        }

        const guildName = message.guild.name;
        const guildIcon = message.guild.iconURL({ dynamic: true });

        const embed = new EmbedBuilder()
            .setColor(getRandomColor())
            .setAuthor({ name: guildName, iconURL: guildIcon })
            .setTitle('SYNC TIME')
            .setDescription(
                `${arrow}SYNC TIME : ${args} ${alaram}\n\n` +
                `The War Starters have officially announced the exact time to begin the war ${heart}\n` +
                `${roleMention}`
            );

        await message.channel.send({ embeds: [embed] });

        try {
            await message.delete();
        } catch (error) {
            console.error('Failed to delete message:', error.message);
        }
    }
});


client.on("interactionCreate", async (interaction) => {
    try {
        await handleInteraction(interaction);
    } catch (error) {
        console.error("❌ Interaction Handler Error:", error);
    }
});


client.commands = new Collection();
const commandFiles = fs.readdirSync("./")
  .filter(file => file.endsWith(".js") && file !== "deploy-commands.js" && file !== "index.js");

for (const file of commandFiles) {
  const command = require(`./${file}`);
  if (command.data) {
    client.commands.set(command.data.name, command);
  }
}

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "❌ There was an error executing this command!", ephemeral: true });
  }
});



client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    // Split command
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "testnick") {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply("⚠️ Please mention a user. Example: `testnick @user`");
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply("⚠️ Could not find that member in this server.");
        }

        try {
            await member.setNickname("BLOOD | TEST");
            message.reply(`✅ Changed nickname for **${member.user.tag}**`);
        } catch (err) {
            console.error("Nickname error:", err);
            message.reply(`❌ Failed to change nickname: \`${err.message}\``);
        }
    }
});



// Config IDs
const WELCOME_CHANNEL_ID = "1154293306637946890";
const SUPPORT_ROLE_ID = "1154276716982833154";
const LOG_CHANNEL_ID = "1410188192065257522";

// ─── Helpers ───────────────────────────────
function randomColor() {
  return Math.floor(Math.random() * 0xffffff);
}

async function sendLog(guild, embed) {
  const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (logChannel) await logChannel.send({ embeds: [embed] }).catch(() => null);
}

// ─── Events ────────────────────────────────
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.GuildMemberAdd, async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(randomColor())
    .setAuthor({ name: `✧ ${member.guild.name} ✧`, iconURL: member.guild.iconURL({ dynamic: true, size: 1024 }) })
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setDescription(
      `Hello **${member.user.username}**, welcome to **『✧ Blood Alliance ✧』**\n\n` +
      `We are a proud alliance of ${getEmoji("whited")} **FWA CLANS** ${getEmoji("whited")} who do Farm Wars.\n\n` +
      `__**Please Read Below Steps**__\n\n` +
      `**→** We are currently accepting ${getEmoji("th17")} ${getEmoji("th16")} ${getEmoji("th15")} ${getEmoji("th14")}\n` +
      `1. Link Your Account → use \`;link playertag\` at <#1398351500895588352>\n` +
      `2️. If you wish to join our clan, or if you're already a member, please head to <#1154111265258614795> ${getEmoji("tickred")} to verify your ID.\n\n` +
      `${getEmoji("heart")} Once done, please wait for <@&${SUPPORT_ROLE_ID}> to assist you. We will be with you shortly. ${getEmoji("heart")}\n\n` +
      `彡 Meanwhile, visit <#1154110353299492966> to know how we run 彡`
    )
    .setFooter({ text: "Welcome to the family!", iconURL: member.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
    .setTimestamp();

  await channel.send({
    content: `Hey ${member}! 🎉`,
    embeds: [embed]
  }).catch(() => null);
});


const TICKET_CATEGORY_ID = '1154108820570771616';

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  try {
    // Defer reply immediately to avoid 3-second timeout error
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const user = interaction.user;

    async function createTicketChannel(channelName, embedDescription) {
      const category = guild.channels.cache.get(TICKET_CATEGORY_ID);
      if (!category || category.type !== ChannelType.GuildCategory) {
        return interaction.editReply({ content: '❌ Ticket category not found or invalid. Please contact an admin.' });
      }

      const safeName = channelName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if ticket already exists for user
      const existing = guild.channels.cache.find(
        c => c.parentId === category.id && c.name === safeName
      );
      if (existing) {
        return interaction.editReply({ content: `❌ You already have an open ticket: ${existing}` });
      }

      const overwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: SUPPORT_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: guild.members.me.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ];

      const ticketChannel = await guild.channels.create({
        name: safeName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: overwrites
      });

      const embed = new EmbedBuilder()
        .setTitle(`Ticket - ${user.tag}`)
        .setDescription(embedDescription)
        .setColor('Green')
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('delete_ticket')
          .setLabel('Delete Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content: `<@${user.id}> <@&${SUPPORT_ROLE_ID}>`,
        embeds: [embed],
        components: [row],
        allowedMentions: {
          users: [user.id],  // Only ping ticket creator
          roles: []          // Support role silently mentioned
        }
      });

      return interaction.editReply({ content: `✅ Ticket created: ${ticketChannel}` });
    }

    switch (interaction.customId) {
      case 'apply_clan':
        await createTicketChannel(
          `clan--${user.username}`,
          "Please follow the steps to apply for clan membership:\n\n1. Link your account using `;link #playertag\n2. Share screenshots of your game profile (My Profile tab visible)\n3. Share screenshots of your FWA base\nIf you don't have an FWA base, type `!bases` for FWA base instructions."
        );
        break;

      case 'rep_apply':
        await createTicketChannel(
          `rep--${user.username}`,
          "Thank you for your interest in becoming a Rep!\n\nPlease provide the following:\n\n1. Your linked account via `;link #playertag`\n2. Experience with clan management or related roles\n3. Why you want to become a Rep\n\nWe'll review your application shortly."
        );
        break;

      case 'staff_apply':
        await createTicketChannel(
          `staff--${user.username}`,
          "Thanks for wanting to join the staff team!\n\nPlease share:\n\n1. Your linked account with `;link #playertag`\n2. Previous staff or moderation experience\n3. Areas you’d like to support\n\nWe'll get back to you soon."
        );
        break;

      case 'alliance_apply':
        await createTicketChannel(
          `alliance--${user.username}`,
          "Interested in joining the alliance?\n\nPlease submit:\n\n1. Your linked account ;link #playertag`\n2. Details about your clan\n3. Why you want to join the alliance\n\nWe will review your request ASAP."
        );
        break;

      case 'link_account':
        await interaction.editReply({ content: '🔗 Link Account functionality coming soon!' });
        break;

      case 'delete_ticket': {
        const member = interaction.member;
        const hasSupportRole = member.roles.cache.has(SUPPORT_ROLE_ID);
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!hasSupportRole && !isAdmin) {
          return interaction.editReply({ content: '❌ You do not have permission to delete this ticket.' });
        }

        await interaction.editReply({ content: '🗑️ Deleting ticket channel...' });

        try {
          await interaction.channel.delete();
        } catch (error) {
          console.error('Error deleting ticket channel:', error);
        }
        break;
      }

      default:
        await interaction.editReply({ content: '❌ Unknown button interaction.' });
    }
  } catch (error) {
    console.error('Error handling button interaction:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Something went wrong while processing your request.', ephemeral: true });
    }
  }
});




const clanRolesData = require('./clanrole.json');
// Map roleId -> { clanTag, channelId }
const roleIdMap = {};
for (const [clanTag, data] of Object.entries(clanRolesData)) {
  roleIdMap[data.roleId] = {
    clanTag,
    channelId: data.channelId
  };
}

// Fetch clan name from Clash of Clans API
async function getClanName(clanTag) {
  try {
    const url = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(clanTag)}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${COC_API_TOKEN}`
      }
    });
    return response.data.name || clanTag;
  } catch (error) {
    console.error(`❌ Failed to fetch clan name for ${clanTag}:`, error?.response?.data?.message || error.message);
    return clanTag; // fallback
  }
}


client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(
    role => !oldMember.roles.cache.has(role.id)
  );

  for (const role of addedRoles.values()) {
    const roleData = roleIdMap[role.id];
    if (!roleData) continue;

    const { clanTag, channelId } = roleData;
    const channel = newMember.guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
      console.warn(`⚠️ Cannot find/access channel for clan ${clanTag}`);
      continue;
    }

    const clanName = await getClanName(clanTag);

    const embed = new EmbedBuilder()
      .setTitle(`🎉 Welcome to ${clanName}!`)
      .setDescription(`Hey <@${newMember.id}>, welcome to the **${clanName}** clan!\nWe're glad to have you!`)
      .setColor(0x00AE86)
      .setTimestamp()
      .setFooter({ text: `Clash of Clans | ${clanTag}` });

    channel.send({ embeds: [embed] });
  }
});




// ===============================
// leave

client.on("guildMemberRemove", async (member) => {
    const channelId = "1154294780969373786";
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(Math.floor(Math.random() * 0xFFFFFF))
        .setTitle("👋 Member Left")
        .setDescription(`${member.user.tag} (${member}) has left the server.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `User ID: ${member.id}` })
        .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
});


const CHANNEL_ID = "1398361418427793549";
const INTERVAL = 20 * 60 * 60 * 1000; // 20 hours in ms
	
	client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
        
    await deleteNonBotMessages(); // Run on startup
    setInterval(deleteNonBotMessages, INTERVAL); // Repeat every 22 hrs
});


async function deleteNonBotMessages() {
    const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) {
        console.error("❌ Channel not found or not a text channel.");
        return;
    }

    try {
        let fetched;
        do {
            fetched = await channel.messages.fetch({ limit: 100 });

            const toDelete = fetched.filter(msg => !msg.author.bot);

            const recentMessages = toDelete.filter(
                msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
            );

            if (recentMessages.size > 0) {
                await channel.bulkDelete(recentMessages, true);
                console.log(`🗑 Deleted ${recentMessages.size} recent non-bot messages from #${channel.name}`);
            }

            const oldMessages = toDelete.filter(
                msg => Date.now() - msg.createdTimestamp >= 14 * 24 * 60 * 60 * 1000
            );

            for (const msg of oldMessages.values()) {
                await msg.delete().catch(() => {});
            }

        } while (fetched.filter(msg => !msg.author.bot).size > 0);

    } catch (err) {
        console.error("⚠ Error deleting messages:", err);
    }
}

client.login(token);
