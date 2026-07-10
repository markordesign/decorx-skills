# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A skill-distribution npm package (`decorx-skills`), not an application. Users run `npx decorx-skills install image` to copy a Claude Code skill into `~/.claude/skills/`. There is **no build step, no test suite, and no linter** — `package.json` has no `scripts`. The published artifact is the raw source (only `bin/` and `skills/` are bundled via the `files` field). Node >= 18, ESM.

## Commands

- **Test the installer locally** (no npm publish needed): `node bin/cli.js install image` — copies `skills/decorx-image/` into `~/.claude/skills/decorx-image/` and creates a `~/.decorx/skill.json` template if absent.
- Verify the CLI is wired up without side effects: `node bin/cli.js` prints usage and the available skill names.
- The end-user entrypoint after `npm i -g` / `npx`: `decorx-skills install <skill>`.

## Architecture

Two parts that must stay in sync:

1. **Installer** (`bin/cli.js`) — a single-file CLI. It maps an install name to a skill folder via the hardcoded `SKILLS` object (`image` → `decorx-image`), then copies that folder from the bundled `skills/` source into `~/.claude/skills/`. It also seeds `~/.decorx/skill.json` with `{ "api_key": "dxk_PASTE_YOUR_KEY" }` on first install (never overwrites an existing config). Paths use `os.homedir()` for cross-platform correctness.

2. **Skill definitions** (`skills/<name>/`) — each skill is a folder containing a `SKILL.md` (with YAML frontmatter `name` + `description`) and a `README.md`. The `SKILL.md` body is **the runtime logic**: when an installed skill is invoked, Claude reads that file and follows its instructions. Editing `SKILL.md` directly changes runtime behavior, so it must be precise (the DecorX API contract, auth rules, and security constraints live there verbatim).

### Adding a new skill

1. Create `skills/<skill-folder>/SKILL.md` (frontmatter `name` + `description`) and `README.md`.
2. Register the install-name → folder mapping in the `SKILLS` object in `bin/cli.js`.
3. Add it to the README's "Available skills" list.

### Config & secrets model

API keys live in `~/.decorx/skill.json` (outside any repo) as `{ api_key, base_url? }`. **Never** write keys into repo files, commits, logs, or command text. `SKILL.md` instructs the runtime Claude to load the key into a shell variable and never echo it. Generated image URLs are public/unauthenticated — do not route private imagery through this skill.
