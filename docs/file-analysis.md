# File Analysis and Categorization

## Commands Module
1. **Discord Bot Commands**
   - `help.js` - Help command implementation
   - `ping.js` - Basic ping command
   - `setup.js` - Bot setup command
   - `profile.js` - Player profile command
   - `role.js` - Role management command
   - `sync.js` - Synchronization command

## Clan Module
1. **Core Clan Features**
   - `clan.js` - Core clan functionality
   - `claninfo.js` - Clan information handling
   - `clanlink.js` - Clan linking functionality
   - `bases.js` - Base management
   
2. **Data Files**
   - `clandata.json` - Clan data storage
   - `clanrole.json` - Clan role configurations
   - `clanroleinfo.js` - Clan role information handling

## Player Module
1. **Player Management**
   - `player.js` - Core player functionality
   - `link.js` - Player linking system
   - `unlink.js` - Player unlinking system
   - `nickall.js` - Nickname management
   
2. **Data Files**
   - `userdata.json` - User data storage

## War Module
1. **War Features**
   - `war.js` - Core war functionality
   - `cwl.js` - Clan War League features
   - `ww.js` - War-related utilities
   - `compo.js` - War composition handling
   - `crr.js` - War-related functionality
   - `fwa.js` - FWA-related features
   - `fwadata.js` - FWA data handling

## Utility Module
1. **Core Utilities**
   - `handler.js` - Command handler
   - `deploy-commands.js` - Command deployment
   - `index.js` - Main entry point
   - `emoji.js` - Emoji utilities
   - `mail.js` - Mail functionality

2. **Data Structures**
   - `linkedlist.js` - Linked list implementation
   - `linkedlistclan.js` - Clan-specific linked list

## Config Files
- `config.example.json` - Example configuration
- `package.json` - Project dependencies

## Planned File Movements
```
src/
├── commands/
│   ├── help.js
│   ├── ping.js
│   ├── setup.js
│   ├── profile.js
│   ├── role.js
│   └── sync.js
│
├── modules/
│   ├── clan/
│   │   ├── bases.js
│   │   ├── clan.js
│   │   ├── claninfo.js
│   │   ├── clanlink.js
│   │   └── clanroleinfo.js
│   │
│   ├── player/
│   │   ├── player.js
│   │   ├── link.js
│   │   ├── unlink.js
│   │   └── nickall.js
│   │
│   └── war/
│       ├── war.js
│       ├── cwl.js
│       ├── ww.js
│       ├── compo.js
│       ├── crr.js
│       ├── fwa.js
│       └── fwadata.js
│
├── utils/
│   ├── handler.js
│   ├── deploy-commands.js
│   ├── emoji.js
│   ├── mail.js
│   ├── linkedlist.js
│   └── linkedlistclan.js
│
├── data/
│   ├── clandata.json
│   ├── clanrole.json
│   ├── userdata.json
│   └── ticketdata.json
│
└── config/
    └── config.example.json
```

## Dependencies Analysis
1. Main Dependencies:
   - Entry point: `index.js` requires command handler and configurations
   - Command handler: `handler.js` requires all command files
   - Commands: Most command files require data files and utility functions

2. Circular Dependencies to Watch:
   - Clan and player modules might have circular references
   - War module dependencies on clan module

## Migration Strategy
1. Move data files first
2. Move utility files
3. Move core module files
4. Move command files
5. Update import paths
6. Test functionality after each major move