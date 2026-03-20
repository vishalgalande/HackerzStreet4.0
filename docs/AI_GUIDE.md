# 🤖 AI Agent Guide

> **How to use AI coding agents (Antigravity, Copilot, Cursor, etc.) on this project without causing merge conflicts or breaking the workflow.**

---

## Golden Rules for AI Agents

1. **Stay in your lane** — only edit files related to YOUR feature.
2. **Never touch another teammate's feature files** without coordination.
3. **Always document** before you commit.
4. **Pull before you push** — always rebase on `main` first.
5. **One feature per branch, one branch per person.**
6. **Never hardcode API keys, passwords, or tokens** in source code — use env vars.

---

## 🔐 Environment Variables

> [!CAUTION]
> **`.env` files are gitignored and must NEVER be committed.** They contain secrets (API keys, DB passwords, tokens) that must stay local.

### Setup

```bash
# Copy the template to create your local .env
cp .env.example .env

# Fill in your values in .env
# Each teammate maintains their own .env locally
```

### Rules for AI Agents

- ❌ **NEVER** hardcode API keys, passwords, or tokens directly in source code
- ✅ **DO** use `.env` files for secrets and read them via `process.env.VAR_NAME` or equivalent
- ✅ **DO** add new required variables to `.env.example` (with empty/placeholder values)
- ✅ **DO** use `process.env.VAR_NAME` or equivalent to read env vars in code
- ✅ **DO** document new env vars in your feature doc's **Notes** section

### If You Need a New Env Variable

1. Add it to `.env.example` with a comment and empty value
2. Add it to your local `.env` with the real value
3. Document it in your feature doc (`docs/features/feature-<name>.md`)
4. Tell teammates to pull and update their `.env`

### What's Already Gitignored

```
.env
.env.local
.env.*.local
```

See [.env.example](../.env.example) for the full template.

---

## Before Starting Work

Run this checklist every time you begin a session:

```bash
# 1. Switch to your feature branch
git checkout feature/<your-feature>

# 2. Pull latest changes from main
git pull --rebase origin main

# 3. Check for any conflicts
git status

# 4. Read the relevant feature doc
# Open docs/features/feature-<your-feature>.md
```

Tell your AI agent:
> "Read `docs/MASTER.md` and `docs/features/feature-<name>.md` before making any changes."

---

## How to Structure Your Work

### File Isolation Strategy

To **prevent merge conflicts**, each feature's code should live in its own directory:

```
src/
├── frontend/
│   ├── feature-<name>/      ← YOUR feature's frontend code
│   │   ├── index.js
│   │   ├── styles.css
│   │   └── ...
│   └── shared/               ← ⚠️ Coordinate before editing
│
├── backend/
│   ├── feature-<name>/       ← YOUR feature's backend code
│   │   ├── routes.js
│   │   ├── controller.js
│   │   └── ...
│   └── shared/               ← ⚠️ Coordinate before editing
│
└── shared/                    ← ⚠️ Coordinate before editing
```

> [!CAUTION]
> **NEVER** let your AI agent edit files outside your feature directory without explicit coordination with the team. Shared files (`shared/`, root configs, `package.json`) are conflict hotspots.

---

## How to Commit

### Step 1: Update Your Feature Doc

Before committing, update your feature doc at `docs/features/feature-<name>.md`:
- Update the **Status** field
- Add new files to the **Files & Directories** table
- Note any decisions in **Notes**

### Step 2: Log in the Changelog

Add an entry **in your section only** of `docs/CHANGELOG.md`:

```markdown
| 2026-03-20 | Added login form component | `src/frontend/feature-auth/LoginForm.js` |
```

### Step 3: Commit with a Clear Message

```bash
# Use the conventional format
git add .
git commit -m "feat: add login form component"
```

### Step 4: Push

```bash
git push origin feature/<your-feature>
```

---

## AI Agent Prompt Templates

Copy-paste these into your AI agent to keep it aligned:

### Starting a Session
```
Read the following files before doing anything:
- docs/MASTER.md
- docs/AI_GUIDE.md
- docs/features/feature-<name>.md
- docs/CHANGELOG.md

I am working on the "<feature-name>" feature on branch "feature/<name>".
Only edit files inside src/<area>/feature-<name>/ unless I explicitly say otherwise.
```

### Before Committing
```
Before I commit, please:
1. Update docs/features/feature-<name>.md with current status and file list
2. Add a changelog entry in docs/CHANGELOG.md under MY section only
3. Show me a summary of all files changed
```

### Checking for Conflicts
```
Run: git diff --name-only origin/main
Show me which files I've changed that might conflict with other branches.
Flag any files outside my feature directory.
```

---

## Handling Shared Files

Some files are shared across features and are **high-risk for conflicts**:

| File | Risk Level | How to Handle |
|------|-----------|---------------|
| `package.json` / `requirements.txt` | 🔴 High | Coordinate via team chat before editing |
| `src/shared/*` | 🔴 High | Discuss changes, one person edits at a time |
| `docs/MASTER.md` | 🟡 Medium | Only add your feature row, don't restructure |
| `docs/CHANGELOG.md` | 🟢 Low | Each person edits ONLY their own section |
| `.env.example` | 🟡 Medium | Add your vars at the end, don't reorder |

### If You Must Edit a Shared File

1. **Announce** in the team chat: "I'm editing `package.json` to add X dependency."
2. **Do it quickly** — make the change, commit, and push immediately.
3. **Tell others** to pull after your push.

---

## Conflict Resolution

If you hit a merge conflict:

```bash
# 1. See what's conflicting
git status

# 2. For each conflicted file, open it and look for conflict markers
#    <<<<<<< HEAD
#    (your changes)
#    =======
#    (their changes)
#    >>>>>>> main

# 3. Resolve manually or ask your AI:
#    "Resolve the merge conflict in <file>. Keep both changes where possible."

# 4. Mark as resolved
git add <resolved-file>
git rebase --continue
```

---

## Pre-Commit Checklist

Before every commit, verify:

- [ ] All changes are **inside your feature directory** (or coordinated)
- [ ] `docs/features/feature-<name>.md` is **updated**
- [ ] `docs/CHANGELOG.md` has an entry **in your section**
- [ ] `git status` shows **no untracked junk files**
- [ ] Code **builds/runs** without errors
- [ ] Commit message follows the **conventional format**

---

## Don'ts for AI Agents

❌ Don't auto-format or lint the entire codebase — only your files
❌ Don't rename or move files owned by other teammates
❌ Don't edit global config files without team coordination
❌ Don't create files outside the established directory structure
❌ Don't delete files you didn't create
❌ Don't commit `.env`, `node_modules/`, or OS files (`.DS_Store`, `Thumbs.db`)

---

## 🍎 Extra Steps for macOS Users

If you (or your AI agent) are working on a **Mac**, keep these differences in mind:

### Environment Setup

```bash
# Use cp (not copy) to create your .env
cp .env.example .env

# If using Homebrew for dependencies (Node, Python, etc.)
brew install node python
```

### File Permissions

```bash
# Make shell scripts executable (Git won't track this on Windows)
chmod +x scripts/*.sh

# Or via Git so it persists for everyone
git update-index --chmod=+x scripts/your-script.sh
```

### .DS_Store Cleanup

macOS auto-generates `.DS_Store` files in every folder. They're gitignored, but if one was accidentally committed:

```bash
# Remove all .DS_Store files from Git tracking
find . -name '.DS_Store' -type f -delete
git rm --cached -r -f $(find . -name '.DS_Store')
git commit -m "chore: remove .DS_Store files"
```

### Shell Commands Differences

| Action | Windows (PowerShell) | macOS (Terminal) |
|--------|---------------------|------------------|
| Copy file | `copy .env.example .env` | `cp .env.example .env` |
| Delete file | `del file.txt` | `rm file.txt` |
| Set env var | `$env:VAR="value"` | `export VAR=value` |
| List files | `dir` | `ls` |
| Clear terminal | `cls` | `clear` |

### Path Separator

- Windows uses **backslashes**: `src\frontend\feature-auth\`
- macOS uses **forward slashes**: `src/frontend/feature-auth/`
- In code, **always use forward slashes** or `path.join()` / `os.path.join()` for cross-compat.

> [!TIP]
> For the full cross-platform guide, see [CROSS_PLATFORM.md](./CROSS_PLATFORM.md).

---

*Back to [Master Index](./MASTER.md)*

