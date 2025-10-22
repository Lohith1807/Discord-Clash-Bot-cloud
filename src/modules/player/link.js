const fs = require("fs");
const { EmbedBuilder } = require("discord.js");
const { getEmoji } = require('./emoji.js');  // <-- updated import
const { cocApiToken } = require("./config.json");
const token = cocApiToken;


// Load user data from JSON
function loadUserData() {
    try {
        const raw = fs.readFileSync("userdata.json", "utf8");
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

// Save user data back to JSON
function saveUserData(data) {
    fs.writeFileSync("userdata.json", JSON.stringify(data, null, 2));
}

module.exports = {
    name: "link",
    description: "Link your Clash of Clans account (or force-link someone else’s)",
    async execute(message, args) {
        // 🗑️ Delete the command message if possible
        if (message.deletable) message.delete().catch(() => {});

        if (args.length === 0) {
            return message.channel.send("<:babyd:1154419597110415502> Syntax: `;link #TAG` or `;link @user #TAG`");
        }

        let targetUser = message.author; // default: self
        let playerTag;

        // If mention exists → force link
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
            playerTag = args.find(arg => arg.startsWith("#"));
            if (!playerTag) {
                return message.channel.send(`Please provide a player tag. Example: \`;link @user #TAG\``);
            }
        } else {
            playerTag = args[0];
        }

        const cleanTag = playerTag.replace("#", "").toUpperCase();

        try {
            const response = await fetch(
                `https://api.clashofclans.com/v1/players/%23${cleanTag}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) {
                return message.channel.send("<:hogc:1154419539015118959> Could not get the information | Check your tag and try again.");
            }

            const data = await response.json();
            const userData = loadUserData();

            // 🔍 Check if tag is already linked to any user
            let tagAlreadyLinkedUserId = null;
            for (const [userId, accounts] of Object.entries(userData)) {
                if (Array.isArray(accounts) && accounts.some(acc => acc.tag === data.tag)) {
                    tagAlreadyLinkedUserId = userId;
                    break;
                }
            }

            if (tagAlreadyLinkedUserId) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("<a:bwrong:1376063326567530526> Tag Already Linked")
                    .setColor("Red")
                    .setTimestamp();

                if (tagAlreadyLinkedUserId === targetUser.id) {
                    if (targetUser.id === message.author.id) {
                        errorEmbed.setDescription(`\`${data.tag}\` is already linked to your profile. Link another account.`);
                    } else {
                        errorEmbed.setDescription(`\`${data.tag}\` is already linked to this user. Link another account.`);
                    }
                } else {
                    errorEmbed.setDescription(`\`${data.tag}\` is already linked to <@${tagAlreadyLinkedUserId}>.`);
                }

                return message.channel.send({ embeds: [errorEmbed] });
            }

            // ✅ Ensure array exists
            if (!Array.isArray(userData[targetUser.id])) {
                userData[targetUser.id] = [];
            }

            // Add tag
            userData[targetUser.id].push({
                tag: data.tag,
                name: data.name
            });

            saveUserData(userData);

            // 🎨 Random embed color
            const randomColor = Math.floor(Math.random() * 16777215);

            // Self-link
            if (targetUser.id === message.author.id) {
                const embed = new EmbedBuilder()
                    .setTitle("<:gtick:1404781545142751344> Successfully Linked Account")
                    .setDescription(`**${data.name}** (${data.tag}) is now linked to your Discord.`)
                    .setColor(randomColor)
                    .setFooter({ text: `Done by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            } 
            // Force-link
            else {
                const embed = new EmbedBuilder()
                    .setTitle("<:gtick:1404781545142751344> Successfully Force-Linked Account")
                    .setDescription(`**${data.name}** (${data.tag}) has been force-linked to <@${targetUser.id}>`)
                    .setColor(randomColor)
                    .setFooter({ text: `Done by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });
            }
        } catch (err) {
            console.error(err);
            return message.channel.send("<a:bwrong:1376063326567530526> There is a problem in linking account.");
        }
    }
};
