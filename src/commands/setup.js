const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const { getEmoji, getEmojiObject } = require("./emoji.js");
const emojiCoc = getEmojiObject('coc');
const emojiCrown = getEmojiObject('crown');
const emojiWow = getEmojiObject('wow');
const emojiDrop = getEmojiObject('drop');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the ticket system')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the ticket button')
        .setRequired(true)
    )
    // 🔒 Only admins can use this command
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Extra permission safety check
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ You must have **Administrator** permissions to use this command.',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setTitle(`${getEmoji("arrow")} Apply to be a part of Blood Alliance!`)
      .setDescription(
        `Thank you for showing interest in The Blood Alliance!\n` +
        `Before we proceed, please link your account(s) to initiate a ticket and begin your journey.\n\n` +
        `Whether you're here to apply for one of our FWA clans, support the Blood Alliance as a dedicated staff member, join our growing family of warriors, or enjoy the ride in Lazy CWL — you're more than welcome. We're glad to have you!\n\n` +
        `• Want to **join a clan?** – Click ${getEmoji("coc")} Clan Entry.\n` +
        `• Want to **become a rep and help our clans grow?** – Click ${getEmoji("crown")} Rep apply.\n` +
        `• Want to **support us in any other way?** – Click ${getEmoji("wow")} Staff Apply.\n` +
        `• Want your **clan to join the alliance?** – Click ${getEmoji("drop")} Alliance Join.\n\n` +
        `Welcome to the Blood Alliance. Let the journey begin!`
      )
      .setColor(0xED4245)
      .setFooter({
        text: 'Blood Alliance',
        iconURL: 'https://cdn.discordapp.com/attachments/1387050356260999279/1391403114497704107/image-1.png?ex=686bc4a1&is=686a7321&hm=20b38234a2a1eed2ab13184ce6b56d562d97169a7fbb6fa7be8e2d9d9e52cd53&'
      })
      .setImage('https://media.discordapp.net/attachments/1393502624568836248/1398217256428896308/assets2Ftask_01k10a8ddqejd8mk3n9ky55gvy2F1753431283_img_0.png?ex=68d6f48b&is=68d5a30b&hm=5cf4234da6b9f6a9de702964d3329310c7c931420c3da8bd87964c41ef8707a7&format=webp&quality=lossless&width=719&height=479');

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply_clan')
        .setLabel('Apply to clan')
        .setEmoji(emojiCoc)
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('rep_apply')
        .setLabel('Rep Apply')
        .setEmoji(emojiCrown)
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('staff_apply')
        .setLabel('Staff Apply')
        .setEmoji(emojiWow)
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('alliance_apply')
        .setLabel('Alliance Apply')
        .setEmoji(emojiDrop)
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('link_account')
        .setLabel('Link Account')
        .setEmoji('🔗') // Unicode emoji
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [buttons] });
    await interaction.reply({ content: '✅ Ticket system setup complete.', ephemeral: true });
  }
};
