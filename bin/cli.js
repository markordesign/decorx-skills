#!/usr/bin/env node
// DecorX skill installer: installs the `decorx-tool` skill into ~/.claude/skills/
// and creates a ~/.decorx/skill.json config template on first run.
// Usage: decorx-skills install   (or just `decorx-skills`)
import { cpSync, mkdirSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_SRC = join(__dirname, '..', 'skills', 'decorx-tool'); // bundled with the npm package
const CLAUDE_DIR = join(homedir(), '.claude', 'skills');
const DEST = join(CLAUDE_DIR, 'decorx-tool');
const DECORX_DIR = join(homedir(), '.decorx');

const [, , cmd] = process.argv;

if (cmd === 'install' || cmd === undefined) {
  if (!existsSync(SKILL_SRC)) {
    console.error('Skill source not found:', SKILL_SRC);
    process.exit(1);
  }

  // 1. 复制 skill 到 ~/.claude/skills/decorx-tool/（覆盖式更新）
  mkdirSync(CLAUDE_DIR, { recursive: true });
  if (existsSync(DEST)) {
    rmSync(DEST, { recursive: true, force: true });
  }
  cpSync(SKILL_SRC, DEST, { recursive: true });
  console.log(`Installed decorx-tool -> ${DEST}`);

  // 2. 清理旧版 skill 名 decorx-image（历史遗留，一次性迁移，避免重复 skill）
  const legacy = join(CLAUDE_DIR, 'decorx-image');
  if (existsSync(legacy)) {
    rmSync(legacy, { recursive: true, force: true });
    console.log(`Removed legacy skill: ${legacy}`);
  }

  // 3. 首次安装创建 ~/.decorx/skill.json 模板（用 homedir()，跨平台路径正确；已存在不覆盖）
  const skillJsonPath = join(DECORX_DIR, 'skill.json');
  if (!existsSync(skillJsonPath)) {
    mkdirSync(DECORX_DIR, { recursive: true });
    writeFileSync(skillJsonPath, JSON.stringify({ api_key: 'dxk_PASTE_YOUR_KEY' }, null, 2) + '\n');
    console.log(`Created ${skillJsonPath} — edit it to paste your api_key.`);
  } else {
    console.log(`Config already exists: ${skillJsonPath} (left as-is).`);
  }
  console.log('Get an api key from DecorX(https://canvas.decorx.com) → Settings → API Keys.');
} else {
  console.log('Usage: decorx-skills install   (installs the decorx-tool skill)');
}
