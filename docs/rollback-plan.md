# Rollback Plan

## Backup Steps
1. Create a backup branch before any changes:
```bash
git checkout main
git checkout -b backup/pre-restructure
git push origin backup/pre-restructure
```

2. Backup all files:
```bash
# Create a backup directory
mkdir backup_YYYYMMDD
# Copy all files
cp -r * backup_YYYYMMDD/
```

## Rollback Procedure

### Quick Rollback
If issues are found immediately:
```bash
git reset --hard HEAD~1
git checkout main
```

### Full Rollback
If issues are found after multiple commits:
1. Revert to previous state:
```bash
git checkout main
git reset --hard backup/pre-restructure
```

2. Restore original file structure:
```bash
# Remove new directories
rm -rf src/
rm -rf docs/
# Restore from backup
cp -r backup_YYYYMMDD/* ./
```

## Testing After Rollback
1. Verify all commands work
2. Check file structure is restored
3. Test bot functionality
4. Verify data integrity

## Prevention Measures
1. Keep backup branch for 1 week
2. Document all changes
3. Test thoroughly before pushing to production
4. Maintain backup of all configuration files

## Emergency Contacts
- Repository Owner
- Bot Administrators
- Server Moderators