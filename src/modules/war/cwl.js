const { EmbedBuilder } = require("discord.js");
const { getEmoji } = require("./emoji.js");
const arrow = getEmoji("arrow");
module.exports = {
  name: "cwl",
  description: "Shows information about Lazy CWL and Blood Alliance",

  async execute(client, message, args) {
       if (message.deletable) message.delete().catch(() => {});
    const cwlEmbed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle(`${arrow} What is Lazy CWL?`)
      .setDescription(
        "Lazy CWL is a smart strategy where we participate in FWA wars and CWL at the same time using a separate clan. It allows members to farm loot and earn medals without stress."
      )
      .setImage("https://cdn.discordapp.com/attachments/1154115415606308956/1407899566992261271/cwll.png")
      .addFields(
        {
          name: "<a:Animated_Arrow_Yellow:1398669829224927385> **Key Points:**",
          value: "\u200B",
        },
        {
          name: "1. Dual Participation",
          value:
            "We play FWA farming wars in our main clan and do CWL wars in a separate clan simultaneously.",
        },
        {
          name: "2. One Hit, Double Benefit",
          value:
            "<a:Animated_Arrow_Purple:1398669685981188236> Loot from FWA wars 💰\n<a:Animated_Arrow_Pink2:1398669899106353253> CWL medals from Lazy CWL 💎\n<a:Animated_Arrow_Purple:1398669685981188236> All with minimal effort!",
        },
        {
          name: "3. Stress-Free Gameplay",
          value:
            "No pressure to 3-star or perform at a competitive level — ideal for casual players and farmers.",
        },
        {
          name: "4. Separate Clan for CWL",
          value:
            "CWL is organized in a different clan, so FWA wars can continue uninterrupted in the main clan.",
        },
        {
          name: "5. Great for Growth",
          value:
            "Earn both resources and CWL medals every month — perfect for maxers and upgraders.",
        },
        {
          name: "<:Clan_Castle12:1397900728512807006> CWL Town Hall Placement Guide\n",
          value:
            "**1.** Max TH 17 | War Weight: 167K+ | CWL League: Master 1\n" +
            "**2.** Rush TH 17 & TH 16 | War Weight: Any | CWL League: Master 2\n" +
            "**3.** TH 15 & 14 | War Weight: Any | CWL League: Master 3\n" +
            "**4.** TH 13 & Below | War Weight: Any | CWL League: Crystal 1",
        },
        {
          name: "<a:PenguNoted:1398684210235183217> Summary:\n",
          value:
            "Lazy CWL = Double rewards with single effort!\n" +
            "FWA farming + CWL medals = Max growth <a:verifier:1376063356087304222>\n\n" +
            "Join **Blood Alliance** and experience the smart way to grow in Clash of Clans!",
        }
      );

    await message.channel.send({ embeds: [cwlEmbed] });
  },
};
