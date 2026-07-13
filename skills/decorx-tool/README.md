# decorx-tool (agent skill)

The DecorX skill — a single, growing bundle of DecorX design capabilities. Today it supports **image generation** (text-to-image & image-to-image), **room cleaning** (empty a furnished room into a bare room), and **region erase/replace** (remove or swap a named object in a photo); more capabilities will be added to this same skill over time. Works with any SKILL.md-compatible agent (Claude Code, Codex, OpenCode, Cursor, …).

## Install

```bash
npx decorx-skills install            # auto-detect installed agents
npx decorx-skills install --claude   # or target one explicitly: --codex / --opencode / --cursor / --all
```

Installs into each agent's skill directory (e.g. `~/.claude/skills/decorx-tool/`, `~/.agents/skills/decorx-tool/`, …).

> Local dev without npm publish: `node bin/cli.js install` from this repo.

## Get an API key

1. Open DecorX → **Settings** → **API Keys** → **Create Key**.
2. Copy the `dxk_...` key immediately — it is shown only once.

## Configure

The installer created `~/.decorx/skill.json`. Edit it and paste your key:

```json
{ "api_key": "dxk_...", "base_url": "https://your-decorx-server" }
```

- `base_url`: the DecorX server address you log into (defaults to `https://pretest.houseofmarkor.com`).
- This file lives outside any git repo. Do not commit or share it.

## Use

In your agent, ask something like:

> Generate a Scandinavian living room render, warm natural light.

The skill reads `~/.decorx/skill.json`, calls the DecorX API, and returns a generated image URL.

For image-to-image, attach an image and describe the change (e.g. "replace the sofa with a leather one").

## Security notes

- Treat the API key like a password. Revoke it immediately in DecorX Settings if leaked.
- Generated image URLs are public (not auth-protected); don't use for private imagery.
- The key is never written into any repo file — only `~/.decorx/skill.json`.
