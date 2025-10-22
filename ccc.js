const { 
    PermissionsBitField, 
    ChannelType,
    EmbedBuilder
} = require("discord.js");

const ALLOWED_ROLES_CREATE = ['1397128468461916282', '1153997630112792577']; // roles allowed to use ;ccc

module.exports = {
    name: "ccc",
    description: "Create a clan category with preset channels",
	 
    async run(client, message, args) {
         if (message.deletable) message.delete().catch(() => {});
        // ✅ Permission check
        const hasPermission = message.member.roles.cache.some(r => ALLOWED_ROLES_CREATE.includes(r.id));
        if (!hasPermission) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🚫 Permission Denied")
                .setDescription("You do not have permission to use this command.")
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        // ✅ Usage check
        if (args.length < 3 || message.mentions.roles.size < 2) {
            const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle("⚠️ Invalid Usage")
                .setDescription("Usage: `;ccc <category name> @LeaderRole @MemberRole`")
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        const categoryName = args.slice(0, args.length - 2).join(" ");
        const [roleA, roleB] = message.mentions.roles.map(role => role);

        const confirmEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("⚠️ Confirmation Required")
            .setDescription(
                `Are you sure you want to create the **${categoryName}** category?\n\n` +
                `👑 **Leader Role:** ${roleA}\n` +
                `🧑‍🤝‍🧑 **Member Role:** ${roleB}\n\n` +
                `React with ✅ to confirm.`
            )
            .setFooter({ text: "You have 15 seconds to confirm." })
            .setTimestamp();

        const confirmMsg = await message.channel.send({ embeds: [confirmEmbed] });
        await confirmMsg.react('✅');

        const filter = (reaction, user) =>
            reaction.emoji.name === '✅' && user.id === message.author.id;

        const collector = confirmMsg.createReactionCollector({ filter, time: 15000, max: 1 });

        collector.on("collect", async (reaction, user) => {
            await reaction.users.remove(user.id);

            const overwrites = [
                {
                    id: message.guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                }
            ];

            // 🏗️ Create category
            const category = await message.guild.channels.create({
                name: categoryName,
                type: ChannelType.GuildCategory,
                permissionOverwrites: overwrites
            });

            // 🔱 leader-ship-chat
            await message.guild.channels.create({
                name: "🔱│leader-ship-chat",
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    ...overwrites,
                    {
                        id: roleA.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.ManageMessages,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.MentionEveryone
                        ]
                    }
                ]
            });

            // 📪 clan-mails
            await message.guild.channels.create({
                name: "📪│clan-mails",
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    ...overwrites,
                    {
                        id: roleA.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.ManageMessages,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.MentionEveryone
                        ]
                    },
                    {
                        id: roleB.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ],
                        deny: [
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ManageMessages
                        ]
                    }
                ]
            });

            // 🏡 clan-members
            await message.guild.channels.create({
                name: "🏡│clan-members",
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    ...overwrites,
                    {
                        id: roleA.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.ManageMessages,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.MentionEveryone,
                            PermissionsBitField.Flags.AddReactions
                        ]
                    },
                    {
                        id: roleB.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.MentionEveryone,
                            PermissionsBitField.Flags.AddReactions
                        ],
                        deny: [PermissionsBitField.Flags.ManageMessages]
                    }
                ]
            });

            // 📰 clan-feed
            await message.guild.channels.create({
                name: "📰│c𝖑𝖆𝖓-𝖋𝖊𝖊𝖉",
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    ...overwrites,
                    {
                        id: roleA.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.MentionEveryone
                        ]
                    },
                    {
                        id: roleB.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ],
                        deny: [
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ManageMessages
                        ]
                    }
                ]
            });

            const successEmbed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("✅ Clan Category Created!")
                .setDescription(`The **${categoryName}** category and its channels have been created successfully!`)
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });
        });

        collector.on("end", (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("⌛ Command Timed Out")
                    .setDescription("No confirmation received. Command cancelled.")
                    .setTimestamp();
                message.reply({ embeds: [timeoutEmbed] });
            }
        });
    }
};
