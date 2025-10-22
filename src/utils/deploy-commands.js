const { botToken, clientId } = require("../config/config.json");
// Use values from config.json; keep config.json out of version control
const TOKEN = botToken;
const CLIENT_ID = clientId || "1403976210643685457";
const { REST, Routes } = require('discord.js');
const command = require('../commands/setup.js');
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
