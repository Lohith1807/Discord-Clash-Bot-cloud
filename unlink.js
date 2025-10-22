const fs = require("fs");
const { EmbedBuilder } = require("discord.js");
const { getEmoji } = require('./emoji.js');  // updated import
// 🔄 Load & Save User Data
function loadUserData() {
    try {
        const raw = fs.readFileSync("userdata.json", "utf8");
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}
function saveUserData(data) {
    fs.writeFileSync("userdata.json", JSON.stringify(data, null, 2));
}

// 🎨 Random Color
function getRandomColor() {
    return Math.floor(Math.random() * 16777215);
}

module.exports = {
    name: "unlink",
    description: "Unlink a Clash of Clans account from a user",

    async execute(message, args) {
        // 🗑️ delete the command message
        if (message.deletable) message.delete().catch(() => {});

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("<:babyd:1154419597110415502> Incorrect Usage")
                        .setDescription("Usage: `;unlink #TAG` or `;unlink @user #TAG`")
                        .setColor(getRandomColor())
                ]
            });
        }

        let targetUser = message.author;
        let playerTag;

        // 👤 If mention exists → unlink from that user
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
            playerTag = args.find(arg => arg.startsWith("#"));
            if (!playerTag) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${getEmoji("hog")} Missing Player Tag`)
                            .setDescription("Example: `;unlink @user #TAG`")
                            .setColor(getRandomColor())
                    ]
                });
            }
        } else {
            playerTag = args[0];
        }

        // 🏷️ Clean Tag
        const cleanTag = playerTag.replace("#", "").toUpperCase();
        const userData = loadUserData();

        if (!userData[targetUser.id] || userData[targetUser.id].length === 0) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("<:babyd:1154419597110415502> No Linked Accounts")
                        .setDescription(`No linked accounts found for <@${targetUser.id}>.`)
                        .setColor(getRandomColor())
                ]
            });
        }

        // 🔎 Remove the account if exists
        const beforeCount = userData[targetUser.id].length;
        userData[targetUser.id] = userData[targetUser.id].filter(
            acc => acc.tag.replace("#", "").toUpperCase() !== cleanTag
        );

        if (userData[targetUser.id].length === beforeCount) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("<a:bwrong:1376063326567530526> Account Not Found")
                        .setDescription(`Account with tag **#${cleanTag}** not found for <@${targetUser.id}>.`)
                        .setColor(getRandomColor())
                ]
            });
        }

        // 💾 Save updated data
        saveUserData(userData);

        // ✅ Response embeds
        const embed = new EmbedBuilder()
            .setColor(getRandomColor())
            .setTimestamp()
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL()
            });

        if (targetUser.id === message.author.id) {
            embed
                .setTitle("<:gtick:1404781545142751344> Successfully Unlinked")
                .setDescription(`Your account with tag **#${cleanTag}** has been unlinked.`);
        } else {
            embed
                .setTitle("<:gtick:1404781545142751344> Successfully Force-Unlinked")
                .setDescription(`Account **#${cleanTag}** has been force-unlinked from <@${targetUser.id}>.`)
                .setFooter({
                    text: `Action by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL()
                });
        }

        return message.channel.send({ embeds: [embed] });
    }
};
