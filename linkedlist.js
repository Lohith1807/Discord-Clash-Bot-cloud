const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

// ✅ Allowed roles
const ALLOWED_ROLES = ["1397128468461916282", "1153997630112792577"];

// ✅ Allowed category IDs
const ALLOWED_CATEGORIES = ["1154109406355669072", "1405509890142900377"]; // replace with your category IDs

// 🧱 Helper: load user data
function loadUserData() {
    try {
        const raw = fs.readFileSync("userdata.json", "utf8");
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

// 🎨 Helper: embed builder
function buildEmbed(title, description, color = 0x2ecc71) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}

module.exports = {
    name: "linkcheck",
    description: "Show linked members, unlinked members, and linked users not in server",

    async execute(message) {
        // Delete the command message
        if (message.deletable) message.delete().catch(() => {});

        // 🔒 Role check
        if (!message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
            const embed = buildEmbed(
                "🚫 Access Denied",
                "You do not have permission to use this command.",
                0xe74c3c
            );
            return message.reply({ embeds: [embed] });
        }

        // 🔒 Category check
        if (!message.channel.parentId || !ALLOWED_CATEGORIES.includes(message.channel.parentId)) {
            const embed = buildEmbed(
                "🚫 Wrong Category",
                "You can only use this command in the designated admin categories.",
                0xe74c3c
            );
            return message.reply({ embeds: [embed] });
        }

        // 📤 Loading embed
        const loadingEmbed = buildEmbed(
            "⏳ Fetching Members",
            "Please wait while I fetch all members and check their link status...",
            0x3498db
        );
        const loadingMsg = await message.channel.send({ embeds: [loadingEmbed] });

        const userData = loadUserData();
        const linkedUserIds = new Set(Object.keys(userData));

        try {
            const allMembers = await message.guild.members.fetch();

            const linkedMembers = [];
            const notLinkedMembers = [];
            const linkedButNotInServer = [];

            // 🧾 Separate linked/unlinked members
            allMembers.forEach(member => {
                if (member.user.bot) return;

                const displayName = member.displayName;
                const mention = `<@${member.id}>`;
                const nameWithTag = `${displayName} (${mention})`;

                if (linkedUserIds.has(member.id)) {
                    linkedMembers.push(nameWithTag);
                } else {
                    notLinkedMembers.push({ mention, name: displayName });
                }
            });

            // 🏷️ Linked but not in server
            const serverMemberIds = new Set(allMembers.map(m => m.id));
            linkedUserIds.forEach(id => {
                if (!serverMemberIds.has(id)) {
                    const linkedAccounts = userData[id];
                    let userLabel = id;
                    if (Array.isArray(linkedAccounts) && linkedAccounts.length > 0) {
                        const names = linkedAccounts.map(acc => acc.name).join(", ");
                        userLabel = `${id} (Linked accounts: ${names})`;
                    }
                    linkedButNotInServer.push(userLabel);
                }
            });

            // 📄 Helper: shorten long lists
            function createDescription(arr, limit = 15) {
                if (arr.length === 0) return "None";
                const limited = arr.slice(0, limit).join("\n");
                if (arr.length > limit) return limited + `\n...and ${arr.length - limit} more`;
                return limited;
            }

            // ✅ Linked Members (embed)
            const linkedEmbed = buildEmbed(
                `✅ Linked Members In Server [${linkedMembers.length}]`,
                createDescription(linkedMembers),
                0x2ecc71
            );
            await message.channel.send({ embeds: [linkedEmbed] });

            // ⚠ Linked but NOT in server (plain text)
            if (linkedButNotInServer.length === 0) {
                await message.channel.send("⚠️ No linked members are missing from the server.");
            } else {
                const chunkSize = 50;
                for (let i = 0; i < linkedButNotInServer.length; i += chunkSize) {
                    const chunk = linkedButNotInServer.slice(i, i + chunkSize);
                    await message.channel.send(
                        `⚠️ Linked But NOT In Server (${chunk.length}):\n- ${chunk.join("\n- ")}`
                    );
                }
            }

            // ❌ Not linked members in server (plain text)
            if (notLinkedMembers.length === 0) {
                await message.channel.send("🎉 All server members are linked!");
            } else {
                const chunkSize = 50;
                for (let i = 0; i < notLinkedMembers.length; i += chunkSize) {
                    const chunk = notLinkedMembers.slice(i, i + chunkSize);
                    const mentionsText = chunk.map(m => m.mention).join(" ");
                    await message.channel.send(`❌ Not linked members in server (${chunk.length}):\n${mentionsText}`);
                }
            }

            // 🧹 Remove loading message
            await loadingMsg.delete().catch(() => {});
        } catch (error) {
            console.error("Error fetching members:", error);
            const errorEmbed = buildEmbed(
                "❌ Error",
                "Failed to fetch all members. Please ensure I have the `GUILD_MEMBERS` intent and proper permissions.",
                0xe74c3c
            );
            await message.channel.send({ embeds: [errorEmbed] });
        }
    }
};
