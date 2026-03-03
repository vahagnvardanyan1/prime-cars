# Tools Reference

## Dashboard Tools

| Tool | Purpose |
|------|---------|
| `task-manager:create-task` | Create a new JIRA-style ticket on the dashboard |
| `task-manager:update-task` | Update task status, PR URL, GitHub fields |
| `task-manager:list-tasks` | List tasks with optional filters |
| `task-manager:complete-task` | Mark a task as completed with summary |

## Delegation Tools

| Tool | Purpose |
|------|---------|
| `sessions_spawn(agentId: "fe")` | Delegate implementation work to Frontend Engineer |
| `sessions_spawn(agentId: "qa")` | Delegate verification to QA Engineer |

## Usage Notes

- Always create a dashboard ticket BEFORE using `sessions_spawn`
- Always include `label: "fe-OC-X"` or `label: "qa-OC-X"` in spawn calls
- `[REPO]` tag is mandatory in every FE delegation — never use placeholder URLs
- Update the dashboard at every status transition
