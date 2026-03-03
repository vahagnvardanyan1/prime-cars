---
name: refactor
slug: refactor
version: "1.0.0"
description: "Improve code quality without changing behavior. Measures complexity before and after (lines, functions, max nesting), applies SOLID principles, then validates with the full test suite. ABORT and do NOT push if tests fail after 2 fix attempts. Use when [SKILL]: refactor, label refactor or tech-debt, or keyword @ai-agent refactor."
metadata: {"openclaw":{"emoji":"♻️","requires":{"bins":["git","gh","tsc","eslint","npm"]},"os":["linux","darwin","win32"]}}
---

## Triggers

- Label: `refactor`, `tech-debt`
- Keyword: `@ai-agent refactor`, `@ai-agent clean up`
- `[SKILL]: refactor` in task message

---

## Pipeline

```
PARSE TARGET FILES → CLONE → MEASURE BEFORE → GENERATE REFACTORING → VALIDATE (×2) → MEASURE AFTER → PUSH → PR
```

---

## Step 1 — Parse Target Files

Extract target file paths from the task description:
- Look for `` `filename.ts` `` patterns in `[DESCRIPTION]`
- Look for explicit file paths like `src/components/Foo.tsx`

If no files are specified, analyze the most complex file in the changed area or recently modified files.

---

## Step 2 — Clone & Branch

```bash
WORK_DIR=$(mktemp -d)
git clone https://x-access-token:$GITHUB_TOKEN@github.com/<owner>/<repo>.git "$WORK_DIR"
cd "$WORK_DIR"
git checkout -b refactor/N-<short-title>
```

---

## Step 3 — Measure BEFORE Complexity

For each target file, measure:

```bash
# Lines of code
wc -l <file>

# Function count (rough heuristic — adapt per language)
grep -c "function\|=>\|async " <file>

# Max nesting depth: count max consecutive { braces or indentation levels
```

Record: `{ file, linesBefore, functionsBefore, maxNestingBefore }`

---

## Step 4 — Generate Refactoring

Read all target files. Apply these refactoring principles:

**Objectives:**
1. Reduce cyclomatic complexity — break apart long functions, flatten deep nesting
2. Extract reusable functions/classes — DRY principle
3. Improve naming clarity — intention-revealing names, no abbreviations
4. Remove dead code — unused variables, unreachable branches, obsolete comments
5. Follow SOLID principles — single responsibility, open/closed, dependency inversion
6. Add/improve type annotations — remove `any`, add explicit return types
7. Fix existing linting issues — clean up all ESLint warnings in touched files

**Critical constraints:**
- Preserve existing behavior EXACTLY — no feature changes
- Every existing test must still pass
- Do NOT change public API signatures (exported function names/types)
- Do NOT change file structure unless explicitly requested

Generate the refactored files and write them to disk.

---

## Step 5 — Validation Loop (max 2 iterations)

```bash
cd "$WORK_DIR"
tsc --noEmit 2>&1
eslint . 2>&1
npm test -- --passWithNoTests 2>&1
```

**If tests fail:**
1. Fix the code while keeping the refactoring improvements
2. Re-run validation
3. After 2 iterations, if tests still fail: **ABORT — do NOT push**

```
## Refactoring Aborted

The refactoring caused test failures that could not be resolved after 2 fix attempts.
The branch was NOT pushed. Please review the failing tests manually.

**Failing tests:** <list>
**Root cause:** <diagnosis>
```

---

## Step 6 — Measure AFTER Complexity

For each target file, re-measure the same metrics as Step 3.

---

## Step 7 — Commit, Push, Create PR

```bash
git add -A
git commit -m "refactor: <description of improvements>

- Reduces complexity in <file>
- Extracts <N> reusable functions
- Removes dead code
- Improves type annotations"

git push origin <branch>

gh pr create \
  --title "refactor: <description>" \
  --body "<PR body>" \
  --repo <owner/repo>
```

**PR Body Template:**

```markdown
## ♻️ Code Refactoring
Related to #<N>

### Summary
<what was improved and why>

### Improvements
- <improvement 1>
- <improvement 2>

### Complexity Report

| File | Lines | Functions | Max Nesting |
|------|-------|-----------|-------------|
| `path/to/file.ts` | 250 → 180 | 12 → 8 | 5 → 3 |

### Files Changed
- `path/to/file.ts`: description

### Validation
- ✅ All tests pass
- ✅ TypeScript type-checking passes
- ✅ Linter passes
- ✅ Behavior preserved — no feature changes
```

---

## Report Back to PM

```
## Task Completed

**Repository:** <repo URL>
**PR URL:** <PR link>
**Branch:** <branch>
**Status:** SUCCESS / ABORTED

### Summary
Refactored <N> files. Complexity reduced by <X>%.

### Validation Results
- TypeScript: PASS
- ESLint: PASS
- Tests: PASS
```
