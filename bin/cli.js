#!/usr/bin/env node
// DecorX skills installer (MVP): copies a skill into ~/.claude/skills/ and creates ~/.decorx/skill.json template.
// Usage: decorx-skills install <skill>   (e.g. decorx-skills install image)
import { cpSync, mkdirSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_SRC = join(__dirname, '..', 'skills'); // bundled with the npm package
const CLAUDE_DIR = join(homedir(), '.claude', 'skills');
const DECORX_DIR = join(homedir(), '.decorx');

const SKILLS = {
  image: 'decorx-image'
};

const [, , cmd, skillName] = process.argv;

if (cmd === 'install' && skillName) {
  const folder = SKILLS[skillName];
  if (!folder) {
    console.error(`Unknown skill "${skillName}". Available: ${Object.keys(SKILLS).join(', ')}`);
    process.exit(1);
  }
  const src = join(SKILLS_SRC, folder);
  const dest = join(CLAUDE_DIR, folder);
  if (!existsSync(src)) {
    console.error('Skill source not found:', src);
    process.exit(1);
  }

  // 1. 复制 skill 到 ~/.claude/skills/（覆盖式更新）
  mkdirSync(CLAUDE_DIR, { recursive: true });
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  cpSync(src, dest, { recursive: true });
  console.log(`Installed ${folder} -> ${dest}`);

  // 2. 首次安装创建 ~/.decorx/skill.json 模板（用 homedir()，跨平台路径正确；已存在不覆盖）
  const skillJsonPath = join(DECORX_DIR, 'skill.json');
  if (!existsSync(skillJsonPath)) {
    mkdirSync(DECORX_DIR, { recursive: true });
    writeFileSync(skillJsonPath, JSON.stringify({ api_key: 'dxk_PASTE_YOUR_KEY' }, null, 2) + '\n');
    console.log(`Created ${skillJsonPath} — edit it to paste your api_key.`);
  } else {
    console.log(`Config already exists: ${skillJsonPath} (left as-is).`);
  }
  console.log('Get an api key from DecorX → Settings → API Keys.');
} else {
  console.log('Usage: decorx-skills install <skill>');
  console.log('Available skills: ' + Object.keys(SKILLS).join(', '));
}
