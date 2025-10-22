const { EmbedBuilder } = require("discord.js");
const { getEmoji } = require("./emoji.js");
module.exports = {
    name: 'war',
    description: 'Show instructions to calculate Clash of Clans war weight.',
    execute(message) {
         if (message.deletable) message.delete().catch(() => {});
        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle('How to check war weight:')
            .setDescription(
                `${getEmoji("bluestar")} **Step 1**: Post a friendly challenge of any base and scout your base, incase if all your bases are locked to post an friendly challenge then please check during the battle day (by scouting your base).\n\n` +
                `${getEmoji("bluestar")} **Step 2**: After scouting please click on to the Townhall and select the info button.\n\n` +
                `${getEmoji("bluestar")} **Step 3**: Multiply the amount of gold (Or) elixir storage in your townhall by 5\n\n` +
                `\`\`\`For example ~ If your elixer value is 31800 in townhall, then your weight will be 31800 x 5 = 159000\`\`\`\n`             
            )
            .setImage('https://media.discordapp.net/attachments/1036981585150484481/1245434044079145101/20240529_232153.jpg?format=webp&width=1403&height=890')
            .setFooter({ text: 'Blood Alliance' });

        message.channel.send({ embeds: [embed] });
    }
};
