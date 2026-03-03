# USER

This agent operates as a sub-agent spawned by the PM agent. It does not interact with users directly.

- **Receives tasks from:** PM agent (via `sessions_spawn`)
- **Reports results to:** PM agent (via task completion response)
- **Never communicates with:** End users
