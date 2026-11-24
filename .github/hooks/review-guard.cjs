const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const PROTECTED_BRANCHES = ['main', 'master'];
// Commands that discard pending edits, rewrite history, or change the tree in
// ways the reviewer never needs.
const BLOCKED_GIT_SUBCOMMANDS = new Set([
  'restore', 'reset', 'stash', 'clean', 'rebase', 'merge', 'cherry-pick',
  'revert', 'apply', 'am', 'pull',
]);
const GLOBAL_OPTIONS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree']);
const BROAD_ADD_ARGS = new Set(['.', '*', '-A', '--all', '-u', '--update']);
const FORCE_PUSH_ARGS = new Set([
  '-f', '--force', '--force-with-lease', '-d', '--delete', '--mirror',
]);

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

function parseGit(segment) {
  const tokens = segment.trim().split(/\s+/);
  let i = tokens.indexOf('git') + 1;
  if (i === 0) return null;
  while (i < tokens.length && tokens[i].startsWith('-')) {
    i += GLOBAL_OPTIONS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
  }
  return tokens[i] ? { subcommand: tokens[i], args: tokens.slice(i + 1) } : null;
}

function currentBranch(cwd) {
  const result = spawnSync('git', ['branch', '--show-current'], { cwd, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}

function ruffFails(cwd) {
  const result = spawnSync('python', ['-m', 'ruff', 'check', '--quiet', '.'], {
    cwd,
    encoding: 'utf8',
  });
  return result.status !== 0;
}

function checkGit({ subcommand, args }, cwd) {
  if (BLOCKED_GIT_SUBCOMMANDS.has(subcommand)) {
    return `"git ${subcommand}" can discard pending Keep/Undo edits or rewrite history.`;
  }
  switch (subcommand) {
    case 'checkout':
    case 'switch':
      return args.some((arg) => arg === '-b' || arg === '-c')
        ? null
        : 'Only creating a new branch (git switch -c) is allowed.';
    case 'add':
      return args.some((arg) => BROAD_ADD_ARGS.has(arg))
        ? 'Stage changed Python files by explicit path; never use ".", "-A", or "-u".'
        : null;
    case 'commit':
      if (args.some((arg) => arg === '--amend' || /^-[a-zA-Z]*a[a-zA-Z]*$/.test(arg))) {
        return 'Do not use --amend or -a; stage explicit paths and create a new commit.';
      }
      if (PROTECTED_BRANCHES.includes(currentBranch(cwd))) {
        return 'Do not commit on a protected branch; create a review branch first.';
      }
      return ruffFails(cwd)
        ? '"python -m ruff check ." reports errors. Fix them before committing.'
        : null;
    case 'push':
      if (args.some((arg) => FORCE_PUSH_ARGS.has(arg) || arg.startsWith('+'))) {
        return 'Force-pushing and deleting remote branches are not allowed.';
      }
      if (
        args.some((arg) => PROTECTED_BRANCHES.some((name) => arg === name || arg.endsWith(`:${name}`))) ||
        PROTECTED_BRANCHES.includes(currentBranch(cwd))
      ) {
        return 'Do not push to a protected branch; push the review branch.';
      }
      return null;
    default:
      return null;
  }
}

function findViolation(command, cwd) {
  for (const segment of command.split(/&&|\|\||[;|\r\n]/)) {
    if (/\bgh\s+pr\s+(merge|close)\b/.test(segment)) {
      return 'The reviewer opens pull requests but never merges or closes them.';
    }
    const git = parseGit(segment);
    const reason = git && checkGit(git, cwd);
    if (reason) return reason;
  }
  return null;
}

let event;
try {
  event = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.stderr.write('review-guard: invalid hook input\n');
  process.exit(1);
}

const cwd = typeof event.cwd === 'string' ? event.cwd : process.cwd();
const reason = findViolation(readCommand(event), cwd);
process.stdout.write(
  JSON.stringify(reason ? { permissionDecision: 'deny', permissionDecisionReason: reason } : {}),
);
