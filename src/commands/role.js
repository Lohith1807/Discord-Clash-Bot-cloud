const fs = require("fs");
const { EmbedBuilder } = require("discord.js");
const emojis = require('./emoji.js');

// Allowed roles that can use this command
const ALLOWED_ROLES = ["1397128468461916282", "1153997630112792577"]; 

// helper: random color
function getRandomColor() {
    return Math.floor(Math.random() * 16777215);
}

// helper: build embed
function buildEmbed(description, color = 0x2ecc71, title = null) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(description)
        .setTimestamp();
    if (title) embed.setTitle(title);
    return embed;
}

module.exports = {
    name: "cr",
    description: "Add or update a clan-role mapping",

    async execute(message, args) {
        // Check allowed roles
         if (message.deletable) message.delete().catch(() => {});
        if (!message.member.roles.cache.some(r => ALLOWED_ROLES.includes(r.id))) {
            return message.channel.send({
                embeds: [buildEmbed("❌ You do not have permission to use this command.", 0xe74c3c)]
            });
        }

        if (!message.content.startsWith(";") || message.author.bot) return;

        if (args.length < 3) {
            return message.channel.send({
                embeds: [buildEmbed("⚠ Usage: `;cr #CLANTAG @role CHANNEL_ID [NICKNAME]`", 0xe67e22)]
            });
        }

        const clanTag = args[0].toUpperCase();
        const role = message.mentions.roles.first();
        const channelId = args[2]; // third argument: channel ID
        const nickName = args[3] ? args[3] : null; // optional nickname

        if (!clanTag.startsWith("#")) {
            return message.channel.send({
                embeds: [buildEmbed("⚠ Clan tag must start with `#`.", 0xe67e22)]
            });
        }
        if (!role) {
            return message.channel.send({
                embeds: [buildEmbed("⚠ You must mention a valid role.", 0xe67e22)]
            });
        }
        if (!/^\d{17,19}$/.test(channelId)) {
            return message.channel.send({
                embeds: [buildEmbed("⚠ Please provide a valid channel ID.", 0xe67e22)]
            });
        }

        // Load clanrole.json
        let clanroles = {};
        try {
            clanroles = JSON.parse(fs.readFileSync("./clanrole.json", "utf8"));
        } catch (err) {
            clanroles = {};
        }

        // Add/Update
        clanroles[clanTag] = {
            roleId: role.id,
            channelId: channelId,
            ...(nickName && { nickName }) // only add nickname if provided
        };

        fs.writeFileSync("./clanrole.json", JSON.stringify(clanroles, null, 2));

        const embed = buildEmbed(
            `✅ Clan **${clanTag}** is now linked to:\n` +
            `• Role: <@&${role.id}>\n` +
            `• Channel: <#${channelId}>\n` +
            (nickName ? `• Nickname: **${nickName}**` : ""),
            0x2ecc71,
            "Clan Role Linked"
        );

        return message.channel.send({ embeds: [embed] });
    }
};
