const TOKEN = "REDACTED_DISCORD_TOKEN";
const CLIENT_ID = "1403976210643685457";
const { REST, Routes } = require('discord.js');
const command = require('./setup.js');
const GUILD_ID = '1153720899715993681';

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('📡 Registering slash command...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [command.data.toJSON()] }
    );
    console.log('✅ Slash command registered.');
  } catch (err) {
    console.error('❌ Failed to register command:', err);
  }
})();
