---
name: debug
slug: debug
version: "1.0.0"
description: "Diagnose and fix bugs through a 4-phase pipeline: (1) build a diagnosis plan, (2) investigate the codebase with grep and git log, (3) identify root cause and generate fixes, (4) apply fixes, validate, push, and create a PR. If no fix is possible, post a diagnosis comment on the issue. Use when [SKILL]: debug, label bug/error/crash, or keyword @ai-agent debug."
metadata: {"openclaw":{"emoji":"🐛","requires":{"bins":["git","gh","tsc","npm"]},"os":["linux","darwin","win32"]}}
---

## Triggers

- Label: `bug`, `error`, `crash`
- Keyword: `@ai-agent debug`, `@ai-agent fix bug`, `@ai-agent investigate`
- `[SKILL]: debug` in task message

---

## Pipeline

```
FETCH ISSUE → PHASE 1: DIAGNOSE PLAN → PHASE 2: INVESTIGATE → PHASE 3: ROOT CAUSE + FIX → PHASE 4: APPLY + VALIDATE + PR
```

---

## Phase 1 — Build Diagnosis Plan

Read the issue title, description, and any error messages or stack traces provided.

Produce a structured diagnosis plan:

```json
{
  "errorType": "runtime|build|logic|performance|security|unknown",
  "errorMessages": ["extracted error messages from the issue"],
  "stackTraceFiles": ["file.ts:42", "other.ts:15"],
  "relatedFiles": ["src/utils/foo.ts", "src/api/bar.ts"],
  "potentialCauses": [
    {
      "likelihood": "high|medium|low",
      "description": "what might be causing this",
      "file": "suspected file",
      "investigationSteps": ["read function X", "check for Y"]
    }
  ],
  "searchTerms": ["functionName", "ErrorClass", "specific string"],
  "summary": "one-line bug summary"
}
```

---

## Phase 2 — Investigate

Clone the repo:

```bash
WORK_DIR=$(mktemp -d)
git clone https://x-access-token:$GITHUB_TOKEN@github.com/<owner>/<repo>.git "$WORK_DIR"
cd "$WORK_DIR"
```

**Read files** (up to 8 total — stack trace files first, then related files):

```bash
# Read each file, cap content at 3000 chars
head -c 3000 <file>
```

**Search for patterns** (up to 5 search terms):

```bash
grep -rn "<searchTerm>" "$WORK_DIR/src" --include="*.ts" --include="*.js" -l 2>/dev/null
grep -rn "<searchTerm>" "$WORK_DIR/src" --include="*.ts" --include="*.js" 2>/dev/null | head -20
```

**Check recent changes** (up to 3 files from stack trace):

```bash
git log --oneline -10 -- <file> 2>/dev/null
git show HEAD~1 -- <file> 2>/dev/null | head -c 2000
```

---

## Phase 3 — Root Cause + Fix

Using all gathered evidence, determine:

```json
{
  "rootCause": "detailed explanation of why the bug occurs",
  "confidence": "high|medium|low",
  "fixes": [
    {
      "filename": "path/to/file.ts",
      "explanation": "what to change and why",
      "code": "complete new file content"
    }
  ],
  "testSuggestions": ["add a test for X edge case"],
  "preventionTips": ["consider adding validation for Y"]
}
```

**If no fixes can be determined** (confidence `low` with no concrete file changes):
- Do NOT clone or push
- Post a diagnosis comment on the issue:

```bash
gh issue comment <N> --repo <owner/repo> --body "<diagnosis comment>"
```

**Comment template:**
```markdown
## 🔍 Bug Investigation

### Root Cause
<detailed analysis>

**Confidence:** low

### Investigation Notes
<what was found, what was ruled out>

### Prevention Tips
- <tip>

---
*Investigated by Koda. Automated fix was not possible — manual intervention needed.*
```

Return `DIAGNOSED_NO_FIX` to PM and stop.

---

## Phase 4 — Apply, Validate, Push, PR

Create fix branch:

```bash
git checkout -b fix/N-<short-title>
```

Apply all fixes to disk.

**Quick validate:**

```bash
tsc --noEmit 2>&1
npm test -- --passWithNoTests 2>/dev/null 2>&1
```

If validation fails — one repair iteration:
1. Read the error output
2. Fix only the files mentioned in errors
3. Re-run validation once

```bash
git add -A
git commit -m "fix(<scope>): <short description> (fixes #<N>)

Root cause: <rootCause summary>
<how the fix works>"

git push origin fix/N-<short-title>

gh pr create \
  --title "fix: <description>" \
  --body "<PR body>" \
  --repo <owner/repo>
```

**PR Body Template:**

```markdown
## 🐛 Bug Fix
Fixes #<N>

### Root Cause
<detailed explanation>

**Confidence:** high|medium|low

### Changes
- `path/to/file.ts`: what was changed and why

### How to Verify
- <test suggestion 1>
- <test suggestion 2>

### Prevention
- <prevention tip>

### Validation
- ✅ TypeScript: PASS
- ✅ Tests: PASS (or ⚠️ PARTIAL — see notes)
```

---

## Report Back to PM

```
## Task Completed

**Repository:** <repo URL>
**PR URL:** <PR link>  (or "No PR — diagnosis only")
**Branch:** <branch>
**Status:** SUCCESS / DIAGNOSED_NO_FIX

### Root Cause
<summary>

### Confidence
high | medium | low

### Files Changed
<list>
```
