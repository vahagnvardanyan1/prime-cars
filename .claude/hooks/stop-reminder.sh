#!/usr/bin/env bash
# Fires when Claude tries to end its turn. If the working tree has > 50 lines
# of uncommitted change in src/, exit non-zero to block stop and remind Claude
# to invoke the frontend-reviewer subagent.

set -uo pipefail

if [ -z "${CLAUDE_PROJECT_DIR:-}" ]; then exit 0; fi
cd "$CLAUDE_PROJECT_DIR" || exit 0

# Only meaningful in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then exit 0; fi

# Count uncommitted line changes in src/
CHANGED_LINES=$(git diff HEAD --numstat -- 'src/**/*.ts' 'src/**/*.tsx' 2>/dev/null \
  | awk '$1 != "-" && $2 != "-" {s += $1 + $2} END {print (s+0)}')

if [ "${CHANGED_LINES:-0}" -lt 50 ]; then
  exit 0
fi

# Block the stop, surface a reminder to Claude. Exit 2 = blocking stderr feedback.
cat >&2 <<MSG
Stop blocked: this turn changed ~${CHANGED_LINES} lines under src/.
For non-trivial diffs you must invoke the frontend-reviewer subagent before declaring done.
Run: "Use the frontend-reviewer subagent to review this diff against CLAUDE.md."
If you have already invoked it in this turn, type "stop-reviewed" to bypass this check.
MSG
exit 2
