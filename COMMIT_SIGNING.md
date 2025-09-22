# Commit Signing (SSH) Guide

This project uses SSH-based commit signing for provenance. GitHub will show a green "Verified" badge when commits are signed.

## Prerequisites
- Git >= 2.34
- An SSH key (Ed25519 recommended) also configured for repository push access.

## One-Time Setup
1. Generate key (if you don’t have one):
   ```powershell
   ssh-keygen -t ed25519 -C "you@example.com" -f $env:USERPROFILE\.ssh\id_ed25519
   ```
2. Add the public key to GitHub: copy contents of:
   ```powershell
   Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
   ```
   Then: GitHub > Settings > SSH and GPG keys > New SSH key.
3. Configure Git for SSH signing:
   ```powershell
   git config --global gpg.format ssh
   git config --global user.signingkey (Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub -Raw)
   git config --global commit.gpgsign true
   ```

## Per-Repository Override (Optional)
Inside repo:
```powershell
git config gpg.format ssh
git config user.signingkey (Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub -Raw)
git config commit.gpgsign true
```

## Making a Signed Commit
Just commit normally:
```powershell
git add .
git commit -m "feat: something (#Issue)"
```
Git auto-signs because `commit.gpgsign` is true.

## Verifying Locally
```powershell
git log --show-signature -1
```

## Temporarily Disable Signing
```powershell
git -c commit.gpgsign=false commit -m "chore: unsigned hotfix"
```

## Rotating Keys
1. Generate new key.
2. Add to GitHub.
3. Update signing key config.

## Troubleshooting
| Symptom | Fix |
|---------|-----|
| Commit not verified on GitHub | Ensure the public key is added to GitHub and matches the one configured as `user.signingkey`. |
| "gpg.ssh.allowedSignersFile" error | Update Git to latest or remove conflicting GPG settings. |
| Multiple keys used | Explicitly set `user.signingkey` per repo. |

## Security Tips
- Protect private key with good filesystem permissions.
- Avoid committing from untrusted machines.
- Rotate if compromised or leaked.

---
Maintained automatically—update if signing policy changes.
