---
name: pr-iteration
slug: pr-iteration
version: "1.0.0"
description: "Address review feedback on an existing PR. Fetches all CHANGES_REQUESTED and COMMENTED reviews plus inline comments, generates targeted fixes, and pushes to the SAME branch (not a new branch). Use when [SKILL]: pr-iteration, event pull_request_review.submitted with changes_requested on an feat/* or fix/* branch, or keyword @ai-agent fix this."
metadata: {"openclaw":{"emoji":"🔁","requires":{"bins":["git","gh"]},"os":["linux","darwin","win32"]}}
---

## Triggers

- Event: `pull_request_review.submitted` where:
  - PR branch starts with `ai-agent/`
  - Review state is `CHANGES_REQUESTED`
- Keyword: `@ai-agent fix this`, `@ai-agent address feedback`, `@ai-agent update pr`
- `[SKILL]: pr-iteration` in task message with `[PR]` field

---

## Pipeline

```
FETCH PR → FETCH REVIEWS + INLINE COMMENTS → READ CURRENT FILES → GENERATE FIXES → PUSH TO SAME BRANCH → POST RESPONSE COMMENT
```

---

## Step 1 — Fetch PR Details

```bash
gh pr view <N> --repo <owner/repo> \
  --json title,body,headRefName,baseRefName,files
```

Extract `branch = headRefName`.

---

## Step 2 — Fetch Review Feedback

```bash
# Get all reviews
gh pr view <N> --repo <owner/repo> --json reviews

# Get inline review comments
gh api repos/<owner>/<repo>/pulls/<N>/comments
```

Filter to reviews with state `CHANGES_REQUESTED` or `COMMENTED`. Extract:
- General review body text
- Inline comments: file path, line number, comment body

**If no feedback found:**
```bash
gh pr comment <N> --repo <owner/repo> \
  --body "I couldn't find specific feedback to address. Please leave review comments and I'll address them."
```
Return `SUCCESS` (nothing to do).

---

## Step 3 — Read Current File Contents

```bash
WORK_DIR=$(mktemp -d)
git clone https://x-access-token:$GITHUB_TOKEN@github.com/<owner>/<repo>.git "$WORK_DIR"
cd "$WORK_DIR"
git checkout <branch>
```

For each file mentioned in the review comments, read its current content. Skip files with status `removed`.

---

## Step 4 — Generate Targeted Fixes

Using the review feedback and current file contents, determine what changes to make.

**Critical rules:**
- Read review comments carefully and make EXACTLY the requested changes
- Preserve existing code style — do not reformat unrelated code
- Only change what is explicitly requested in the reviews
- If a reviewer asks for refactoring, do the refactoring exactly as described
- Do NOT introduce new features or unrelated changes

Produce:
```json
{
  "changes": [
    {
      "filename": "path/to/file.ts",
      "explanation": "what was changed and why (based on reviewer's feedback)",
      "code": "complete new file content"
    }
  ],
  "commitMessage": "fix: address review feedback on PR #<N>",
  "responseComment": "markdown explanation of what was changed, referencing each piece of feedback"
}
```

**If no concrete changes can be determined:**
Make your best interpretation of the feedback and apply changes that align with the reviewer's intent. Document your interpretation in the commit message. If truly nothing actionable exists:
```bash
gh pr comment <N> --repo <owner/repo> \
  --body "Reviewed all feedback. No actionable code changes identified — the current implementation appears to match the requested changes. Please re-review or leave more specific inline comments."
```
Return `SUCCESS`.

---

## Step 5 — Apply and Push to SAME Branch

Apply all changes to disk.

```bash
git add -A
git commit -m "<commitMessage>"
git push origin <branch>
```

**Important:** Push to `<branch>` — the existing PR branch. Do NOT create a new branch.

---

## Step 6 — Post Response Comment

```bash
gh pr comment <N> --repo <owner/repo> --body "<response comment>"
```

**Response Comment Template:**

```markdown
## 🤖 Changes Applied

<responseComment>

### Files Updated
- `path/to/file.ts`: description of what changed

---
Please re-review when ready!
```

---

## Report Back to PM

```
## PR Iteration Completed

**Repository:** <repo URL>
**PR:** <PR URL>
**Branch:** <branch>
**Status:** SUCCESS

### Summary
Addressed review feedback on PR #<N>. N files updated.

### Files Changed
<list>
```
