---
name: python-code-review
description: Review changed Python files as a senior engineer. Use when asked to review, check, or approve Python changes, or when the user types "start" in the Python Reviewer agent. Covers duplication, magic values, logic and edge cases, mutations and side effects, control flow, naming and types, and error handling.
---

# Python code review

Review as a Senior Python Engineer. Be concise, direct, and actionable. Report real bugs and maintainability risks only. Do not comment on formatting, import order, or line length; formatters and linters handle them.

## Select the files

1. List changed files: `git diff --name-only HEAD` plus `git ls-files --others --exclude-standard`. If both are empty, use `git diff --name-only main...HEAD`.
2. Keep only `*.py` files. Ignore deleted files, generated code, and vendored code.
3. Read each file in full, then read its diff. Read callers or tests only when needed to confirm a finding.

## Checklist

Apply each category. Report only evidence-based findings.

1. **Duplication** — repeated logic or near-identical blocks. Extract a helper or parameterize only when the blocks share meaning and change together. Do not suggest premature abstraction.
2. **Magic values** — unexplained numbers, status strings, timeouts, thresholds. Require `UPPER_SNAKE_CASE` constants, an `Enum`, or config. Timeouts and sizes need a unit in the name (`TIMEOUT_SECONDS`).
3. **Logic and edge cases**
   - `and`/`or` precedence without parentheses.
   - Boundaries: `<` vs `<=`, off-by-one, slicing.
   - `None`, empty collections, `0`, `False`, negatives, duplicates. Flag truthiness checks that conflate `None` with `0` or `[]`.
   - `== None` instead of `is None`.
4. **Mutations and side effects**
   - Mutable default arguments (`def f(x=[])`).
   - Mutating input arguments or shared collections in place.
   - Hidden I/O, global state, or time/randomness calls inside functions that look pure.
5. **Control flow and clarity** — prefer guard clauses and early returns over deep nesting. One responsibility per function. Remove dead code, unused imports and variables, and commented-out code.
6. **Naming and types** — intent-revealing names (avoid `data`, `temp`, `flag`, `process`). Accurate annotations, including `| None` and return types on public functions.
7. **Error handling** — bare `except:` or broad `except Exception` without need, silently swallowed errors, `finally` blocks that can mask the original exception, lost tracebacks (use `raise ... from err`).

Skip anything that is speculative, preference-only, or already enforced by tooling.

## Fixing

- Fix a finding only when the fix is clear, local, and behavior-preserving apart from the bug itself. Edit the file directly with the edit tool so VS Code shows **Keep** and **Undo** on the change.
- Make the smallest edit that resolves the finding. Do not reformat or touch unrelated lines.
- If the correct fix needs a product or design decision, report the finding in chat without editing and ask a question.
- Do not run `git commit`, `checkout`, `reset`, `restore`, `stash`, or similar while edits are pending, unless the user has typed `commit` (see the `python-commit-pr` skill); they would discard the pending Keep/Undo state.

## Reporting

Post one chat entry per finding, ordered by severity (bug first, then maintainability):

```text
N. <short title> — <category>
Location: <path>:<line>
Risk: <what breaks or becomes hard to maintain, and when>
Fix: <what was changed, or the concrete change to make>
```

Use the category names from the checklist (for example "Mutations and side effects", "Duplication"). Give the reason for every edit so the user can decide between Keep and Undo.

If there are no findings, reply with exactly `Approved` and nothing else.
