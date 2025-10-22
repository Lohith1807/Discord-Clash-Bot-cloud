const { EmbedBuilder } = require("discord.js");

module.exports = {
    ahelp: {
        name: "ahelp",
        description: "Shows a list of admin commands and all commands",
        execute(message, args, client) {
            const ALLOWED_ROLE_ID = ["1397128468461916282", "1153997630112792577"];
            const ALLOWED_CATEGORY_ID = "1154109406355669072"; // replace with your allowed category ID

            if (!message.guild || !message.member) return;
            if (!ALLOWED_ROLE_ID.some(roleId => message.member.roles.cache.has(roleId))) return;
            
            // Check if the command is used in the allowed category
            if (!message.channel.parentId || message.channel.parentId !== ALLOWED_CATEGORY_ID) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xe74c3c)
                            .setDescription("❌ You can only use this command in the designated admin category.")
                            .setTimestamp()
                    ]
                });
            }

            const randomColor = Math.floor(Math.random() * 16777215);

            const helpEmbed = new EmbedBuilder()
                .setColor(randomColor)
                .setTitle("Bot Commands (Admin Only)")
                .setDescription(
                    "**__Linking commands__**\n\n\n" +
                    "**cr** → Link clan to alliance and role\n\n" +
                    "**crr** → Remove clan Link to alliance and role\n\n" +
                    "**;profile or ;p** → See your profile or another's profile (`;p @user`)\n\n" +
                    "**;link** → Link an ID (`;link #tag` or `;link @user #tag`)\n\n" +
                    "**;unlink** → Unlink an ID (`;unlink @user` or `;unlink @user #tag`)\n\n" +
                    "**;linklead** → Link a leader to a clan (`;linklead #clantag @user`)\n\n" +
                    "**;linkco** → Link co-leaders (`;linkco #clantag @user1 @user2 ...`)\n\n" +
                    "**;unlead** → Unlink a leader (`;unlead #clantag @user`)\n\n" +
                    "**;unco** → Unlink a co-leader (`;unco #clantag @user`)\n\n" +
                    "**;removeclan** → Removes clan from alliance (`;removeclan #clantag`)\n\n" +
                    "**;ccc** → Create clan category (`;ccc NAME @leaderrole @memberrole`)\n\n" +
                    "**;delc** → Delete the whole category + channels\n\n" +
                    "**;cc** → Chocolate Clash history and changes nickname and gives role (`;cc #tag` or `;cc @user`)\n\n\n" +
                    "**__Normal Commands__**\n\n\n" +
                    "**;clan** → Clan info (`;clan #clantag` or `;clan @user`)\n\n" +
                    "**;clans** → Shows all linked clans\n\n" +
                    "**;ww**  → Gives war weight of clans by ;ww #clantag\n\n" +
                    "**;compo**  → Gives compo of clans by ;compo #clantag\n\n" +                    
                    "**;sync** → Sync confirm and war starter\n\n" +
                    "**!fwa** → FWA overview\n\n" +
                    "**!bases** → FWA base links\n\n" +
                    "**;ct** → Creates ticket for new user if id is linked or didn't link\n\n" +
                    "**;crinfo** → Shows the linked clans\n\n" 
                )
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setTimestamp();

            message.channel.send({ embeds: [helpEmbed] }).catch(() => {});
            message.delete().catch(() => {});
        },
    },

    help: {
        name: "help",
        description: "Shows a list of user commands",
        execute(message, args, client) {
            const randomColor = Math.floor(Math.random() * 16777215);

            const helpEmbed = new EmbedBuilder()
                .setColor(randomColor)
                .setTitle("Bot Commands")
                .setDescription(
                    "**;profile or ;p** → See your profile \n\n" +
                    "**;link** → Link an ID (`;link #tag`)\n\n" +
                    "**;compo**  → Gives compo of clans by ;compo #clantag\n\n" +
                    "**!fwa** → FWA overview\n\n" +
                    "**!bases** → FWA base links"
                )
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setTimestamp();

            message.channel.send({ embeds: [helpEmbed] }).catch(() => {});
            message.delete().catch(() => {});
        },
    }
};
