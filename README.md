# decorx-skills

DecorX Skills for AI agents. Generate AI interior design images from Claude Code (and other agents) via the DecorX API.

## Install a skill

```bash
npx decorx-skills install image
```

Installs the `decorx-image` skill into `~/.claude/skills/decorx-image/` and creates a config template at `~/.decorx/skill.json` (`~` = your home directory).

## Configure

1. Get an API key: DecorX → **Settings** → **API Keys** → **Create Key**. Copy it (shown only once).
2. Edit `~/.decorx/skill.json` and paste your key:
   ```json
   { "api_key": "dxk_..." }
   ```
   Optionally add `"base_url": "https://..."` to point at a different DecorX server.

## Use

In Claude Code, ask something like:

> Generate a Scandinavian living room render, warm natural light.

The skill calls the DecorX API and returns a generated image. Supports text-to-image, image-to-image (public image URLs or uploads), with `aspect_ratio` (`1:1` / `16:9` / ...) and `resolution` (`1k` / `2k` / `4k`) options.

## Available skills

- `image` — AI interior design image generation

## Requirements

- Node.js >= 18
- A DecorX account + API key
