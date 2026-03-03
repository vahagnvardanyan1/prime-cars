---
name: implement
slug: implement
version: "2.1.0"
description: "Full autonomous frontend implementation: check repo cache, clone if needed, install deps, verify baseline health, consult learnings, plan, generate code, self-review (×3), validate (×2 full passes), run pre-push hooks, rebase, commit with scope detection, push, create MR with test steps, log outcome to learnings. Returns MR URL. Use when [SKILL]: implement, labels include ai-agent or automated, or issues.assigned event."
metadata: {"openclaw":{"emoji":"⚙️","requires":{"bins":["git","gh","npm"]},"os":["linux","darwin","win32"]}}
---

## Triggers

- Label: `ai-agent`, `automated`
- Event: `issues.assigned`
- Keyword: `@ai-agent implement`
- `[SKILL]: implement` in task message

## Full Pipeline (no pause points — every step runs automatically)

```
RECEIVE → PARSE
→ REPO CACHE CHECK        ← check ~/.openclaw/cache before re-cloning
→ INSTALL + BASELINE      ← npm install, verify project was healthy before changes
→ ONBOARD                 ← detect language, framework, conventions
→ CONSULT LEARNINGS       ← read .learnings/ for relevant prior knowledge
→ PLAN                    ← break task into ≤10 steps
→ CODE                    ← generate changes with deep context
→ SELF-REVIEW (×3)        ← fix all error/critical issues each iteration
→ VALIDATE PASS 1         ← tsc + eslint + npm test
→ VALIDATE PASS 2         ← independent second full pass
→ PRE-PUSH CHECKS         ← Husky, lint-staged, custom pre-push scripts
→ REBASE                  ← onto origin/main
→ COMMIT                  ← conventional commit with detected scope
→ PUSH
→ CREATE MR               ← enhanced body with How to Test + Pre-Push results
→ LOG TO LEARNINGS        ← append outcome to .learnings/
→ REPORT MR URL
```

---

## Step 1 — Parse Task

Extract from the task message:
- `[REPO]`: full GitHub URL (required — reject immediately if missing)
- `[TITLE]`: task title
- `[DESCRIPTION]`: detailed requirements
- `[PRIORITY]`: critical | high | medium | low
- Issue number if present (`/issues/N` in URL or `#N` in text)

Parse owner and repo name from the GitHub URL:
```bash
# https://github.com/<owner>/<repo> → OWNER=<owner> REPO=<repo>
OWNER=$(echo "$REPO_URL" | sed 's|https://github.com/||' | cut -d'/' -f1)
REPO=$(echo "$REPO_URL" | sed 's|https://github.com/||' | cut -d'/' -f2 | cut -d'/' -f1)
```

If an issue number is present, fetch the real issue from GitHub:
```bash
gh issue view <N> --repo <owner>/<repo> --json title,body,labels,author
```

---

## Step 2 — Detect Branch Type

Map issue labels to branch prefix:

| Labels | Branch Type |
|--------|------------|
| bug, fix, bugfix, defect, error, regression, hotfix | `fix` |
| documentation, docs, doc, readme | `docs` |
| test, testing, tests, test-coverage | `test` |
| refactor, refactoring, cleanup, tech-debt | `refactor` |
| dependencies, deps, dependency, upgrade | `deps` |
| ci, pipeline, ci-fix, ci/cd | `ci` |
| performance, perf, optimization, speed | `perf` |
| chore, maintenance, config | `chore` |
| (default) | `feat` |

Branch name format: `<type>/N-short-title` (lowercase, hyphens, max 50 chars total)

---

## Step 3 — Repo Cache Check

Before cloning, check if this repo is already cached locally:

```bash
CACHE_DIR="$HOME/.openclaw/cache/repos/$OWNER/$REPO"

if [ -d "$CACHE_DIR/.git" ]; then
  echo "Using cached repo at $CACHE_DIR"
  WORK_DIR="$CACHE_DIR"
  cd "$WORK_DIR"
  git fetch origin 2>&1
  # Detect default branch
  DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD branch' | awk '{print $NF}')
  git checkout "$DEFAULT_BRANCH" 2>&1
  git pull origin "$DEFAULT_BRANCH" 2>&1
else
  echo "No cache found — fresh clone"
  mkdir -p "$CACHE_DIR"
  git clone "https://x-access-token:$GITHUB_TOKEN@github.com/$OWNER/$REPO.git" "$CACHE_DIR" 2>&1
  WORK_DIR="$CACHE_DIR"
  cd "$WORK_DIR"
  DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD branch' | awk '{print $NF}')
fi

# Create the feature branch from the latest default branch
git checkout -b <branch-name> 2>&1
```

**Cache rules:**
- Cache lives in `~/.openclaw/cache/repos/<owner>/<repo>/` (persistent across tasks)
- Always `git pull` before starting — never work on stale code
- If `git pull` fails (force-pushed, diverged), delete cache dir and re-clone fresh

---

## Step 4 — Install and Baseline Verify

Before writing a single line of code, verify the project was healthy when Koda arrived:

```bash
cd "$WORK_DIR"

# Detect and install dependencies — NEVER ask for help, always find a way
if [ -f "pnpm-lock.yaml" ]; then
  pnpm install --frozen-lockfile 2>/dev/null || \
  npx pnpm install --frozen-lockfile 2>/dev/null || \
  npm install -g pnpm 2>/dev/null && pnpm install --frozen-lockfile 2>/dev/null || \
  { echo "WARNING: pnpm unavailable, falling back to npm"; rm -f pnpm-lock.yaml; npm install 2>&1; }
elif [ -f "yarn.lock" ]; then
  yarn install --frozen-lockfile 2>/dev/null || \
  npx yarn install --frozen-lockfile 2>/dev/null || \
  npm install -g yarn 2>/dev/null && yarn install --frozen-lockfile 2>/dev/null || \
  { echo "WARNING: yarn unavailable, falling back to npm"; rm -f yarn.lock; npm install 2>&1; }
elif [ -f "bun.lockb" ]; then
  bun install --frozen-lockfile 2>/dev/null || \
  { echo "WARNING: bun unavailable, falling back to npm"; rm -f bun.lockb; npm install 2>&1; }
else
  npm ci 2>/dev/null || npm install 2>&1
fi
INSTALL_EXIT=$?

if [ $INSTALL_EXIT -ne 0 ]; then
  echo "BASELINE: dependency install failed — repo may have broken dependencies"
  # Continue — it was already broken
fi

# Establish baseline health — try in order, use first that succeeds
BASELINE_CMD=""
BASELINE_OK=false

if grep -q '"typecheck"' package.json 2>/dev/null; then
  npm run typecheck 2>&1 && BASELINE_OK=true && BASELINE_CMD="npm run typecheck"
fi

if [ "$BASELINE_OK" = false ] && grep -q '"build"' package.json 2>/dev/null; then
  npm run build 2>&1 && BASELINE_OK=true && BASELINE_CMD="npm run build"
fi

if [ "$BASELINE_OK" = false ]; then
  npx tsc --noEmit 2>&1 && BASELINE_OK=true && BASELINE_CMD="tsc --noEmit"
fi

if [ "$BASELINE_OK" = true ]; then
  echo "BASELINE: PASS ($BASELINE_CMD) — repo was healthy before changes"
else
  echo "BASELINE: FAIL — repo had pre-existing issues before Koda's changes"
  # Log to .learnings/ERRORS.md with Area: config and continue
fi
```

Record `BASELINE_OK` and `BASELINE_CMD` — they are used in the validation loop and the MR body.

If baseline **fails**, append to `$KODA_WORKSPACE/.learnings/ERRORS.md`:
```markdown
## [ERR-YYYYMMDD-XXX] baseline-verify

**Logged**: <ISO timestamp>
**Priority**: medium
**Status**: pending
**Area**: config

### Summary
Repo <owner>/<repo> had pre-existing build/type failures before implementation started

### Error
<actual error output, first 500 chars>

### Context
- Repo: github.com/<owner>/<repo>
- Baseline command attempted: <BASELINE_CMD or "all failed">

### Suggested Fix
Review repo's build setup — dependencies or config may be broken on default branch

### Metadata
- Reproducible: yes
- Related Files: package.json, tsconfig.json
```

---

## Step 5 — Onboard (Deep Codebase Analysis)

This step is **mandatory and non-skippable**. Do not write a single line of implementation code until every item below is answered. The goal is to match the existing codebase so perfectly that reviewers cannot tell Koda wrote the change.

### 5a — Environment Detection

| Property | Detection method |
|----------|-----------------|
| Language | `package.json` → TypeScript/JS; `go.mod` → Go; `pyproject.toml` → Python |
| Framework | `next.config.*` → Next.js; `vite.config.*` → Vite; `nuxt.config.*` → Nuxt |
| Build system | `package.json` scripts: `build`, `dev` |
| Test framework | devDependencies: jest, vitest, mocha, pytest |
| Linter | `eslint.config.*`, `.eslintrc*`, `biome.json` |
| Formatter | `.prettierrc*`, `biome.json` |
| Pre-push hooks | `.husky/`, `lint-staged` in package.json, `pre-push` script |

### 5b — Directory Structure Map

Run the following and study the output:
```bash
find "$WORK_DIR/src" -type f -name "*.ts" -o -name "*.tsx" | head -60 2>/dev/null
find "$WORK_DIR/app" -type f -name "*.ts" -o -name "*.tsx" | head -60 2>/dev/null
```

Understand the directory conventions:
- Where do page-level components live? (`app/`, `pages/`, `src/app/`)
- Where do shared components live? (`components/`, `src/components/ui/`, `src/components/shared/`)
- Where do custom hooks live? (`hooks/`, `src/hooks/`)
- Where do utilities live? (`lib/`, `utils/`, `src/lib/`)
- Where do types live? (`types/`, `src/types/`, co-located with components?)
- Are there feature-based folders? (`features/cars/`, `modules/auth/`)

### 5c — File Naming Conventions

Read 5+ component files and record:
- Are components PascalCase files? (`CarCard.tsx`, `UserProfile.tsx`)
- Are hooks camelCase with `use` prefix? (`useCarFilters.ts`)
- Are utilities camelCase? (`formatPrice.ts`, `cn.ts`)
- Are pages/routes lowercase with hyphens? (`car-details/page.tsx`)
- Do index files exist? (`components/index.ts` re-exporting everything?)

### 5d — Code Style Deep-Scan

Read **at least 3 existing component files** most similar to what you will implement, and record each of the following. Do NOT proceed without this data — it determines every line you write.

**Import order and style:**
```bash
# Read a real component for import patterns
head -30 <similar-component-file>.tsx
```
- Do imports use `@/` alias or relative paths?
- What is the import grouping order? (framework → third-party → local types → local components → local utils)
- Are type imports separated with `import type`?
- Are named imports used over namespace imports?

**TypeScript style:**
- `interface` vs `type` for component props? (check 3 components)
- Are props typed inline or as a named type/interface above the component?
- Is `React.FC<Props>` used or are props typed directly on the function parameter?
- Are enums used or union string types? (`"asc" | "desc"` vs `enum Sort`)
- Is `as const` used for literal objects?

**Component structure pattern:**
Read a full component file and note the exact structure order:
1. Imports
2. Types/interfaces
3. Constants (if any)
4. Helper functions (if any)
5. Component function (expression or declaration?)
6. Export (named or default?)

Example pattern to detect:
```typescript
// Pattern A: default export at bottom
const MyComponent = ({ prop }: Props) => { ... }
export default MyComponent

// Pattern B: named export inline
export const MyComponent = ({ prop }: Props) => { ... }
```

**State and hooks pattern:**
- `useState` or `useReducer` for local state?
- `TanStack Query` for server state or custom fetch hooks?
- `React Hook Form + Zod` for forms or custom validation?
- `zustand`, `jotai`, `redux` for global state?

**Styling pattern:**
- Pure Tailwind utility classes, or `cn()` helper?
- `cva()` variants for multi-variant components?
- Inline style objects used anywhere?
- CSS modules used anywhere?
- Is there a `clsx` + `tailwind-merge` utility?

**Error handling pattern:**
- `try/catch` with toast notifications?
- Error boundaries?
- `Result<T, E>` pattern?
- Direct `throw` statements?

**Conditional rendering pattern:**
- Early returns with `if (!data) return null`?
- Ternary `condition ? <A /> : <B />`?
- `&&` short-circuit `condition && <A />`?

### 5e — Scope Detection (for commit message)

Derive the commit scope from the directories that will be touched:
- Most changed files in `src/components` → scope = `components`
- Most changed files in `src/app/<feature>` → scope = `<feature>`
- Most changed files in `src/hooks` → scope = `hooks`
- Mixed or root-level → omit scope from commit

### 5f — Onboard Summary (required before Step 7)

Before moving to Step 6, produce a compact internal summary:

```
ONBOARD SUMMARY
- Language: TypeScript strict / JS
- Framework: Next.js 14 App Router / Vite / etc.
- Component export: named inline / default at bottom
- Props typing: interface / type
- Import alias: @/ / relative
- Import type: uses "import type" / does not
- Styling: Tailwind + cn() / Tailwind only / CSS modules
- CVA: yes / no
- State: useState / TanStack Query / zustand / other
- Forms: RHF + Zod / custom / other
- Error handling: toast + try/catch / error boundaries / other
- Conditional: early return / ternary / && short-circuit
- Test framework: jest / vitest / none
```

**This summary drives every decision in Step 8. Any code that contradicts this summary is a bug.**

---

## Step 6 — Consult Learnings

Before planning, read the Koda workspace learnings for relevant prior knowledge about this repo or similar frontend patterns:

```bash
KODA_WORKSPACE="$HOME/.openclaw/workspaces/fe"
# Fall back to relative path if env not set
[ -z "$KODA_WORKSPACE" ] && KODA_WORKSPACE="$(dirname "$0")/../.."

cat "$KODA_WORKSPACE/.learnings/LEARNINGS.md" 2>/dev/null | head -c 3000
cat "$KODA_WORKSPACE/.learnings/ERRORS.md" 2>/dev/null | head -c 2000
```

Filter entries by:
- `Tags:` containing the repo name (`$REPO`)
- `Area: frontend`
- Category `best_practice` or `correction`
- Recurring `ERR-*` entries (same error seen before)

Use relevant learnings to:
- Avoid patterns known to cause issues in this repo
- Apply confirmed best practices from prior successful tasks
- Pre-emptively handle known error patterns

---

## Step 7 — Plan

Using your codebase knowledge, break the task into concrete implementation steps:

```
Plan format:
1. Step description | action: create|modify|delete | target file: path or "TBD"
```

- Skip steps where action is `test` or `review` — the pipeline handles those
- Cap at 10 steps maximum
- Each step should be independently executable

---

## Step 8 — Generate Code

Before writing any file, re-read the Onboard Summary from Step 5f. Every decision below must be consistent with it.

For each implementation step:

1. **Read context first** — read the target file (if it exists) plus 3–5 sibling files that are most structurally similar to what you are creating. For a new component, read existing components in the same directory. For a new hook, read existing hooks.

2. **Match structure exactly** — the generated file must follow the exact same structure order as sibling files (imports → types → constants → helpers → component → export). Do not invent a different order.

3. **Mirror naming to the character:**
   - File name: same casing convention as sibling files
   - Component name: PascalCase matching the file name
   - Hook name: camelCase with `use` prefix matching sibling hooks
   - Props interface name: `<ComponentName>Props` (or whatever sibling files use)
   - Handler names: `handle` prefix (e.g., `handleClick`, `handleSubmit`)

4. **Mirror import style exactly:**
   - Use `@/` alias if siblings use it, relative paths if they don't
   - Use `import type` for type-only imports if siblings do
   - Group imports in the exact same order as siblings
   - Match spacing between import groups

5. **Mirror TypeScript style:**
   - `interface` vs `type` — match what siblings use for props
   - Inline prop typing vs named type — match siblings
   - `React.FC<Props>` vs `({ prop }: Props)` — match siblings
   - Union strings vs enums — match what already exists

6. **Mirror styling:**
   - Use `cn()` if siblings do; do not use it if they don't
   - Use `cva()` for variants if the codebase already uses it
   - Apply Tailwind classes in the same ordering as sibling components (layout → spacing → colors → typography → states)

7. **Mirror state and data-fetching:**
   - Do not introduce TanStack Query if the codebase doesn't use it
   - Do not introduce Zustand if the codebase uses `useState` for state
   - Match the exact hooks the codebase already uses

8. **Mirror error handling:**
   - Use `toast()` if that is the project's pattern
   - Use the same error boundary approach as siblings
   - Do not invent a new error pattern

9. **Follow these universal constraints regardless of project:**
   - No `any` or implicit any — TypeScript strict compliance
   - No magic values — extract to named constants
   - No duplicate code — extract shared logic to the same utilities the project already has
   - Handle loading, error, and empty states explicitly
   - All event handlers named with `handle` prefix
   - Functions with 2+ arguments accept a single options object

10. **Write the file to disk**

After writing, re-read the file once and verify:
- Does it look like it was written by the same developer as the sibling files?
- Would a reviewer be able to tell it came from Koda vs a human who knows the codebase?
- If the answer is "yes, it looks different" — rewrite it to match.

Context limits: repo tree capped at 2000 chars; tool failure output capped at 2000 chars per step.

---

## Step 9 — Self-Review Loop (max 3 iterations)

For each iteration:
1. Read all changed files
2. Review for: logic errors, edge cases, security issues, missing imports, type errors, naming inconsistency
3. Classify each issue as: `info` | `warning` | `error` | `critical`
4. Fix all `error` and `critical` issues immediately
5. Stop early if no `error`/`critical` issues remain

After 3 iterations, proceed regardless. The goal is clean code — not perfection.

---

## Step 10 — Validation Pass 1

Run the complete validation suite:

```bash
cd "$WORK_DIR"
echo "--- PASS 1: TypeScript ---"
tsc --noEmit 2>&1
TSC_EXIT=$?

echo "--- PASS 1: ESLint ---"
eslint . 2>&1
ESLINT_EXIT=$?

echo "--- PASS 1: Tests ---"
npm test -- --passWithNoTests 2>&1
TEST_EXIT=$?
```

If any check fails:
1. Read the error output (cap at 2000 chars)
2. Fix only the files mentioned in the errors
3. Move to Pass 2 (always run Pass 2 regardless)

Record `PASS1_RESULT` = `PASS` or `FAIL`.

---

## Step 11 — Validation Pass 2 (independent full re-run)

Run the full suite again from scratch — this is a **completely independent second verification**, not just checking the fixes from Pass 1:

```bash
cd "$WORK_DIR"
echo "--- PASS 2: TypeScript ---"
tsc --noEmit 2>&1
TSC2_EXIT=$?

echo "--- PASS 2: ESLint ---"
eslint . 2>&1
ESLINT2_EXIT=$?

echo "--- PASS 2: Tests ---"
npm test -- --passWithNoTests 2>&1
TEST2_EXIT=$?
```

If Pass 2 still fails:
1. Fix remaining issues (one more repair attempt)
2. Accept result — push best-effort code and document remaining failures in MR body

Record `PASS2_RESULT` = `PASS` or `FAIL`.

---

## Step 12 — Pre-Push Checks

Detect and run all pre-push gates the project has configured:

```bash
cd "$WORK_DIR"

PRE_PUSH_RESULTS=""

# 1. Husky pre-push hook
if [ -f ".husky/pre-push" ]; then
  echo "Running Husky pre-push hook..."
  bash ".husky/pre-push" 2>&1
  HUSKY_EXIT=$?
  [ $HUSKY_EXIT -eq 0 ] && PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- ✅ Husky pre-push" \
                         || PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- ❌ Husky pre-push (exit $HUSKY_EXIT)"
else
  PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- N/A Husky (not configured)"
fi

# 2. lint-staged
if grep -q '"lint-staged"' package.json 2>/dev/null; then
  echo "Running lint-staged..."
  git stash --keep-index 2>/dev/null   # stage only committed files
  npx lint-staged 2>&1
  LINTSTAGED_EXIT=$?
  git stash pop 2>/dev/null
  [ $LINTSTAGED_EXIT -eq 0 ] && PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- ✅ lint-staged" \
                              || PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- ❌ lint-staged (exit $LINTSTAGED_EXIT)"
else
  PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- N/A lint-staged (not configured)"
fi

# 3. Custom pre-push script in package.json scripts
if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['pre-push'] ? 0 : 1)" 2>/dev/null; then
  echo "Running npm run pre-push..."
  npm run pre-push 2>&1
  CUSTOM_EXIT=$?
  [ $CUSTOM_EXIT -eq 0 ] && PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- ✅ pre-push script" \
                          || PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- ❌ pre-push script (exit $CUSTOM_EXIT)"
else
  PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- N/A custom pre-push script (not configured)"
fi

# 4. Additional scripts: preflight, check, verify
for SCRIPT_NAME in preflight check verify; do
  if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['$SCRIPT_NAME'] ? 0 : 1)" 2>/dev/null; then
    echo "Running npm run $SCRIPT_NAME..."
    npm run "$SCRIPT_NAME" 2>&1
    SC_EXIT=$?
    [ $SC_EXIT -eq 0 ] && PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- ✅ $SCRIPT_NAME" \
                       || PRE_PUSH_RESULTS="$PRE_PUSH_RESULTS\n- ❌ $SCRIPT_NAME (exit $SC_EXIT)"
  fi
done
```

If any pre-push check fails:
1. Fix the issue (one repair attempt)
2. Re-run that specific check
3. If still failing, document in MR body and push anyway

---

## Step 13 — Rebase

```bash
git fetch origin
git rebase "origin/$DEFAULT_BRANCH" 2>&1
```

If rebase conflicts:
```bash
git rebase --abort
git merge "origin/$DEFAULT_BRANCH" 2>&1
```

If merge conflicts remain, push as-is and note conflicts in MR body.

---

## Step 14 — Commit

Detect commit scope from changed files:
```bash
# Get changed file paths
CHANGED=$(git diff --cached --name-only 2>/dev/null || git diff HEAD --name-only)

# Derive scope from most common directory
SCOPE=$(echo "$CHANGED" | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}' | sed 's|src/||' | cut -d'/' -f1)
# If scope is empty or ".", omit it from the commit title
```

Commit message format:
```
<type>(<scope>): <imperative verb, present tense, max 72 chars total>

<what changed and why — 2-3 sentences>

closes #<issue-number>
```

Examples:
- `feat(cars): add filter by fuel type to car listing page`
- `fix(checkout): prevent double-submit on payment form`
- `refactor(hooks): extract useCarFilters from CarListPage`

```bash
git add -A
git commit -m "<type>(<scope>): <description>

<body>

closes #<N>"
```

---

## Step 15 — Push and Create MR

```bash
git push origin <branch-name> 2>&1
```

Then create the MR and **capture the URL**:

```bash
PR_URL=$(gh pr create \
  --title "<type>(<scope>): <description>" \
  --body "<MR body>" \
  --repo "$OWNER/$REPO")

echo "PR created: $PR_URL"
```

**`$PR_URL` is the actual GitHub pull request URL returned by `gh pr create` (e.g. `https://github.com/owner/repo/pull/42`). It must be stored in this variable and used verbatim everywhere — never replaced with a placeholder, template text, or descriptive label.**

If `gh pr create` fails, check the output for the reason. If the PR already exists (branch was pushed before), retrieve its URL:
```bash
PR_URL=$(gh pr view --repo "$OWNER/$REPO" "$BRANCH_NAME" --json url --jq .url)
```

**MR Body Template:**

```markdown
## Automated Implementation
Closes #<N>

### Summary
<2-3 sentences — what was done and the approach>

### Changes
- `path/to/file.ts`: what changed and why

### Steps Taken
1. <implementation step>

### How to Test
1. Pull this branch: `git checkout <branch-name>`
2. Install dependencies: `npm install`
3. Start the project: `npm run dev`
4. <specific verification steps derived from [DESCRIPTION]>

### Screenshots
<!-- Add before/after screenshots if UI changes were made -->

### Quality Checks
- <PASS/FAIL> TypeScript (tsc --noEmit) — Pass 1
- <PASS/FAIL> TypeScript (tsc --noEmit) — Pass 2
- <PASS/FAIL> ESLint — Pass 1
- <PASS/FAIL> ESLint — Pass 2
- <PASS/FAIL> Tests (npm test) — Pass 1
- <PASS/FAIL> Tests (npm test) — Pass 2
- <PASS/FAIL> Self-review (LLM, up to 3 iterations)
- <PASS/FAIL> Rebased onto latest `<default-branch>`

### Pre-Push Checks
<PRE_PUSH_RESULTS — one line per check>

### Baseline
- Pre-change baseline: <PASS/FAIL> (<BASELINE_CMD>)

### Risks
<known concerns, edge cases, follow-up suggestions — or "None identified">
```

---

## Step 16 — Log to Learnings

After the MR is created, always append an entry to the Koda workspace `.learnings/`:

**On full success (both validation passes green, MR created):**

Append to `$KODA_WORKSPACE/.learnings/LEARNINGS.md`:
```markdown
## [LRN-YYYYMMDD-XXX] best_practice

**Logged**: <ISO timestamp>
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
Successfully implemented <task title> in <owner>/<repo>

### Details
<what approach worked, key patterns used, anything noteworthy about the repo>

### Suggested Action
Reuse this pattern for similar tasks in this repo

### Metadata
- Source: conversation
- Related Files: <primary files changed>
- Tags: <repo-name>, frontend, <framework if detected>
```

**On any error/fix cycle during the task:**

Append to `$KODA_WORKSPACE/.learnings/ERRORS.md`:
```markdown
## [ERR-YYYYMMDD-XXX] <skill-or-command>

**Logged**: <ISO timestamp>
**Priority**: <high if recurring, medium otherwise>
**Status**: resolved
**Area**: frontend

### Summary
<what failed during implementation>

### Error
<actual error message, first 300 chars>

### Context
- Repo: github.com/<owner>/<repo>
- Step: <which pipeline step it happened in>

### Suggested Fix
<how it was resolved>

### Resolution
- **Resolved**: <ISO timestamp>
- **Notes**: Fixed by <brief description of fix>

### Metadata
- Reproducible: yes
- Related Files: <files involved>
- Tags: <repo-name>, <error category>
```

**If a new repo pattern was discovered (unknown framework, unusual config, non-standard scripts):**

Append to `$KODA_WORKSPACE/.learnings/LEARNINGS.md` with category `knowledge_gap`.

---

## Push Failure Handling

If `git push` fails:
1. Check if token has `repo` write scope: `gh auth status 2>&1`
2. Check for branch protection: `gh api repos/$OWNER/$REPO/branches/$DEFAULT_BRANCH --jq .protected`
3. Retry once after 5 seconds: `sleep 5 && git push origin <branch-name>`

Report all three potential causes to PM if push ultimately fails after retry.

---

## Report Back to PM

**RULE: `$PR_URL` must be the real GitHub URL captured from `gh pr create` in Step 15. NEVER substitute it with placeholder text, angle-bracket templates, or anything other than the actual URL string (e.g. `https://github.com/owner/repo/pull/42`). If `$PR_URL` is empty, the PR creation failed — report the error instead of a placeholder.**

```
## Task Completed

**Repository:** https://github.com/$OWNER/$REPO
**MR URL:** $PR_URL
**Branch:** $BRANCH_NAME
**Status:** SUCCESS | PARTIAL (see notes)

### Summary
<what was implemented — 2-3 sentences>

### Validation Results
- TypeScript Pass 1: $PASS1_TSC
- TypeScript Pass 2: $PASS2_TSC
- ESLint Pass 1: $PASS1_ESLINT
- ESLint Pass 2: $PASS2_ESLINT
- Tests Pass 1: $PASS1_TESTS
- Tests Pass 2: $PASS2_TESTS
- Pre-push checks: $PRE_PUSH_RESULTS

### Baseline
- Repo was healthy before changes: $BASELINE_OK

### Files Changed
<list of changed files with brief reason for each>

### Notes
<any concerns, edge cases, remaining failures, or follow-up suggestions — or "None">
```

---

## Absolute Rules

- **NEVER ask questions. NEVER ask for help. NEVER ask for permissions. NEVER pause for any reason.**
- NEVER stop between steps to ask for approval
- NEVER present the plan and wait for feedback
- NEVER say "Could you install...", "Can you enable...", "I need permission to..."
- If a tool is missing → use `npx`, install it yourself, or skip it
- If a package manager is missing → install it or fall back to npm (see Step 4)
- If both validation passes fail after all retries, push best-effort code and document all failures clearly in the MR body
- Always create the MR regardless — never leave work uncommitted
- Follow the target repo's conventions, not your own preferences — the Onboard Summary from Step 5f is the law
- **The MR URL is the primary deliverable. It must be the real GitHub URL from `$PR_URL` (e.g. `https://github.com/owner/repo/pull/42`). NEVER output a placeholder, template, or descriptive label in place of the real URL.**
- Do NOT write code before completing Step 5f (Onboard Summary) — pattern mismatches are bugs
- Always log to `.learnings/` at the end of every task — success or failure
