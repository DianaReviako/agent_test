const fs = require('node:fs');

// Git subcommands that change history, the index, or the working tree and would
// discard or hide the pending Keep/Undo edits.
const BLOCKED_GIT_SUBCOMMANDS = [
  'add', 'commit', 'push', 'pull', 'checkout', 'switch', 'restore', 'reset',
  'stash', 'clean', 'rebase', 'merge', 'cherry-pick', 'revert', 'apply', 'am',
];
const GIT_COMMAND = new RegExp(
  `\\bgit\\s+(?:-\\S+\\s+(?:\\S+\\s+)?)*(${BLOCKED_GIT_SUBCOMMANDS.join('|')})\\b`,
  'i',
);

function readCommand(event) {
  let args = event.toolArgs;
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args);
    } catch {
      return args;
    }
  }
  return args && typeof args.command === 'string' ? args.command : '';
}

let event;
try {
  event = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.stderr.write('review-guard: invalid hook input\n');
  process.exit(1);
}

const match = GIT_COMMAND.exec(readCommand(event));
if (match) {
  process.stdout.write(JSON.stringify({
    permissionDecision: 'deny',
    permissionDecisionReason:
      `The reviewer must not run "git ${match[1].toLowerCase()}": it would discard or hide ` +
      'the pending Keep/Undo edits. Use read-only git commands (diff, status, log, show).',
  }));
} else {
  process.stdout.write('{}');
}
