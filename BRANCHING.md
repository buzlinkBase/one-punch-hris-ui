# Branching & Merging Rules

## Protected Branches

`main`, `dev`, and `production` are protected. **No direct pushes are allowed.**
All changes must go through a Pull Request and be reviewed/approved before merging.

| Branch       | Purpose                              | Direct push |
| ------------ | ------------------------------------ | ----------- |
| `main`       | Source of truth / integration branch | ❌ Blocked  |
| `dev`        | development preview                  | ❌ Blocked  |
| `staging`    | release candidate preview            | ❌ Blocked  |
| `production` | Live production deployment           | ❌ Blocked  |

## Branch Naming Convention

| Prefix     | Use case                                                                                    | Example                       |
| ---------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| `feature/` | New feature development, branched from `main` (also used for fixes landing in `main`)       | `feature/switch-tenant-setup` |
| `hotfix/`  | Branched from `production` to cherry-pick an already-merged `main` commit into `production` | `hotfix/login-token-refresh`  |

- Use lowercase, kebab-case after the prefix.
- Keep names short and descriptive of the change, not the ticket number alone.

## Workflow

### Feature Development

1. Branch off `main`: `feature/<name>`.
2. Commit work, push the branch, open a PR into `main`.
3. Require at least one approval before merging.
4. `main` is periodically merged into `dev` , `staging` via PR once stable.

### Hotfix to Production

1. Develop and merge the fix into `main` like a normal feature (`feature/<name>` branch, PR into `main`).
2. To ship the fix to `production`, branch off `production`: `hotfix/<name>`.
3. Cherry-pick the merged commit(s) from `main` onto the `hotfix/<name>` branch.
4. Open a PR from `hotfix/<name>` into `production`.

## Merging Rules

- **Always use `Squash and Merge`** when merging a PR — no other merge strategy is permitted. Never `push --force` or push directly to a protected branch.
- PRs must pass CI checks before merge.
- The CI pipeline must run and pass all tests before a PR can be merged — merging is blocked on any failing or pending test.
- Do not merge `feature/*` branches directly into `production`, `dev`,`staging` it should be merged to `main`.
- `hotfix/*` branches are branched off `production` and only ever merge into `production` — never into `main`, `dev`, or `staging`. The underlying fix must already be merged into `main` via a `feature/*` PR before it is cherry-picked into a `hotfix/*` branch.
