const {
    EmbedBuilder,
    ChannelType,
    PermissionsBitField
} = require("discord.js");

const { emojis, getEmoji } = require("./emoji.js"); // import emojis

const SYNC_CHANNEL_ID = "1398361418427793549";
const THREAD_CHANNEL_ID = "1398361418427793549";
const CUSTOM_ROLE_ID = "1407320183760224347";
const { cocApiToken } = require("./config.json");
const COC_API_TOKEN = cocApiToken;
const CLAN_TAG = "#CYQVL002";

let lastWarId = null;

// Define your emoji IDs for reactions:
const tickId = emojis.gtick;        // green tick emoji ID
const questionId = emojis.question; // question emoji ID
const wrongId = emojis.bluex;       // wrong emoji ID (bluex)

async function logToChannel(client, msg) {
    try {
        const logChannel = await client.channels.fetch("1410583241655586869");
        if (logChannel?.isTextBased()) {
            await logChannel.send(msg);
        }
    } catch (error) {
        console.error("Failed to send log to channel:", error);
    }
}

async function sendSyncMessage(client, message = null) {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const channel = message
        ? message.channel
        : await client.channels.fetch(SYNC_CHANNEL_ID).catch(() => null);

    if (!channel || channel.type !== ChannelType.GuildText) return;

    const randomColor = Math.floor(Math.random() * 16777215);
    const roleId = "1394230094675050616";

    const embed = new EmbedBuilder()
        .setColor(randomColor)
        .setTitle("Are you able to start?")
        .setDescription(
            `${getEmoji("gtick")} - I'm able to start.\n\n` +
            `${getEmoji("question")} - Maybe.\n\n` +
            `${getEmoji("bluex")} - Not able to start. <@&${CUSTOM_ROLE_ID}> will help you.`
        );

    let sentMessage;
    try {
        sentMessage = await channel.send({
            content: `<@&${roleId}> Choose before 10 hours`,
            embeds: [embed]
        });
    } catch (err) {
        await logToChannel(client, `Failed to send sync message: ${err.message}`);
        return;
    }

    // React with emoji IDs (not the string)
    try {
        await sentMessage.react(tickId);       // green tick emoji ID
        await sentMessage.react(questionId);   // question emoji ID
        await sentMessage.react(wrongId);      // wrong emoji ID
    } catch (err) {
        await logToChannel(client, `Failed to add reaction: ${err.message}`);
    }

    const filter = (reaction, user) => !user.bot;

    const collector = sentMessage.createReactionCollector({
        filter,
        time: 10 * 60 * 60 * 1000 // 10 hours
    });

    collector.on("collect", async (reaction, user) => {
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            await logToChannel(client, `❌ Could not fetch member for user: ${user.username}`);
            return;
        }

        await logToChannel(client, `🌀 Reaction collected from **${user.username}** — Emoji ID: **${reaction.emoji.id}**, Name: **${reaction.emoji.name}**`);

        if (reaction.emoji.id === tickId) {
            await member.roles.add(CUSTOM_ROLE_ID).catch(() => {});
            await channel.send(`${user} can start the war! ⚔`);
            await logToChannel(client, `✅ Gave **${CUSTOM_ROLE_ID}** role to ${user.username}`);
        } else if ([questionId, wrongId].includes(reaction.emoji.id)) {
            await member.roles.remove(CUSTOM_ROLE_ID).catch(() => {});
            await logToChannel(client, `🗑 Removed **${CUSTOM_ROLE_ID}** role from ${user.username}`);

            const threadChannel = await client.channels.fetch(THREAD_CHANNEL_ID).catch(() => null);
            if (!threadChannel?.isTextBased()) {
                await logToChannel(client, `❌ Thread channel is invalid or not text-based.`);
                return;
            }

            // Emoji string for thread name, fallback to empty string if not found
            const statusEmoji = reaction.emoji.id === questionId ? getEmoji("question") : getEmoji("bluex");
            const statusText = reaction.emoji.id === questionId ? "Maybe" : "Cannot";

            const threadName = `${statusText} - ${user.username}`.slice(0, 90);

            const thread = await threadChannel.threads.create({
                name: threadName,
                autoArchiveDuration: 60,
                reason: `War start status: ${reaction.emoji.name}`
            }).catch(err => {
                logToChannel(client, `❌ Failed to create thread for ${user.username}: \`${err.message}\``);
                return null;
            });

            if (thread) {
                await thread.members.add(user.id).catch(() => {});
                await thread.send(`Hey ${user}, <@&${CUSTOM_ROLE_ID}> will assist you here.`);
                await logToChannel(client, `🧵 Thread created: **${threadName}** for ${user.username}`);
            }

            await channel.send(`${user} ${reaction.emoji.id === wrongId ? "cannot start" : "is unsure"} the war. Thread created in <#${THREAD_CHANNEL_ID}>.`);
        }

        await reaction.users.remove(user.id).catch(() => {});
    });

    collector.on("end", async () => {
        try {
            await sentMessage.reply("⏰ This sync check has expired (10 hours passed). Please wait for the next sync.");
            if (sentMessage.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                await sentMessage.reactions.removeAll().catch(() => {});
            }
        } catch (err) {
            await logToChannel(client, `Failed to clean up after collector ended: ${err.message}`);
        }
    });
}

async function removeRoleFromAll(guild) {
    const role = guild.roles.cache.get(CUSTOM_ROLE_ID) || await guild.roles.fetch(CUSTOM_ROLE_ID).catch(() => null);
    if (!role) return;

    for (const member of role.members.values()) {
        await member.roles.remove(CUSTOM_ROLE_ID).catch(() => {});
    }

    const syncChannel = await guild.channels.fetch(SYNC_CHANNEL_ID).catch(() => null);
    if (syncChannel?.isTextBased()) {
        syncChannel.send(`🗑 Removed role **${role.name}** from all members.`);
    }
}

async function checkWarStatus(client) {
    const url = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(CLAN_TAG)}/currentwar`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${COC_API_TOKEN}` }
        });

        if (!response.ok) {
            await logToChannel(client, `COC API error: ${response.statusText}`);
            return;
        }

        const data = await response.json();
        if (!data.endTime) return;

        const endTime = new Date(
            Date.UTC(
                parseInt(data.endTime.substring(0, 4)),
                parseInt(data.endTime.substring(4, 6)) - 1,
                parseInt(data.endTime.substring(6, 8)),
                parseInt(data.endTime.substring(9, 11)),
                parseInt(data.endTime.substring(11, 13)),
                parseInt(data.endTime.substring(13, 15))
            )
        );

        const now = new Date();
        const hoursLeft = (endTime - now) / (1000 * 60 * 60);
        const baseWarId = `${data.clan.tag}-${data.opponent.tag}-${data.endTime}`;

        if (hoursLeft <= 8 && hoursLeft > 7.9) {
            const warId = `${baseWarId}-8hr`;
            if (lastWarId !== warId) {
                lastWarId = warId;
                await logToChannel(client, "⏳ War is ending in ~8 hours! Clearing roles & sending sync...");
                const guild = client.guilds.cache.first();
                if (guild) await removeRoleFromAll(guild);
                await sendSyncMessage(client);
            }
        }

        if (data.state === "warEnded") {
            const warId = `${baseWarId}-ended`;
            if (lastWarId !== warId) {
                lastWarId = warId;
                await logToChannel(client, "🏁 War ended! Sending end notice...");
                const channel = await client.channels.fetch(SYNC_CHANNEL_ID).catch(() => null);
                if (channel?.type === ChannelType.GuildText) {
                    channel.send("⚔ **The war has ended!**");
                }
            }
        }

    } catch (err) {
        await logToChannel(client, `Failed to fetch COC API: ${err.message}`);
    }
}

function setupWarChecker(client) {
    setInterval(() => checkWarStatus(client), 5 * 60 * 1000); // Every 5 minutes
}

module.exports = {
    name: "synccheck",
    description: "Check war start availability",
    async execute(client, message, args) {
        if (message?.deletable) {
            await message.delete().catch(() => {});
        }
        await sendSyncMessage(client, message);
    },
    setupWarChecker
};
