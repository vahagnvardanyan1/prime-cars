# System Architecture

## Overview

Hierarchical multi-agent system with JIRA-style task management.

```
User <──> PM (Atlas) <──> FE (Frontend Engineer)
                     <──> QA (Quality Assurance)
```

## Infrastructure

| Component | Port | Purpose |
|-----------|------|---------|
| OpenClaw Gateway | 18789 | Agent lifecycle, communication, memory |
| Bridge Server | 3001 | Fastify HTTP/WS — connects frontend to gateway + AI Engineer |
| React Frontend | 5173 | Chat interface + Task Dashboard SPA |
| SQLite DB | — | Shared task storage (WAL mode) |

## Task Dashboard

- **task-manager plugin** provides CRUD tools: create-task, update-task, list-tasks, complete-task
- Auto-generates task keys: OC-1, OC-2, OC-3...
- JIRA-like fields: task_key, title, description, issue_type, acceptance_criteria, priority, status, assignee, repo_url
- GitHub fields: pr_url, pr_number, branch_name, pr_status, ci_status

## Task Lifecycle

```
PENDING ──> IN_PROGRESS ──> REVIEW ──> COMPLETED
   |              |             |
   └──> BLOCKED <─┘─────────<──┘
```

## Agent Communication Flow

1. User sends message via webchat → PM receives it
2. PM creates dashboard ticket → delegates to FE via `sessions_spawn`
3. FE clones repo → implements → validates → creates GitHub PR → reports back
4. PM updates dashboard → delegates to QA via `sessions_spawn`
5. QA verifies PR report and acceptance criteria → reports PASS/FAIL
6. PM marks completed or re-delegates → reports to user with PR URL

## Security

- **hierarchy-guard plugin** enforces communication rules
- User can only talk to PM
- PM can delegate to FE and QA
- FE and QA cannot communicate with user directly
- Context isolation: no business info leaks into technical delegations
