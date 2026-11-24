---
name: python-commit-pr
description: Lint, verify, commit, push, and open a pull request for reviewed Python changes. Use when the user types "commit" in the Python Reviewer agent, or asks to publish, commit, or open a PR for the changed Python files.
---

# Python commit and PR

Publish the changed Python files only after lint and verification pass. Stop at the first step that cannot be completed and report why. Never claim a check passed unless you ran it.

## 1. Select the files

List changed files as in the `python-code-review` skill (`git diff --name-only HEAD` plus `git ls-files --others --exclude-standard`), keep only `*.py`. If there are none, reply `Nothing to commit.` and stop.

## 2. Lint and fix

1. Run `python -m ruff check .` and read the full output.
2. For each finding in a changed file, edit the file with the edit tool. Do not use `ruff --fix` or any shell command that writes files.
   - Use the `help:` suggestion when it preserves behavior. Unsafe fixes (for example `SIM108`) are allowed when you have confirmed the result behaves the same.
   - Do not silence a rule with `# noqa` or by changing `pyproject.toml`.
3. Re-run `python -m ruff check .`. Repeat at most 3 rounds.
4. Stop and ask the user when a finding is in an unchanged file, is not safely fixable, or remains after 3 rounds.

## 3. Verify the code

1. Run `python -m pytest -q`. Exit code 5 means no tests were collected, which is not a failure.
2. If pytest is not installed, run `python -m py_compile` on each changed file instead and say that no tests ran.
3. If anything fails, show the output and stop. Do not commit.

## 4. Commit, push, and open the PR

Run each git command as its own tool call.

1. Check the current branch with `git branch --show-current`. Do not commit on `main` or `master`. Create a branch with `git switch -c review/<short-topic>` from the current HEAD.
2. Run `git log origin/main..HEAD --oneline`. If it lists commits you did not make in this session, tell the user and ask before pushing.
3. Stage by explicit path: `git add <file> <file>`. Never use `git add .`, `-A`, or `-u`. Stage only the changed `*.py` files, not configuration or secrets.
4. Commit with a short imperative message that describes the change: `git commit -m "<message>"`.
5. Push with `git push -u origin <branch>`. Never force-push.
6. Open the PR with `gh pr create --base main --title "<title>" --body "<body>"`. The body has a `Summary` section (what changed and why) and a `Testing` section (the exact checks you ran and their results). Pass the body inline; do not write temp files.

## 5. Report

Reply with the branch, commit hash, PR URL, and the results of the lint and verification steps. Never merge the PR.
