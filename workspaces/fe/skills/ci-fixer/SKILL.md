---
name: ci-fixer
slug: ci-fixer
version: "1.0.0"
description: "Diagnose and fix CI/build failures. Fetches failed check logs, runs LLM diagnosis, and auto-applies fixes ONLY on ai-agent/* branches. For non-agent branches, posts a diagnosis comment with suggested fixes instead. Use when [SKILL]: ci-fixer, ci_status failure, or keyword @ai-agent fix ci."
metadata: {"openclaw":{"emoji":"🔧","requires":{"bins":["git","gh"]},"os":["linux","darwin","win32"]}}
---

## Triggers

- CI status: `failure`
- Keyword: `@ai-agent fix ci`, `@ai-agent fix build`
- `[SKILL]: ci-fixer` in task message

---

## Pipeline

```
EXTRACT BRANCH → FETCH FAILED CHECKS → CLONE → GET CHANGED FILES → DIAGNOSE → AUTO-FIX OR COMMENT
```

---

## Step 1 — Extract Branch

From the task message, extract:
- `[BRANCH]`: branch name (from `[BRANCH]:` tag, `check_suite.head_branch`, or `pull_request.head.ref`)
- PR number if present

```bash
gh pr list --repo <owner/repo> --head <branch> --json number,headRefName
```

---

## Step 2 — Fetch Failed Check Logs

```bash
# List recent failed runs
gh run list --repo <owner/repo> --branch <branch> --status failure --limit 5 --json databaseId,name,status

# For up to 3 failed runs, fetch logs
gh run view <runId> --repo <owner/repo> --log-failed 2>&1 | tail -c 3000
```

Concatenate logs from each failed check. **Fail immediately** if no logs are found — report "No CI logs available" to PM.

---

## Step 3 — Clone & Get Changed Files

```bash
WORK_DIR=$(mktemp -d)
git clone https://x-access-token:$GITHUB_TOKEN@github.com/<owner>/<repo>.git "$WORK_DIR"
cd "$WORK_DIR"
git checkout <branch>

# Files changed in last 3 commits
git diff --name-status HEAD~3...HEAD
```

---

## Step 4 — Diagnose

Analyze the CI logs and changed files to determine:
- Root cause of failure (type error, lint error, test failure, build error, missing env var, dependency issue)
- Which files need to change
- Specific fixes to apply

Produce a structured diagnosis:
```
Diagnosis: <one-line summary>
Fixes needed:
  1. file: path/to/file.ts | change: description of fix
  2. ...
```

---

## Step 5 — Auto-Fix

Apply all fixes to the working directory, then validate:

```bash
# Validate the fix
tsc --noEmit 2>&1
npm test -- --passWithNoTests 2>&1

# If validation passes, commit and push
git add -A
git commit -m "fix: CI failure — <diagnosis summary (max 72 chars)>"
git push origin <branch>
```

If validation fails after fix — one more repair attempt, then push best-effort.

If push fails (branch protection, permissions), fall back to posting a diagnosis comment on the PR instead:

```bash
gh pr comment <N> --repo <owner/repo> --body "<diagnosis comment>"
```

Report back to PM:
```
## CI Fixed

**Branch:** <branch>
**Status:** SUCCESS / DIAGNOSED (could not push)
**Diagnosis:** <summary>
**Fixes Applied:**
- file: description
```

---

## Rules

- Always validate fixes before pushing
- Always report PM with diagnosis details regardless of whether fixes were applied
- If logs are unavailable, fail immediately with a clear message
