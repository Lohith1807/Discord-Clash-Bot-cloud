// handler.js

const profile = require('../commands/profile.js');

async function handleInteraction(interaction) {
    // BUTTONS
    if (interaction.isButton()) {
        const id = interaction.customId;

        // Route based on button ID
        if (id.startsWith("profile_")) {
            return await profile.handleButtonInteraction(interaction);
        }

        // Add more handlers here if needed
        // if (id.startsWith("modal_")) ...
    }

    // You can also handle modals, select menus, etc.
    // if (interaction.isSelectMenu()) { ... }

    return false; // Not handled
}

module.exports = { handleInteraction };
