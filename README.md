# GitHub Review Agent

A VS Code Copilot custom agent for reviewing code changes and, when explicitly requested, preparing GitHub pull requests. The review workflow is inspection-only: asking for a review does not authorize file edits, commits, pushes, or pull requests.

## Requirements

- A recent VS Code version with GitHub Copilot Chat and the Copilot harness enabled.
- Docker installed and available on `PATH` if you want to use the GitHub MCP server configured in `.mcp.json`.
- A GitHub token available to the MCP server through the `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable. Do not put the token in a tracked file or paste it into chat. Grant only the repository permissions you need; creating pull requests requires pull-request write access.

The GitHub MCP configuration exposes all tools published by its server. Review and approve tool calls deliberately, especially operations that write to GitHub.

## Setup

1. Open this repository as a folder in VS Code.
2. Open **Chat** from the VS Code Activity Bar. The **session target** selector is in the Chat view; choose **Copilot** there. This selects the runtime for the chat session. It is separate from the **agent** picker, where you will later choose **GitHub Review**.
3. If you only want the agent to inspect files in your local workspace, you can skip the GitHub MCP setup below.
4. To enable GitHub MCP with this repository's `.mcp.json`, install and start Docker Desktop. Then create a GitHub token with only the permissions you need.
5. Copy `.mcp.token.example` to `.mcp.token`, open `.mcp.token`, and replace the example value with your token:

   ```text
   GITHUB_PERSONAL_ACCESS_TOKEN=your-token-here
   ```

   `.mcp.token` is listed in `.gitignore` and must not be committed. The file can contain the raw token by itself or use the `GITHUB_PERSONAL_ACCESS_TOKEN=...` format.
6. In Chat, open **Configure Chat** (gear icon) and choose **MCP Servers**, or run **Chat: Open Customizations** and select **MCP Servers**. Start or restart `github` if needed; approve the server only after checking its command. Confirm its tools are available.
7. In Chat, open the **agent** picker and select **GitHub Review**. The agent definition is `.github/agents/github-review.agent.md`.

The workspace-root `.mcp.json` is the configuration for the Copilot harness. `.vscode/mcp.json` is a legacy Local-harness configuration that prompts for a token; prompt files are for Local sessions. If you use that older setup, select the Local harness and enter your token only in the secure password prompt.

## Review changes

Select **GitHub Review** and ask for the review scope explicitly. For example:

```text
Review my current branch against main. Inspect the diff and relevant tests.
Report only actionable defects, with severity, file and line, impact, and a suggested fix.
Do not edit files or publish anything.
```

For a GitHub pull request, provide its number or URL and ask the agent to inspect its description, changed files, and diff. Review findings are based on the code and evidence available to the session; the agent should state anything it could not verify and must not claim tests were run unless it actually ran them.

## Implement a fix

The agent is configured primarily for review. If you want it to implement a reported fix, make a separate, explicit request, such as:

```text
Implement finding 1 only. Preserve my other changes, add or update a focused test,
run the narrowest relevant check, and show me the diff.
```

Review instructions prohibit editing during a review, and Git instructions require separate explicit approval before consequential Git or GitHub actions.

## Prepare a pull request

Ask **GitHub Review** to prepare a pull request, or invoke the `pull-request` skill if it is available in the Copilot session. The skill is located at `.github/skills/pull-request/SKILL.md`.

The agent must inspect the branch and worktree, summarize the proposed changes and checks, and show the intended operations before proceeding. Confirm each operation separately: branch creation/switching, staging or committing, pushing, and creating or updating the pull request. Approval for one step does not approve the next.

The prompt file `.github/prompts/create-pr.prompt.md` is for the legacy Local harness, not Copilot. In a Local session, run `/create-pr` and provide an optional title or issue. Invoking it does not itself approve side effects.

## Repository customizations

- `.github/agents/github-review.agent.md` — review agent definition and review workflow.
- `.github/instructions/code-review.instructions.md` — review criteria.
- `.github/instructions/git-workflow.instructions.md` — Git and publishing safeguards.
- `.github/skills/pull-request/SKILL.md` — pull request workflow.
- `.github/prompts/create-pr.prompt.md` — Local-harness pull request prompt.
- `.github/copilot-instructions.md` — repository-wide Copilot guidance.
- `.mcp.json` — GitHub MCP configuration for Copilot.
- `.vscode/mcp.json` — legacy Local-harness MCP configuration.
