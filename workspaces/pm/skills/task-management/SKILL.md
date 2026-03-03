# Task Management Skill

## Tools Available
- `task-manager:create-task` - Create a JIRA-like ticket with title, description, issue_type, acceptance_criteria, priority, assignee, repo_url. Returns a `task_key` (e.g., OC-1).
- `task-manager:update-task` - Update task status, GitHub fields (pr_url, branch_name, etc.), or any other field
- `task-manager:list-tasks` - List tasks with optional filters (status, assignee, priority)
- `task-manager:complete-task` - Mark a task as completed with a summary

## Task Key System

Every task gets an auto-generated key like `OC-1`, `OC-2`, `OC-3`. Always reference tasks by their key when communicating with the user.

## JIRA-like Ticket Fields

When creating a task, you MUST provide:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | YES | Short imperative summary (max 60 chars) |
| `description` | YES | Technical context — what and why |
| `issue_type` | YES | `story` / `bug` / `task` / `subtask` |
| `acceptance_criteria` | YES | Bullet-pointed testable checklist |
| `priority` | YES | `critical` / `high` / `medium` / `low` |
| `assignee` | YES | `"fe"` for implementation tasks |
| `repo_url` | YES | The GitHub repository URL |

## Task Lifecycle on the Dashboard

```
PENDING ──→ IN_PROGRESS ──→ REVIEW ──→ COMPLETED
   │              │             │
   └──→ BLOCKED ←─┘─────────←──┘
```

1. **pending** — PM creates ticket on dashboard, not yet delegated
2. **in_progress** — FE has picked up the task and is working on it
3. **review** — FE completed, PR created, QA verification in progress
4. **completed** — QA passed, task verified and done
5. **blocked** — Something failed, needs intervention or retry

## Dashboard Update Protocol

### When creating a task:
```
task-manager:create-task({
  title: "...",
  description: "...",
  issue_type: "story",
  acceptance_criteria: "- criterion 1\n- criterion 2",
  priority: "medium",
  assignee: "fe",
  repo_url: "https://github.com/..."
})
```

### When FE completes (SUCCESS):
```
task-manager:update-task({
  task_id: "<uuid>",
  status: "review",
  pr_url: "https://github.com/.../pull/42",
  pr_number: 42,
  branch_name: "feat/...",
  pr_status: "open",
  ci_status: "passing",
  validation_result: "{...}",
  files_changed: "[...]"
})
```

### When FE fails:
```
task-manager:update-task({ task_id: "<uuid>", status: "blocked" })
```

### When QA passes:
```
task-manager:complete-task({ task_id: "<uuid>", summary: "..." })
```

### When QA fails:
```
task-manager:update-task({ task_id: "<uuid>", status: "blocked" })
// Then re-delegate to FE with QA's issues
```

## MANDATORY: QA Testing After Every Task

After the FE agent completes ANY task, you MUST delegate to QA for testing before marking it complete:

1. FE finishes -> update task status to `review` + add GitHub fields
2. Call `sessions_spawn` with `agentId: "qa"` — include PR URL and acceptance criteria
3. QA reports PASS -> mark task `completed`
4. QA reports FAIL -> update to `blocked`, delegate back to FE, then re-test with QA

**Never skip QA. Never mark a task as completed without a QA PASS.**

## Best Practices
- Always reference the task key (OC-5) when talking to the user
- Create the dashboard ticket BEFORE delegating to FE
- Keep the dashboard updated at every stage transition
- Include measurable acceptance criteria in every ticket
- Track task UUIDs for follow-up operations
