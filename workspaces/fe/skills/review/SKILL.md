---
name: review
slug: review
version: "1.0.0"
description: "Deep code review of a GitHub Pull Request. Runs tool validation (tsc + eslint), analyzes change impact, checks CODEOWNERS, then produces an LLM review with inline comments. Use when [SKILL]: review, event pull_request.opened/synchronize, or label ai-review."
metadata: {"openclaw":{"emoji":"🔍","requires":{"bins":["git","gh","tsc","eslint"]},"os":["linux","darwin","win32"]}}
---

## Triggers

- Event: `pull_request.opened`, `pull_request.synchronize`
- Label: `ai-review`
- `[SKILL]: review` in task message
- PR URL in `[REPO]` field (`/pull/N`)

## Guard: Skip Bot PRs

If the PR author username contains `bot` or `ai-agent`, return:
> "Skipped self-review — PR authored by automated agent."

Do NOT review your own PRs.

---

## Pipeline

```
FETCH PR → CLONE HEAD → TOOL VALIDATE → IMPACT ANALYSIS → CODEOWNERS → LLM REVIEW → POST REVIEW
```

---

## Step 1 — Fetch PR Details

```bash
gh pr view <N> --repo <owner/repo> --json title,body,author,headRefName,files,baseRefName
gh pr diff <N> --repo <owner/repo>
```

Extract:
- `branch` = `headRefName`
- `changedFiles` = list of files from `files`
- `prDescription` = PR body + title
- `prAuthor` = author login

---

## Step 2 — Clone & Tool Validate

```bash
WORK_DIR=$(mktemp -d)
git clone https://x-access-token:$GITHUB_TOKEN@github.com/<owner>/<repo>.git "$WORK_DIR"
cd "$WORK_DIR"
git checkout <branch>

# Quick validation
tsc --noEmit 2>&1
eslint . --format json 2>&1
```

Collect all failures as review comments:
- Location: file path, line 1 (use actual line if available from eslint JSON output)
- Severity: `error`
- Source: `tool-validation`

---

## Step 3 — Impact Analysis

For each changed file, analyze what else might be affected:

```bash
cd "$WORK_DIR"
git diff origin/<baseRefName>...<branch> --name-only
```

1. Read changed files (cap content at 2000 chars each)
2. Identify: exported functions/types changed, files that import them, test files covering them
3. Assess risk level:
   - `critical`: auth, payments, security-sensitive paths, public API contracts broken
   - `high`: core business logic, data model changes, widely-imported utilities
   - `medium`: feature additions, isolated module changes
   - `low`: docs, styles, minor copy changes

If risk is `high` or `critical`, include an impact warning in the review body.
List up to 5 affected test files that should be verified.

---

## Step 4 — CODEOWNERS Lookup

```bash
cat "$WORK_DIR/.github/CODEOWNERS" 2>/dev/null || cat "$WORK_DIR/CODEOWNERS" 2>/dev/null
```

Match changed file paths against CODEOWNERS patterns. If owners are found for changed files, include a "Suggested Reviewers" section in the review body.

---

## Step 5 — LLM Review

Review all changed files (from `gh pr diff`) with these objectives:
1. Logic correctness — does the code do what the PR description says?
2. Edge cases — are null/undefined, empty arrays, network failures handled?
3. Security — any injection, auth bypass, or data exposure issues?
4. Performance — any obvious N+1 queries, missing memoization, blocking operations?
5. Code style — follows project conventions? naming consistent?
6. TypeScript types — are types accurate, no `any` without justification?

For each issue found, produce an inline comment:
```
file: path/to/file.ts
line: 42
severity: info | warning | error | critical
body: explanation and suggested fix
```

Cap inline comments at 20 total. Prioritize `error` and `critical`.

---

## Step 6 — Review Decision

- `APPROVE` if: LLM review has zero `error`/`critical` issues AND tool validation passed
- `REQUEST_CHANGES` otherwise

---

## Step 7 — Post Review

```bash
gh pr review <N> --repo <owner/repo> \
  --<approve|request-changes> \
  --body "<review body>"
```

For inline comments use the GitHub API:
```bash
gh api repos/<owner>/<repo>/pulls/<N>/reviews \
  --method POST \
  --field event="<APPROVE|REQUEST_CHANGES>" \
  --field body="<review body>" \
  --field comments="<inline comments JSON array>"
```

**Review Body Template:**

```markdown
## AI Engineer Review

<overall summary: 2-3 sentences>

### Tool Validation
<N issues found | tsc and lint passed>

### Impact Analysis — Risk: <LOW|MEDIUM|HIGH|CRITICAL>
<summary of what is affected>

Affected tests to verify:
- `path/to/test.spec.ts`

### Suggested Reviewers
- @username — owns `path/to/file.ts`

### Inline Comments
<N comments left — see inline review>
```

---

## Report Back to PM

```
## Review Completed

**PR:** <PR URL>
**Decision:** APPROVE / REQUEST_CHANGES
**Tool Issues:** N
**LLM Comments:** N
**Critical Issues:** N
**Risk Level:** LOW/MEDIUM/HIGH/CRITICAL
```
