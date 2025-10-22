const { cocApiToken } = require("./config.json");
const COC_API_KEY = cocApiToken;

const fs = require("fs");
const { EmbedBuilder } = require("discord.js");


function loadUserData() {
    try {
        const raw = fs.readFileSync("userdata.json", "utf8");
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

module.exports = {
    name: "clanplayers",
    description: "List all clan players and check if linked",
    async execute(message, args) {
        const clanTag = args[0]; // Example: !clanplayers #2YL
        if (!clanTag) {
            return message.channel.send("❌ Provide a clan tag. Example: `!clanplayers #2YL`");
        }

        const userData = loadUserData();

        // Reverse map clash tags → discord user
        const tagToUser = {};
        for (const [discordId, accounts] of Object.entries(userData)) {
            if (Array.isArray(accounts)) {
                accounts.forEach(acc => {
                    tagToUser[acc.tag.replace("#", "").toUpperCase()] = discordId;
                });
            }
        }

        try {
            const res = await fetch(`https://api.clashofclans.com/v1/clans/%23${clanTag.replace("#", "")}`, {
                headers: { Authorization: `Bearer ${COC_API_KEY}` }
            });

            if (!res.ok) {
                return message.channel.send(`❌ Failed to fetch clan: ${res.statusText}`);
            }

            const clanData = await res.json();

            if (!clanData.memberList) {
                return message.channel.send("❌ Could not fetch members. Check clan tag and API key.");
            }

            const members = clanData.memberList.map((m, i) => {
                const cleanTag = m.tag.replace("#", "").toUpperCase();
                const discordId = tagToUser[cleanTag];
                const mark = discordId ? "✅" : "❌";
                const linkedInfo = discordId ? `→ Linked (<@${discordId}>)` : "→ Not Linked";
                return `${mark} ${i + 1}. ${m.name} (${m.tag}) ${linkedInfo}`;
            });

            const embed = new EmbedBuilder()
                .setTitle(`📋 ${clanData.name} (${clanData.tag})`)
                .setDescription(`Total Members: ${clanData.members}\n\n${members.join("\n")}`)
                .setColor("Blue")
                .setFooter({
                    text: `Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            message.channel.send("❌ Error fetching clan data.");
        }
    }
};
