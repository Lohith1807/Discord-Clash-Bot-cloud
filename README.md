# Discord Clash Bot

A Discord bot for managing Clash of Clans related functionalities.

## Project Structure

```
src/
├── commands/      # Discord bot commands
├── modules/       # Core functionality modules
│   ├── clan/      # Clan management
│   ├── player/    # Player management
│   └── war/       # War management
├── utils/         # Utility functions
├── data/         # JSON data files
└── config/       # Configuration files
```

## Setup

1. Copy `config.example.json` to `config/config.json`
2. Update the configuration with your bot token and API keys
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Bot

```bash
# Start the bot
npm start

# Deploy commands
npm run deploy
```

## Features

- Clan management
- Player profiles
- War tracking
- Role management
- And more...

## Configuration

Make sure to set up the following in your `config.json`:
- Discord Bot Token
- Clash of Clans API Token
- Client ID
- Other required configurations