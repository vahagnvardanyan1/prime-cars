---
name: delegation
slug: delegation
version: "5.0.0"
description: "Simple delegation: create dashboard ticket, then send to FE and QA."
metadata: {"openclaw":{"emoji":"\ud83d\udccb","requires":{"bins":[]}}}
---

# Delegation Skill

## The Flow

1. Create ticket on dashboard via `task-manager:create-task`
2. Send to FE via `sessions_spawn(agentId: "fe")`
3. When FE returns with PR, update ticket and send to QA via `sessions_spawn(agentId: "qa")`
4. When QA passes, mark ticket complete via `task-manager:complete-task`

## FE Task Format

```
sessions_spawn(agentId: "fe", task: "
[TASK_KEY]: OC-5
[REPO]: https://github.com/picsart/prime-cars
[TITLE]: Add dark mode toggle to settings page
[DESCRIPTION]:
<clear technical description of what to build>

[ACCEPTANCE_CRITERIA]:
- <testable criterion 1>
- <testable criterion 2>
- <testable criterion 3>
", label: "fe-OC-5")
```

**`[REPO]` is MANDATORY.** Must be a real GitHub URL, never a placeholder.

## FE Skills

| Skill | When |
|-------|------|
| `implement` | New features (default) |
| `debug` | Bug fixes |
| `review` | PR review (add `[PR]: N`) |
| `test-writer` | Write tests |
| `refactor` | Improve code quality |
| `ci-fixer` | Fix CI (add `[BRANCH]: name`) |
| `pr-iteration` | Address PR feedback (add `[PR]: N`) |

Add `[SKILL]: debug` etc. to the task if needed. Default is `implement`.

## QA Task Format

Only send to QA after FE returns SUCCESS with a PR URL.

```
sessions_spawn(agentId: "qa", task: "
Verify PR for task OC-5:

PR: <URL>
Branch: <branch>
Repository: <repo URL>

FE Validation:
- TypeScript: PASS/FAIL
- Lint: PASS/FAIL
- Tests: PASS/FAIL
- Build: PASS/FAIL

Files Changed:
<file list>

Acceptance Criteria to Verify:
<paste from dashboard ticket>
", label: "qa-OC-5")
```

## What to Strip from Task Strings

Never include: user names, business context, timeline pressure, Slack messages, your reasoning.
Only include: technical requirements, GitHub URLs, acceptance criteria, file paths.
