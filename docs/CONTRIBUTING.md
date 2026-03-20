# 🤝 Contributing Guide

> How we work together on this hackathon project.

---

## Branch Strategy

```
main                ← stable, merged code only
├── feature/<name>  ← one branch per feature / teammate
├── fix/<name>      ← bug fixes
└── docs/<name>     ← documentation-only changes
```

### Rules

- **Never push directly to `main`** — always use a feature branch.
- **One feature = one branch = one person** — this avoids conflicts.
- Pull from `main` frequently: `git pull origin main` before starting work.
- Rebase preferred over merge: `git pull --rebase origin main`.

---

## File Ownership to Avoid Conflicts

| What | Where | Who edits |
|------|-------|-----------|
| Feature code | `src/<area>/feature-<name>/` | Feature owner only |
| Feature doc | `docs/features/feature-<name>.md` | Feature owner only |
| Changelog | `docs/CHANGELOG.md` (your section only) | Each teammate |
| Master index | `docs/MASTER.md` | Whoever adds a new feature doc |
| Shared utils | `src/shared/` | Coordinate first! |

---

## Commit Message Format

```
<type>: <short description>

Types:
  feat     — new feature
  fix      — bug fix
  docs     — documentation only
  style    — formatting, no code change
  refactor — restructuring, no behavior change
  test     — adding or updating tests
  chore    — build, deps, config
```

**Examples:**
- `feat: add user login form`
- `docs: add feature doc for auth`
- `fix: resolve null pointer in dashboard`

---

## Workflow

1. `git checkout -b feature/<name>` from `main`
2. Work on your feature (code + feature doc)
3. Log changes in `docs/CHANGELOG.md` under **your section**
4. Commit often with clear messages
5. Push your branch: `git push origin feature/<name>`
6. Open a Pull Request → get review → merge to `main`
7. Update `docs/MASTER.md` feature table after merge

---

## AI Agent Users

See [AI_GUIDE.md](./AI_GUIDE.md) for detailed instructions on using AI coding agents on this project.

---

*Back to [Master Index](./MASTER.md)*
