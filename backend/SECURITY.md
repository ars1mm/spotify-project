# Security Notice

## Exposed API Key

The RapidAPI key was accidentally committed to this repository. 

**Immediate Actions Required:**

1. **Revoke the exposed key** at https://rapidapi.com/developer/security
2. **Generate a new API key** 
3. **Update your local .env file** with the new key
4. **Never commit the actual secret.yaml** (it's now in .gitignore)

## Git History Cleanup

To remove the key from git history:

```bash
# Remove file from all commits
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend/k8s/secret.yaml' --prune-empty --tag-name-filter cat -- --all

# Force push to overwrite history
git push origin --force --all
```

**Warning**: This rewrites git history. Coordinate with all team members.