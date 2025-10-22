const fs = require("fs");
const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder,
} = require("discord.js");
const { request } = require("undici");

const { cocApiToken } = require("./config.json");
const COCTOKEN = cocApiToken;

const tick = "1410137697300775026";
const tickEmoji = `<:tick:${tick}>`;
const cocfightt = "1410132596763131914";
const cocEmoji = `<a:cocfight:${cocfightt}>`;

const GLOBAL_ROLE_ID = "1154279973977346078";
const allowedRoles = ["1397128468461916282", "1153997630112792577", "1394230094675050616","1154276716982833154"];

function getRandomColor() {
    return Math.floor(Math.random() * 16777215);
}

async function getPlayerData(tag) {
    const encodedTag = encodeURIComponent(tag);
    const url = `https://api.clashofclans.com/v1/players/${encodedTag}`;
    const response = await request(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${COCTOKEN}` }
    });
    return await response.body.json();
}

module.exports = {
    name: "cc",
    description: "Check Clash of Clans base and assign clan roles",
    async execute(message, args) {
		 if (message.deletable) message.delete().catch(() => {});
        // ✅ Restrict command usage to allowed roles
        const member = message.member;
        if (!allowedRoles.some(roleId => member.roles.cache.has(roleId))) {
            return message.reply("❌ You do not have permission to use this command.");
        }

        if (!args[0] && !message.mentions.users.first()) {
            return message.channel.send("❌ Please provide a tag or mention a user.");
        }

        let cleanTag, playerName;
        const mentionedUser = message.mentions.users.first();
        const targetUser = mentionedUser || message.author;
        const userdata = JSON.parse(fs.readFileSync("./userdata.json", "utf8"));
        const clanroles = JSON.parse(fs.readFileSync("./clanrole.json", "utf8"));

        if (mentionedUser) {
            const linkedAccounts = userdata[mentionedUser.id];
            if (!linkedAccounts || linkedAccounts.length === 0) {
                return message.channel.send(`❌ ${mentionedUser} has no linked accounts.`);
            }

            if (linkedAccounts.length === 1) {
                cleanTag = linkedAccounts[0].tag.replace("#", "").toUpperCase();
                playerName = linkedAccounts[0].name;
            } else {
                const options = linkedAccounts.map(acc => ({
                    label: `${acc.name} (#${acc.tag.replace("#", "").toUpperCase()})`,
                    value: JSON.stringify({ tag: acc.tag.replace("#", "").toUpperCase(), name: acc.name })
                }));

                const row = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("select-tag")
                        .setPlaceholder("Choose a Clash account")
                        .addOptions(options)
                );

                const prompt = await message.channel.send({
                    content: `🔎 ${message.author}, please choose which account you want to check:`,
                    components: [row]
                });

                const collector = prompt.createMessageComponentCollector({
                    filter: i => i.user.id === message.author.id,
                    max: 1,
                    time: 30000
                });

                collector.on("collect", async interaction => {
                    const chosen = JSON.parse(interaction.values[0]);
                    cleanTag = chosen.tag;
                    playerName = chosen.name;
                    await interaction.deferUpdate();
                    prompt.delete().catch(() => {});
                    runCheck(cleanTag, playerName, targetUser, message, clanroles);
                });

                collector.on("end", collected => {
                    if (collected.size === 0) {
                        prompt.edit({ content: "❌ You didn’t choose in time.", components: [] }).catch(() => {});
                    }
                });

                return;
            }
        } else {
            cleanTag = args[0].replace("#", "").toUpperCase();
            for (const userId in userdata) {
                const acc = userdata[userId].find(a => a.tag.replace("#", "").toUpperCase() === cleanTag);
                if (acc) {
                    playerName = acc.name;
                    break;
                }
            }
        }

        runCheck(cleanTag, playerName, targetUser, message, clanroles);
    }
};

async function runCheck(cleanTag, playerName, targetUser, message, clanroles) {
    const cosLink = `https://www.clashofstats.com/players/${cleanTag}/summary`;
    const fwaLink = `https://cc.fwafarm.com/cc_n/member.php?tag=${encodeURIComponent(cleanTag)}`;
    const titleText = playerName ? `${playerName}  #${cleanTag}` : `Player #${cleanTag}`;

    const embed = new EmbedBuilder()
        .setColor(getRandomColor())
        .setTitle(titleText)
        .setDescription(`${cocEmoji} Please confirm base is correct and check CC.`)
        .addFields(
            { name: "Clash of Stats", value: `[View Stats](${cosLink})`, inline: true },
            { name: "FWA Farm Link", value: `[View FWA](${fwaLink})`, inline: true },
            { name: "Actions", value: "⏳ Waiting for confirmation...", inline: false }
        )
        .setFooter({ text: `Please click the ✅ emoji if you are sure.`, iconURL: message.author.displayAvatarURL() });

    const sentMessage = await message.channel.send({ embeds: [embed] });
    await sentMessage.react(tick);

    const filter = (reaction, user) => reaction.emoji.id === tick && !user.bot;
    const collector = sentMessage.createReactionCollector({ filter, max: 1, time: 60000 });

    collector.on("collect", async (reaction, verifier) => {
        try {
            const verifierMember = await message.guild.members.fetch(verifier.id);

            if (!allowedRoles.some(r => verifierMember.roles.cache.has(r))) {
                await reaction.users.remove(verifier.id).catch(() => {});
                const deniedEmbed = EmbedBuilder.from(embed)
                    .spliceFields(2, 1, { name: "Actions", value: `❌ ${verifier.tag} does not have permission.`, inline: false })
                    .setColor(0xFF0000)
                    .setTimestamp();
                await sentMessage.edit({ embeds: [deniedEmbed] });
                await sentMessage.reactions.removeAll().catch(() => {});
                return;
            }

            let targetMember;
            try {
                targetMember = await message.guild.members.fetch(targetUser.id);
            } catch (err) {
                if (err.code === 10007) {
                    await message.channel.send("❌ Player is not in the server.");
                    return;
                }
                console.error("Member fetch error:", err);
                await message.channel.send("❌ Unexpected error while fetching the player.");
                return;
            }

            const botMember = await message.guild.members.fetchMe();
            if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
                const errorMsg = "❌ Cannot modify user: they have a higher or equal role than the bot.";
                await message.channel.send(errorMsg);

                const embedError = EmbedBuilder.from(embed)
                    .spliceFields(2, 1, { name: "Actions", value: errorMsg, inline: false })
                    .setColor(0xFF0000)
                    .setTimestamp();

                await sentMessage.edit({ embeds: [embedError] });
                await sentMessage.reactions.removeAll().catch(() => {});
                return;
            }

            const playerData = await getPlayerData(`#${cleanTag}`);
            let results = [];

            if (!playerData.clan) {
                results.push("⚠ Player is not in any clan.");
            } else {
                const clanTag = playerData.clan.tag;
                const clanInfo = clanroles[clanTag];
                if (clanInfo) {
                    const role = message.guild.roles.cache.get(clanInfo.roleId);
                    if (role) {
                        await targetMember.roles.add(role)
                            .then(() => results.push(`${tickEmoji} Added role **${role.name}**.`))
                            .catch(() => results.push("⚠️ Failed to add clan role."));
                    } else {
                        results.push("⚠️ Clan role not found.");
                    }
                } else {
                    results.push("⚠️ Clan is not registered.");
                }
            }

            if (targetMember.roles.cache.has(GLOBAL_ROLE_ID)) {
                await targetMember.roles.remove(GLOBAL_ROLE_ID)
                    .then(() => results.push(`${tickEmoji} Removed Global role.`))
                    .catch(() => results.push("⚠️ Could not remove Global role."));
            }

            await targetMember.setNickname(`BLOOD | ${playerName || targetMember.user.username}`)
                .then(() => results.push(`${tickEmoji} Nickname updated.`))
                .catch(err => {
                    if (err.code === 50013) {
                        results.push("⚠️ Missing Permissions to change nickname.");
                    } else {
                        results.push(`⚠️ Could not change nickname: ${err.message}`);
                    }
                    console.error("Nickname error:", err);
                });

            results.push(`${tickEmoji} Verified by ${verifier.tag}`);

            const updatedEmbed = EmbedBuilder.from(embed)
                .spliceFields(2, 1, { name: "Actions", value: results.join("\n"), inline: false })
                .setColor(getRandomColor())
                .setTimestamp();

            await sentMessage.edit({ embeds: [updatedEmbed] });
            await sentMessage.reactions.removeAll().catch(() => {});
        } catch (err) {
            console.error(err);
        }
    });

    collector.on("end", collected => {
        if (collected.size === 0) {
            const expiredEmbed = EmbedBuilder.from(embed)
                .spliceFields(2, 1, { name: "Actions", value: "⌛ Timed out without confirmation.", inline: false })
                .setColor(getRandomColor())
                .setTimestamp();
            sentMessage.edit({ embeds: [expiredEmbed] }).catch(() => {});
        }
    });
}
