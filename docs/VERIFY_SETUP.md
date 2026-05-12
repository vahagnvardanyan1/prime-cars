# Verifying the Claude Code setup on your machine

The setup includes mechanical enforcement layers (PostToolUse hook, Stop hook,
husky pre-commit, GitHub Actions). They were authored in a sandbox where paths
don't fully match your machine. Run this checklist once to confirm everything
actually fires.

## 1. Install the new dev dependencies

The pre-commit hook needs `husky` and `lint-staged`. Run:

```bash
npm install
```

After install, `npm run prepare` (defined in `package.json`) runs `husky` to
initialize the git hooks directory. If it doesn't run automatically, run:

```bash
npx husky init
```

Verify `.husky/pre-commit` exists and is executable.

## 2. Verify the PostToolUse hook (Claude Code edit feedback)

Goal: confirm that when Claude edits a file, the hook fires and surfaces
type/lint errors.

1. Open Claude Code in this project.
2. Ask Claude to make a deliberate type error in any clean source file. For
   example: *"Edit `src/contexts/QueryProvider.tsx` and add `const x: number =
   'string';` to the top of the function body."*
3. After Claude makes the edit, you should see the hook output containing:
   ```
   post-edit hook: type-check failed for src/contexts/QueryProvider.tsx
   src/contexts/QueryProvider.tsx(N,M): error TS2322: ...
   ```
4. Ask Claude to revert the change.

If you do NOT see the hook output: the hook isn't wired up correctly. Common
causes:
- `$CLAUDE_PROJECT_DIR` isn't set in your Claude Code version. Edit
  `.claude/settings.json` and replace `$CLAUDE_PROJECT_DIR/.claude/hooks/post-edit.sh`
  with the absolute path.
- `python3` not on PATH. The hook parses the input JSON with python3.
- `npx --no-install` failing because deps aren't installed. Run `npm install` first.

## 3. Verify the Stop hook (auto-prompt for reviewer)

Goal: confirm that when Claude tries to declare a turn done after substantial
edits, the Stop hook reminds about the frontend-reviewer subagent.

1. In Claude Code, make a deliberately large edit — ask Claude to add 60+ lines
   of new code to any file.
2. When Claude attempts to end the turn, you should see the Stop hook message:
   ```
   Stop blocked: this turn changed ~N lines under src/.
   For non-trivial diffs you must invoke the frontend-reviewer subagent...
   ```
3. Confirm Claude responds by actually invoking the subagent.

If the hook doesn't fire: same diagnostic as section 2.

## 4. Verify the pre-commit hook (catches non-Claude edits)

Goal: confirm that committing from outside Claude Code still runs the checks.

1. Open `src/contexts/QueryProvider.tsx` in VS Code directly (or any editor).
2. Add a deliberate type error: `const x: number = "string";`
3. Run `git add . && git commit -m "test"` in your terminal.
4. The commit should fail with output from `tsc` and/or `eslint`.

If the commit succeeds: husky isn't installed or `.husky/pre-commit` isn't
executable. Run `npx husky init` and re-test.

Revert your change after testing.

## 5. Verify GitHub Actions CI (catches teammate edits and PRs)

Goal: confirm CI runs on push and PR.

1. Push any commit to a feature branch.
2. Open a PR.
3. The "Quality" workflow should run and show `type-check-and-lint` job
   results in the Checks tab.

If the workflow doesn't appear: the file lives at `.github/workflows/quality.yml`.
Confirm it was committed and pushed. Confirm Actions are enabled in your repo
settings.

## 6. Verify the frontend-reviewer subagent

Goal: confirm the subagent can actually be invoked.

In Claude Code, in any session, type:
```
Use the frontend-reviewer subagent to review the most recent commit.
```

The subagent should run and produce a report with Blocking / Suggestions / OK
sections. If Claude says it can't find the subagent, check
`.claude/agents/frontend-reviewer.md` exists.

## When all 6 pass

The setup is verified end-to-end. From here, the feedback loops fire automatically
on every edit, every Stop, every commit, every push. You don't need to remember
them — the infrastructure remembers for you.
