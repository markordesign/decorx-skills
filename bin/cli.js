#!/usr/bin/env node
// decorx-tool skill installer — installs the skill into one or more AI agents' skill dirs.
// Usage:
//   decorx-skills install              # auto-detect installed agents and install to all of them
//   decorx-skills install --claude     # only Claude Code   (~/.claude/skills)
//   decorx-skills install --codex      # only Codex         (~/.agents/skills)
//   decorx-skills install --opencode   # only OpenCode      (~/.config/opencode/skills)
//   decorx-skills install --cursor     # only Cursor        (~/.cursor/skills)
//   decorx-skills install --all        # install to every supported agent
//   decorx-skills uninstall            # auto-detect installed agents and remove from all of them
//   decorx-skills uninstall --claude   # remove from one agent
//   decorx-skills uninstall --all      # remove from every supported agent
import { cpSync, mkdirSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_SRC = join(__dirname, '..', 'skills', 'decorx-tool'); // bundled with the npm package
const SKILL_NAME = 'decorx-tool';
const LEGACY_NAME = 'decorx-image';
const HOME = homedir();
const DECORX_DIR = join(HOME, '.decorx');

// agent target -> { skillsDir: where the skill folder goes; detectDir: presence implies the agent is installed }
const TARGETS = {
  claude:   { skillsDir: join(HOME, '.claude', 'skills'),             detectDir: join(HOME, '.claude') },
  codex:    { skillsDir: join(HOME, '.agents', 'skills'),             detectDir: join(HOME, '.codex') },
  opencode: { skillsDir: join(HOME, '.config', 'opencode', 'skills'), detectDir: join(HOME, '.config', 'opencode') },
  cursor:   { skillsDir: join(HOME, '.cursor', 'skills'),             detectDir: join(HOME, '.cursor') },
};

const args = process.argv.slice(2);
const cmd = args[0];

function installTo(skillsDir) {
  const dest = join(skillsDir, SKILL_NAME);
  mkdirSync(skillsDir, { recursive: true });
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  cpSync(SKILL_SRC, dest, { recursive: true });
  // clean up legacy skill name in this same directory (one-time migration from decorx-image)
  const legacy = join(skillsDir, LEGACY_NAME);
  const hadLegacy = existsSync(legacy);
  if (hadLegacy) rmSync(legacy, { recursive: true, force: true });
  return { dest, hadLegacy };
}

function uninstallTo(skillsDir) {
  const dest = join(skillsDir, SKILL_NAME);
  if (!existsSync(dest)) return { dest, wasRemoved: false };
  rmSync(dest, { recursive: true, force: true });
  return { dest, wasRemoved: true };
}

// Resolve which agent targets an install/uninstall acts on.
// --all forces every target; one or more --<agent> flags pick named ones;
// otherwise auto-detect every agent installed on this machine.
function resolveTargets(args) {
  const flags = args.filter((a) => a.startsWith('--'));
  if (flags.includes('--all')) return Object.keys(TARGETS);
  const named = flags.filter((f) => f.slice(2) in TARGETS).map((f) => f.slice(2));
  return named.length
    ? named
    : Object.entries(TARGETS).filter(([, t]) => existsSync(t.detectDir)).map(([k]) => k);
}

if (cmd === 'install' || cmd === undefined) {
  if (!existsSync(SKILL_SRC)) {
    console.error('Skill source not found:', SKILL_SRC);
    process.exit(1);
  }

  const keys = resolveTargets(args);

  if (!keys.length) {
    console.error('No agents detected on this machine. Re-run with one of: --claude, --codex, --opencode, --cursor, or --all.');
    process.exit(1);
  }

  let cleanedLegacy = false;
  for (const k of keys) {
    const { dest, hadLegacy } = installTo(TARGETS[k].skillsDir);
    console.log(`[${k}] Installed ${SKILL_NAME} -> ${dest}`);
    if (hadLegacy) cleanedLegacy = true;
  }
  if (cleanedLegacy) console.log(`(Removed legacy skill '${LEGACY_NAME}' where it was present.)`);

  // config is shared across all agents
  const skillJsonPath = join(DECORX_DIR, 'skill.json');
  if (!existsSync(skillJsonPath)) {
    mkdirSync(DECORX_DIR, { recursive: true });
    writeFileSync(skillJsonPath, JSON.stringify({ api_key: 'dxk_PASTE_YOUR_KEY' }, null, 2) + '\n');
    console.log(`Created ${skillJsonPath} — edit it to paste your api_key.`);
  } else {
    console.log(`Config already exists: ${skillJsonPath} (left as-is).`);
  }
  console.log('Get an api key from DecorX(https://canvas.decorx.com) → Settings → API Keys.');
} else if (cmd === 'uninstall') {
  const keys = resolveTargets(args);
  if (!keys.length) {
    console.error('No agents detected on this machine. Re-run with one of: --claude, --codex, --opencode, --cursor, or --all.');
    process.exit(1);
  }

  let removed = 0;
  for (const k of keys) {
    const { dest, wasRemoved } = uninstallTo(TARGETS[k].skillsDir);
    console.log(`[${k}] ${wasRemoved ? 'Removed' : 'Not installed'} ${SKILL_NAME} -> ${dest}`);
    if (wasRemoved) removed += 1;
  }
  if (removed) {
    console.log(`Uninstalled ${SKILL_NAME} from ${removed} agent(s). (~/.decorx/skill.json left in place — delete it manually if you no longer need it.)`);
  } else {
    console.log(`Nothing to uninstall — ${SKILL_NAME} was not found in any target skill dir.`);
  }
} else {
  console.log('Usage: decorx-skills install   [--claude|--codex|--opencode|--cursor|--all]');
  console.log('       decorx-skills uninstall [--claude|--codex|--opencode|--cursor|--all]');
}
