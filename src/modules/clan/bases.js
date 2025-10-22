// bases.js
const { EmbedBuilder } = require("discord.js");
const { getEmoji } = require("./emoji.js");  // <-- updated path here

module.exports = {
    name: "bases",
    description: "Show FWA base links",
    async execute(message, args) {
        const randomColor = Math.floor(Math.random() * 16777215);
		 if (message.deletable) message.delete().catch(() => {});
        const embed = new EmbedBuilder()
            .setTitle(`${getEmoji("bluefwa")} FWA BASE LINKS`)
            .setDescription("## Click on the links to open in game !!")
            .setColor(randomColor)
            .addFields(
                {
                    name: `TH 17 FWA BASE ${getEmoji("whitefwa")}`,
                    value: `${getEmoji("th17")} [Open In Game](https://link.clashofclans.com/en?action=OpenLayout&id=TH17%3AWB%3AAAAAKQAAAAKAXy6Wil-Gwz5NOnQ1t3jZ)`,
                    inline: false
                },
                {
                    name: `TH 16 FWA BASE ${getEmoji("whitefwa")}`,
                    value: `${getEmoji("th16")} [Open In Game](https://link.clashofclans.com/en?action=OpenLayout&id=TH16%3AWB%3AAAAAAwAAAALS4aI1VlwftHEX42XGlLZr)`,
                    inline: false
                },
                {
                    name: `TH 15 FWA BASE ${getEmoji("whitefwa")}`,
                    value: `${getEmoji("th15")} [Open In Game](https://link.clashofclans.com/en?action=OpenLayout&id=TH15%3AWB%3AAAAAKwAAAAJXo-tsMdZB98J3NhSdiAkq)`,
                    inline: false
                },
                {
                    name: `TH 14 FWA BASE ${getEmoji("whitefwa")}`,
                    value: `${getEmoji("th14")} [Open In Game](https://link.clashofclans.com/en?action=OpenLayout&id=TH14%3AWB%3AAAAACwAAAAKPredQRfFAzMMeoG7KdALi)`,
                    inline: false
                },
                {
                    name: `TH 13 FWA BASE ${getEmoji("whitefwa")}`,
                    value: `${getEmoji("th13")} [Open In Game](https://link.clashofclans.com/en?action=OpenLayout&id=TH13%3AWB%3AAAAAQgAAAAIWODTV3cHR7wJzCKeryI6m)`,
                    inline: false
                },
                {
                    name: `TH 12 FWA BASE ${getEmoji("whitefwa")}`,
                    value: `${getEmoji("th12")} [Open In Game](https://link.clashofclans.com/enaction=OpenLayout&id=TH12%3AWB%3AAAAAKQAAAAJqDMYjn7fnIw5QrRF22S-u)`,
                    inline: false
                }
            )
            .setFooter({ text: `Last updated: 14/08/2025` });

        await message.channel.send({ embeds: [embed] });
    }
};
