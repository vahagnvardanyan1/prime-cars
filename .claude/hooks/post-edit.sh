#!/usr/bin/env bash
# Runs after every Edit/Write/MultiEdit/NotebookEdit by Claude Code.
#
# Strategy:
#   1) Type-check the whole project under the strictest config we ship.
#      Then surface ONLY the errors involving the file Claude just edited —
#      legacy errors in other files are grandfathered and don't block.
#   2) Lint the edited file only. Quiet mode shows errors only, not warnings.
#
# This means: new code Claude writes is held to the strictest standard.
# Legacy code stays as-is until explicitly cleaned up.
#
# Exit codes:
#   0 — clean
#   2 — blocking failure: Claude sees the output and must fix it before
#       declaring the task done.

set -uo pipefail

INPUT="$(cat)"

FILE_PATH=$(printf '%s' "$INPUT" | python3 -c \
  "import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except Exception:
    pass" 2>/dev/null)

# Only act on TS/JS source files under src/.
case "$FILE_PATH" in
  */src/*.ts|*/src/*.tsx|*/src/*.js|*/src/*.jsx) ;;
  *) exit 0 ;;
esac

# Walk up to find package.json.
PROJECT_ROOT="$(cd "$(dirname "$FILE_PATH")" 2>/dev/null && while [ ! -f package.json ] && [ "$PWD" != "/" ]; do cd ..; done && pwd)"
if [ -z "$PROJECT_ROOT" ] || [ ! -f "$PROJECT_ROOT/package.json" ]; then
  exit 0
fi
cd "$PROJECT_ROOT"

# Relative path of the edited file from project root — tsc reports paths this way.
REL_PATH="${FILE_PATH#$PROJECT_ROOT/}"

# 1) Project-wide type check; filter for errors in the edited file only.
TSC_OUTPUT=$(npx --no-install tsc --noEmit --project tsconfig.json 2>&1 || true)
FILE_TSC_ERRORS=$(printf '%s\n' "$TSC_OUTPUT" | grep -F "$REL_PATH" || true)

if [ -n "$FILE_TSC_ERRORS" ]; then
  echo "post-edit hook: type-check failed for $REL_PATH" >&2
  echo "$FILE_TSC_ERRORS" >&2
  exit 2
fi

# 2) Lint the edited file only.
ESLINT_OUTPUT=$(npx --no-install eslint --quiet "$FILE_PATH" 2>&1) || {
  echo "post-edit hook: lint failed for $REL_PATH" >&2
  echo "$ESLINT_OUTPUT" >&2
  exit 2
}

exit 0
