---
name: test-writer
slug: test-writer
version: "1.0.0"
description: "Generate comprehensive test suites for source files. Detects test framework, resolves target files, writes unit/integration tests with >80% coverage goal, runs the tests and fixes failures (up to 2 iterations). Use when [SKILL]: test-writer, label needs-tests, or keyword @ai-agent write tests."
metadata: {"openclaw":{"emoji":"🧪","requires":{"bins":["git","gh","npm"]},"os":["linux","darwin","win32"]}}
---

## Triggers

- Label: `needs-tests`
- Keyword: `@ai-agent write tests`, `@ai-agent add tests`
- `[SKILL]: test-writer` in task message

---

## Pipeline

```
PARSE TARGET FILES → CLONE → DETECT TEST FRAMEWORK → GATHER CONTEXT → GENERATE TESTS → FIX LOOP (×2) → PUSH → PR
```

---

## Step 1 — Resolve Target Files

Find which source files need tests (in priority order):

1. Extract from `[DESCRIPTION]`: look for `` `filename.ts` `` or `filename.(ts|js|py|go|rs)` patterns
2. If a PR number was provided: `gh pr view <N> --json files` → exclude files with `test` or `spec` in their name
3. If still empty, read the issue body and look for file path references
4. **Fail** if no target files can be determined — report back to PM

---

## Step 2 — Clone & Detect Test Framework

```bash
WORK_DIR=$(mktemp -d)
git clone https://x-access-token:$GITHUB_TOKEN@github.com/<owner>/<repo>.git "$WORK_DIR"
cd "$WORK_DIR"
git checkout -b test/N-add-tests-for-<filename>
```

Detect test framework from `package.json` devDependencies:
- `jest` → Jest (config in `jest.config.*` or `package.json` jest field)
- `vitest` → Vitest (`vitest.config.*`)
- `mocha` → Mocha
- `@testing-library/react` → React Testing Library (with Jest or Vitest)
- `pytest` → pytest (Python)

Read 2–3 existing test files to learn: describe/it structure, import style, mock patterns, assertion style.

---

## Step 3 — Gather Context Per Target File

For each source file to test:
1. Read the full source file content
2. Find existing test files for it: look for `*.test.ts`, `*.spec.ts`, `__tests__/<name>.ts`
3. Identify all exported functions, classes, and types
4. List external dependencies (imports) that will need mocking
5. Identify side effects: API calls, file I/O, database operations, timers

---

## Step 4 — Generate Tests

For each target file, generate a test file following these rules:

**Coverage goals:**
- Target >80% line and branch coverage
- Test both happy path and error/edge cases
- Test all exported public functions
- Mock all external dependencies (API calls, DB, file system)
- Use descriptive test names: `describe('functionName') { it('returns X when Y') }`

**Constraints:**
- Use `<testFramework>` as the test framework (detected in Step 2)
- Follow EXACTLY the patterns found in existing test files
- Make sure all imports resolve correctly (use the same import aliases as the source)
- Do NOT test implementation details — test behavior and outputs
- TypeScript: ensure types are correct, no implicit `any`

**Test file naming:**
- `src/utils/foo.ts` → `src/utils/foo.test.ts` (or `__tests__/foo.test.ts` if project uses that pattern)

Write all test files to disk.

---

## Step 5 — Test Fix Loop (max 2 iterations)

```bash
npm test -- --passWithNoTests 2>&1
```

If tests fail:
1. Read the error output (cap at 2000 chars)
2. Focus fixes on: incorrect imports, wrong mock setup, assertion mismatches
3. Guiding principle: `"Fix the test code so all tests pass. Check imports, mocks, and assertions."`
4. Rewrite the failing test files
5. Re-run tests
6. After 2 iterations, proceed and note any remaining failures in the PR

---

## Step 6 — Commit, Push, Create PR

```bash
git add -A
git commit -m "test: add tests for <filename>

- Covers happy path, error cases, and edge cases
- Uses <testFramework>
- Target >80% coverage"

git push origin <branch>

gh pr create \
  --title "test: add tests for <filename>" \
  --body "<PR body>" \
  --repo <owner/repo>
```

**PR Body Template:**

```markdown
## 🧪 Auto-Generated Tests
Related to #<N>

### Files Tested
- `src/path/to/source.ts`

### Test Files Created
- `src/path/to/source.test.ts`: description of what is covered

### Validation
- ✅ Tests verified passing (or ⚠️ N tests may need manual review — see notes)
- Framework: **<testFramework>**
- Coverage goal: >80%

### Notes
<any mocks that need real credentials, flaky async patterns, or manual review needed>
```

---

## Report Back to PM

```
## Task Completed

**Repository:** <repo URL>
**PR URL:** <PR link>
**Branch:** <branch>
**Status:** SUCCESS

### Summary
Generated test suite for <N> files using <framework>.

### Validation Results
- Tests: PASS/FAIL (<N passing, N failing)

### Files Changed
- <list of test files created>
```
