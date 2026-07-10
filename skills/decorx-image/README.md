# DecorX Image Skill (Claude Code)

Generate AI interior design images from Claude Code via the DecorX API (text-to-image and image-to-image).

## Install

```bash
npx decorx-skills install image
```

This copies the skill into `~/.claude/skills/decorx-image/`.

> Local dev without npm publish: `node bin/cli.js install image` from this repo.

## Get an API key

1. Open DecorX → **Settings** → **API Keys** → **Create Key**.
2. Copy the `dxk_...` key immediately — it is shown only once.

## Configure

Create `~/.decorx/skill.json`:

```json
{ "api_key": "dxk_...", "base_url": "https://your-decorx-server" }
```

- `base_url`: the DecorX server address you log into.
- This file lives outside any git repo. Do not commit or share it.

## Use

In Claude Code, ask something like:

> Generate a Scandinavian living room render, warm natural light.

The skill reads `~/.decorx/skill.json`, calls the DecorX API, and returns a generated image URL.

For image-to-image, attach an image and describe the change (e.g. "replace the sofa with a leather one").

## Security notes

- Treat the API key like a password. Revoke it immediately in DecorX Settings if leaked.
- Generated image URLs are public (not auth-protected); don't use for private imagery.
- The key is never written into any repo file — only `~/.decorx/skill.json`.
