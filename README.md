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
5. Open `.mcp.token.example` and replace the example value with your token:

   ```text
   GITHUB_PERSONAL_ACCESS_TOKEN=your-token-here
   ```

   `.mcp.token.example` is listed in `.gitignore` and must remain ignored. Do not commit or share it. The file can contain the raw token by itself or use the `GITHUB_PERSONAL_ACCESS_TOKEN=...` format.
6. In Chat, open **Configure Chat** (gear icon) and choose **MCP Servers**, or run **Chat: Open Customizations** and select **MCP Servers**. Start or restart `github` if needed; approve the server only after checking its command. Confirm its tools are available.
7. In Chat, open the **agent** picker and select **GitHub Review**. The agent definition is `.github/agents/github-review.agent.md`.

The workspace-root `.mcp.json` is the configuration for the Copilot harness. `.vscode/mcp.json` is a separate, legacy configuration for the Local harness.

## Review changes

Select **GitHub Review** and ask it to review the test changes. For example:

```text
Review the changed files under tests/ against main.
```

If you want an inspection-only review, explicitly ask the agent not to edit or publish. For a GitHub pull request, provide its number or URL. The agent should report what it could not verify and must not claim tests were run unless it actually ran them.

## Implement a fix

When the agent finds a clear defect, it applies a focused fix under `tests/` and pauses for you to select **Keep** or **Undo**. You can also ask it to make a particular approved change:

```text
Implement finding 1 only. Preserve my other changes, add or update a focused test,
run the narrowest relevant check, and show me the diff.
```

## Prepare a pull request

The `pull-request` skill is located at `.github/skills/pull-request/SKILL.md` and provides the publication workflow.

If findings exist, the agent applies clear, focused fixes under `tests/` and then pauses. Review the VS Code diff and select **Keep** to approve the edit or **Undo** to reject it. After **Keep**, the agent validates the test change and proceeds to the branch, commit, push, and pull request workflow. If the review has no findings, the agent proceeds directly to that workflow.

## Repository customizations

- `.github/agents/github-review.agent.md` — review agent definition and review workflow.
- `.github/skills/pull-request/SKILL.md` — pull request workflow.
- `.github/copilot-instructions.md` — repository-wide Copilot guidance.
- `.mcp.json` — GitHub MCP configuration for Copilot.
- `.vscode/mcp.json` — legacy Local-harness MCP configuration.
