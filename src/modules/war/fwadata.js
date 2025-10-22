const { EmbedBuilder } = require("discord.js");
const cheerio = require("cheerio");
const { getEmoji } = require('../../utils/emoji.js');

async function fwaClanData(tag) {
    const url = `https://fwastats.com/Clan/${tag.replace("#", "")}/Members.json`;
    const url2 = `https://fwastats.com/Clan/${tag.replace("#", "")}/Weight`;

    const res1 = await fetch(url);
    if (!res1.ok) throw new Error("Failed to fetch FWA members JSON");
    const clanData = await res1.json();

    const res2 = await fetch(url2);
    if (!res2.ok) throw new Error("Failed to fetch FWA weight page");
    const html = await res2.text();
    const $ = cheerio.load(html);

    const clanName = $("body > div.container.body-content.fill > div.well > div > div > h3").text().trim();

    let lastDate =
        $("body > div.container.body-content.fill > div.alert.alert-success > strong").text().trim() ||
        $("body > div.container.body-content.fill > div.alert.alert-warning > strong").text().trim() ||
        "Clan weight submission was too long ago or not found";

    // Use getEmoji() to dynamically fetch emojis from emoji.js
    const thEmojiMap = {
        17: getEmoji("th17"),
        16: getEmoji("th16"),
        15: getEmoji("th15"),
        14: getEmoji("th14"),
        13: getEmoji("th13"),
        12: getEmoji("th12"),
        11: getEmoji("th11"),
    };

    const clanWeight = {};
    for (const member of clanData) {
        try {
            const playerName = member.name;
            const townHallLevel = member.townHall;
            const weight = parseInt(member.weight, 10);

            let equivalent;
            if (weight > 160000 && weight <= 169000) equivalent = 17;
            else if (weight > 150000 && weight <= 160000) equivalent = 16;
            else if (weight > 140000 && weight <= 150000) equivalent = 15;
            else if (weight > 130000 && weight <= 140000) equivalent = 14;
            else if (weight > 120000 && weight <= 130000) equivalent = 13;
            else if (weight > 110000 && weight <= 120000) equivalent = 12;
            else if (weight > 90000 && weight <= 110000) equivalent = 11;
            else equivalent = townHallLevel;

            clanWeight[playerName] = {
                townHall: townHallLevel,
                weight,
                eqvweight: equivalent
            };
        } catch {
            // ignore broken data
        }
    }

    const sortedClanWeight = Object.entries(clanWeight)
        .sort((a, b) => b[1].weight - a[1].weight);

    // Pagination: 20 per page
    const perPage = 20;
    const pages = [];
    const totalPages = Math.ceil(sortedClanWeight.length / perPage);

    for (let page = 0; page < totalPages; page++) {
        const fields = sortedClanWeight.slice(page * perPage, (page + 1) * perPage).map(([player, data], index) => ({
            name: `${page * perPage + index + 1}. ${player}`,
            value: `${thEmojiMap[data.townHall] || `TH${data.townHall}`} | ⚖ ${data.weight.toLocaleString()} | Real Weight: ${thEmojiMap[data.eqvweight] || `TH${data.eqvweight}`}`,
            inline: false
        }));

        const embed = new EmbedBuilder()
            .setTitle(`${getEmoji("clancastle")} ${clanName} — FWA Weight Report`)
            .setDescription(`Last Submission: **${lastDate}**\n📄 Page ${page + 1} of ${totalPages}`)
            .setColor("Random")
            .addFields(fields)
            .setFooter({ text: "Data from FWA Stats", iconURL: "https://fwastats.com/favicon.ico" })
            .setTimestamp();

        pages.push(embed);
    }

    return pages;
}

module.exports = fwaClanData;
