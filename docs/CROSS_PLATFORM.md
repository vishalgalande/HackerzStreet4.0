# 🖥️ Cross-Platform Compatibility Guide

> **We have teammates on both Windows and macOS.** Follow these rules to avoid platform-specific issues.

---

## Line Endings (CRLF vs LF)

✅ **Already handled** — `.gitattributes` contains `* text=auto`, which auto-normalizes line endings.

No action needed. Git will store LF in the repo and convert to native endings on checkout.

---

## File Path Case Sensitivity

⚠️ **Be careful!**

| OS | Behavior |
|----|----------|
| Windows | Case-**insensitive** (`File.md` = `file.md`) |
| macOS | Case-**insensitive** by default (same as Windows) |
| Linux | Case-**sensitive** (`File.md` ≠ `file.md`) |

### Rules
- **Never** create two files that differ only by case (e.g., `Utils.js` and `utils.js`).
- Use **lowercase with hyphens** for all filenames: `feature-auth.md`, not `Feature_Auth.md`.
- Check with `git ls-files` if unsure what's tracked.

---

## Shell Scripts

If you write any shell scripts (`.sh`):

1. Use `#!/usr/bin/env bash` as the shebang (not `#!/bin/bash`).
2. **Do not** use Windows-only `.bat` or `.ps1` scripts for shared workflows.
3. If a Windows-specific script is needed, provide both `.sh` and `.bat` versions.
4. Set executable permission: `git update-index --chmod=+x script.sh`

---

## Environment Variables

- Use `.env` files for local config (already in `.gitignore`).
- Document required env vars in a `.env.example` file.
- macOS/Linux: `export VAR=value` | Windows: `set VAR=value` or use `cross-env` npm package.

---

## Package Managers & Dependencies

- Always commit lock files (`package-lock.json`, `requirements.txt`, `poetry.lock`).
- Run `npm ci` (not `npm install`) in CI to ensure reproducible installs.
- `node_modules/` is in `.gitignore` — never commit it.

---

## Common Gotchas

| Issue | Solution |
|-------|----------|
| `.DS_Store` files (macOS) | Added to `.gitignore` ✅ |
| `Thumbs.db` files (Windows) | Added to `.gitignore` ✅ |
| Path length limits (Windows) | Keep paths short, avoid deep nesting |
| `chmod` not working on Windows | Use `git update-index --chmod=+x` |
| Different Python paths | Use `python3` explicitly or virtual envs |

---

*Back to [Master Index](./MASTER.md)*
