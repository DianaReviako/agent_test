---
name: pull-request
description: Publish reviewed test-folder changes after the user keeps a fix, or after a review finds no issues.
---

# Pull request workflow

Use after the user selects **Keep** for a test fix, or when the review finds no issues. Keep all review and publication scope under `tests/`.

## Inspect and prepare

1. Check the current branch, worktree status, base branch, and diff. Preserve existing changes and do not stage unrelated files.
2. After **Keep**, validate the fixed test and show its final diff. With no findings, run relevant checks and report their actual results.
3. Create a descriptive branch from `main`, stage only changed files under `tests/`, and create a commit.
4. Push the branch and create a pull request targeting `main`. Include `Summary` and `Testing`.

## Execute publish workflow

Verify each operation. If one fails or GitHub authentication/permissions are missing, stop and explain the blocker. Never force-push, amend, merge, alter repository settings, or publish files outside `tests/`. Do not put credentials in files, chat, or command arguments.
