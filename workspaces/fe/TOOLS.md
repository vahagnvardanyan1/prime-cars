# TOOLS — What You Use

You execute everything yourself using native tools. No intermediate services.

## Git (Your Most Important Tool)

You are expected to handle git professionally. This means:

### Cloning & Setup
```bash
WORK_DIR=$(mktemp -d)
git clone https://x-access-token:$GITHUB_TOKEN@github.com/<owner>/<repo>.git "$WORK_DIR"
cd "$WORK_DIR"
```

### Branching
```bash
git checkout -b feat/<description>    # new feature
git checkout -b fix/<description>     # bug fix
git checkout -b refactor/<description> # refactoring
git checkout -b test/<description>    # adding tests
```

### Committing
```bash
# Stage specific files (preferred)
git add src/components/Button.tsx src/components/Button.test.tsx

# Or stage all if changes are cohesive
git add -A

# Write clear commit messages
git commit -m "feat: add Button component with hover state

- Implements primary and secondary variants
- Adds unit tests for click handler and disabled state
- Follows existing component patterns from Card.tsx"
```

Commit message format: `<type>: <short description>` where type is `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`, `ci`.

### Rebasing Before Push
```bash
git fetch origin
git rebase origin/main
# If conflicts: resolve them manually, then:
# git add <resolved-files>
# git rebase --continue
```

### Conflict Resolution

When you encounter merge conflicts:
1. Read both versions carefully
2. Understand the intent of each change
3. Merge them correctly (don't just pick one side blindly)
4. Test after resolving

### Inspecting History
```bash
git log --oneline -20                        # recent commits
git log --oneline -10 -- src/components/     # commits touching a path
git diff origin/main...HEAD --name-only      # files changed in branch
git diff origin/main...HEAD --stat           # change summary
git blame -L 10,30 src/utils/auth.ts         # who wrote these lines
git show HEAD~2:src/config.ts                # file at a past commit
```

## GitHub CLI (`gh`)

### Pull Requests
```bash
# Create PR
gh pr create --title "feat: add dark mode" --body "..." --repo owner/repo

# View PR details
gh pr view 42 --repo owner/repo --json title,body,reviews,files

# Checkout a PR locally
gh pr checkout 42

# Comment on PR
gh pr comment 42 --body "Fixed the issues from review" --repo owner/repo
```

### Issues
```bash
# View issue details (get labels, description, assignees)
gh issue view 15 --repo owner/repo --json title,body,labels,assignees

# Comment on issue
gh issue comment 15 --body "Working on this" --repo owner/repo
```

### CI/CD
```bash
# List recent failed runs
gh run list --status failure --limit 5 --json databaseId,name,conclusion --repo owner/repo

# View failure logs
gh run view <run-id> --log-failed --repo owner/repo
```

### Code Review (posting reviews)
```bash
# Submit a review
gh pr review 42 --approve --body "LGTM" --repo owner/repo
gh pr review 42 --request-changes --body "See comments" --repo owner/repo

# Inline review comments via API
gh api repos/owner/repo/pulls/42/reviews \
  -f body="Review summary" \
  -f event="COMMENT" \
  -f 'comments[][path]=src/App.tsx' \
  -f 'comments[][position]=15' \
  -f 'comments[][body]=Consider using useMemo here'
```

## Package Managers

Detect from lock file. **If the required package manager is not installed, install it yourself or fall back. NEVER ask for help.**

### Detection & Install Fallback Chain

**npm (package-lock.json):**
```bash
# npm is always available. Just use it.
npm ci
```

**pnpm (pnpm-lock.yaml):**
```bash
# Step 1: Try pnpm directly
pnpm install --frozen-lockfile 2>/dev/null && echo "DONE" || {
  # Step 2: Try npx (downloads pnpm temporarily)
  npx pnpm install --frozen-lockfile 2>/dev/null && echo "DONE" || {
    # Step 3: Install pnpm globally
    npm install -g pnpm 2>/dev/null && pnpm install --frozen-lockfile && echo "DONE" || {
      # Step 4: Install pnpm locally and use via npx
      npm install pnpm && npx pnpm install --frozen-lockfile 2>/dev/null && echo "DONE" || {
        # Step 5: Last resort — delete pnpm lock, use npm
        echo "WARNING: pnpm unavailable, falling back to npm"
        rm -f pnpm-lock.yaml
        npm install
      }
    }
  }
}
```

**yarn (yarn.lock):**
```bash
# Step 1: Try yarn directly
yarn install --frozen-lockfile 2>/dev/null && echo "DONE" || {
  # Step 2: Try npx
  npx yarn install --frozen-lockfile 2>/dev/null && echo "DONE" || {
    # Step 3: Install globally
    npm install -g yarn 2>/dev/null && yarn install --frozen-lockfile && echo "DONE" || {
      # Step 4: Last resort — delete yarn lock, use npm
      echo "WARNING: yarn unavailable, falling back to npm"
      rm -f yarn.lock
      npm install
    }
  }
}
```

**bun (bun.lockb):**
```bash
# Step 1: Try bun directly
bun install --frozen-lockfile 2>/dev/null && echo "DONE" || {
  # Step 2: Install bun
  npm install -g bun 2>/dev/null && bun install --frozen-lockfile && echo "DONE" || {
    # Step 3: Last resort — delete bun lock, use npm
    echo "WARNING: bun unavailable, falling back to npm"
    rm -f bun.lockb
    npm install
  }
}
```

### Running Scripts

| Manager | Run Script |
|---------|------------|
| npm | `npm run <script>` |
| pnpm | `pnpm run <script>` or `npx pnpm run <script>` |
| yarn | `yarn <script>` or `npx yarn <script>` |
| bun | `bun run <script>` |

If the manager is unavailable for running scripts, use `npx` as a universal fallback.

## Validation Pipeline

Run before every push. **If a tool is missing, use the fallback. NEVER ask for help.**

```bash
# 1. TypeScript (if tsconfig.json exists)
[ -f tsconfig.json ] && {
  npx tsc --noEmit 2>&1 || ./node_modules/.bin/tsc --noEmit 2>&1 || echo "SKIP: tsc not available"
}

# 2. Lint (detect which tool from package.json scripts)
npm run lint 2>&1 || npx eslint . --ext .ts,.tsx,.js,.jsx 2>&1 || echo "SKIP: no linter configured"

# 3. Tests
npm test -- --passWithNoTests 2>&1 || npx vitest run --passWithNoTests 2>&1 || echo "SKIP: no test runner configured"

# 4. Build (if "build" script exists in package.json)
grep -q '"build"' package.json 2>/dev/null && {
  npm run build 2>&1 || echo "BUILD FAILED — will document in PR"
}
```

If any step fails → fix the issue → re-run the full pipeline (up to 2 fix cycles).
If a tool is genuinely not available → skip it silently and note "N/A" in validation results.
**NEVER ask for help installing tools. Use npx, ./node_modules/.bin/, or skip.**

## File Operations

- **Read files** to understand context, imports, patterns, types
- **Write/edit files** only in the cloned repo (`$WORK_DIR`)
- **Never write to your workspace directory** (`workspaces/fe/`)
- **Detect file patterns** before creating new files: check how existing similar files are structured

## Environment

- **Repos cloned to:** temp directories via `mktemp -d`
- **Authentication:** `GITHUB_TOKEN` env var (injected by OpenClaw)
- **Node.js:** Available globally
- **npm:** Available globally (always your fallback package manager)
- **npx:** Available globally (your universal tool runner — use it when a tool is missing)
- **Git:** Available globally
- **gh CLI:** Available globally

## Self-Sufficiency Rule

**You NEVER ask for permissions, elevated access, or tool installations.** You solve every environment problem yourself:

- Missing tool → `npx <tool>` or `./node_modules/.bin/<tool>` or skip
- Missing package manager → install via npm or fall back to npm (see Package Managers section)
- Permission denied → use local install paths, npx, or project-local binaries
- Any blocker → find a workaround or skip and document

Your response to PM should NEVER contain questions like "Could you install X?" or "Can you enable Y?". Only results.
