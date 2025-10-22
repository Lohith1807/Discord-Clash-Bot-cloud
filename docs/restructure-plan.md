# Discord Clash Bot Project Restructuring Plan

## Current Analysis
The project appears to be a Discord bot for Clash of Clans with various features including clan management, player profiles, and war tracking.

## Proposed Directory Structure
```
Discord-Clash-Bot-cloud/
├── src/
│   ├── commands/           # All bot commands
│   ├── modules/           # Core functionality modules
│   │   ├── clan/         # Clan-related functionality
│   │   ├── player/       # Player-related functionality
│   │   └── war/         # War-related functionality
│   ├── utils/            # Utility functions and helpers
│   ├── data/            # Data models and schemas
│   └── config/          # Configuration files
├── docs/                # Documentation
├── tests/              # Future test files
└── scripts/            # Utility scripts

Root level files:
- package.json
- .gitignore
- README.md
- .env (if exists)
- index.js (entry point)
```

## Sprint Plan

### Sprint 1: Initial Setup and Documentation (Current)
- [x] Create docs directory
- [x] Create restructure plan
- [ ] Create git branch for restructuring
- [ ] Backup current state

### Sprint 2: File Analysis and Categorization
- [ ] Analyze all JS files and their purposes
- [ ] Categorize files by functionality
- [ ] Map dependencies between files
- [ ] Create file movement plan

### Sprint 3: Directory Structure Implementation
- [ ] Create new directory structure
- [ ] Move command files to src/commands
- [ ] Organize clan-related files
- [ ] Organize player-related files
- [ ] Organize war-related files
- [ ] Move utility functions

### Sprint 4: Update References and Testing
- [ ] Update all import/require paths
- [ ] Update package.json if needed
- [ ] Test bot functionality
- [ ] Verify all features work

### Sprint 5: Documentation and Cleanup
- [ ] Update documentation
- [ ] Remove any temporary files
- [ ] Create final structure documentation
- [ ] Prepare pull request

## Files to be Moved/Reorganized:
1. Command files:
   - help.js → src/commands/
   - ping.js → src/commands/
   - setup.js → src/commands/

2. Clan Module:
   - clan.js → src/modules/clan/
   - clandata.json → src/data/
   - claninfo.js → src/modules/clan/
   - clanlink.js → src/modules/clan/

3. Player Module:
   - player.js → src/modules/player/
   - profile.js → src/modules/player/
   - userdata.json → src/data/

4. War Module:
   - war.js → src/modules/war/
   - cwl.js → src/modules/war/

5. Utility Files:
   - handler.js → src/utils/
   - deploy-commands.js → src/utils/

## Requested Permissions
Before proceeding with each sprint, I will request explicit permission for:
1. Creating the new branch
2. Moving files to new locations
3. Updating import paths
4. Making any structural changes

## Success Criteria
- All files properly categorized
- No broken dependencies
- All bot commands working
- Clean and intuitive structure
- No data loss
- Working npm scripts