# decorx-skills

Installer for the **decorx-tool** skill — DecorX's AI design capabilities for any SKILL.md-compatible agent: **Claude Code, Codex, OpenCode, Cursor**, and more.

`decorx-tool` is a single, growing skill that bundles DecorX's capabilities. Today it covers **image generation** (text-to-image & image-to-image), **room cleaning** (empty a furnished room), and **region erase/replace** (remove or swap a named object in a photo); more capabilities will be added to the same skill over time — you install once, and it grows with DecorX.

## Quick start

```bash
# via GitHub (no npm account needed) — auto-detects installed agents
npx --yes github:markordesign/decorx-skills install

# If the installation fails
git clone https://github.com/markordesign/decorx-skills
cd decorx-skills
node bin/cli.js install

# or, once published to npm:
npx decorx-skills install
```

Auto-detect installs into every agent it finds on your machine. To target one explicitly:

```bash
npx decorx-skills install --claude     # Claude Code
npx decorx-skills install --codex      # Codex
npx decorx-skills install --opencode   # OpenCode
npx decorx-skills install --cursor     # Cursor
npx decorx-skills install --all        # all of the above
```

This installs the `decorx-tool` skill and creates a config template at `~/.decorx/skill.json`.

> Replace `markordesign/decorx-skills` with your actual GitHub `owner/repo` if different.

## Uninstall

```bash
npx --yes github:markordesign/decorx-skills uninstall
# or
node bin/cli.js uninstall


npx decorx-skills uninstall            # remove from all detected agents
npx decorx-skills uninstall --claude   # or target one: --codex / --opencode / --cursor / --all
```

This removes the `decorx-tool` skill folder from each agent's skill directory. It leaves `~/.decorx/skill.json` (your API key) untouched — delete that file manually if you no longer need it.

## Supported agents

The skill uses the open `SKILL.md` standard, so one skill works everywhere. Each agent has its own skill directory:

| Agent | Skill directory |
|---|---|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.agents/skills/` |
| OpenCode | `~/.config/opencode/skills/` |
| Cursor | `~/.cursor/skills/` (also auto-reads `~/.claude` & `~/.agents`) |

All four support natural-language auto-triggering from the skill's `description` — no manual slash command needed.

## 1. Get an API key

Open DecorX → **Settings** → **API Keys** → **Create Key**. Copy the `dxk_...` key immediately — it's shown only once.

## 2. Configure

The installer already created `~/.decorx/skill.json`. Edit it and paste your key:

```json
{
  "api_key": "dxk_..."
}
```

- `~` is your home directory: `~/.decorx/` on macOS/Linux, `C:\Users\<you>\.decorx\` on Windows.
- Optionally add `"base_url": "https://..."` to point at a different DecorX server. Defaults to `https://pretest.houseofmarkor.com`.

## 3. Use

In your agent, just describe what you want:

> Generate a Scandinavian living room render, warm natural light, oak furniture.

The skill reads your config, calls the DecorX API, and returns a generated image URL.

**Image-to-image** — attach or reference an image and describe the change:

> Take this room and swap the sofa for a tan leather one.

Local images without a public URL are uploaded automatically; you can also pass a public image URL directly.

**Options** you can mention in the prompt:

| Option | Values | Default |
|---|---|---|
| `aspect_ratio` | `1:1`, `4:3`, `16:9`, `9:16`, `2:3`, `3:2`, `3:4`, `4:5`, `5:4`, `21:9`, `match_input_image` | `4:3` (image-to-image), `1:1` (text-to-image) |
| `resolution` | `1K`, `2K`, `4K` (uppercase) | `2K` |

## Capabilities

`decorx-tool` bundles multiple DecorX capabilities in one skill:

| Capability | What it does |
|---|---|
| Image generation | text-to-image & image-to-image interior renders |
| Room cleaning | empty a furnished room into a bare room |
| Erase regions | remove a named object from a photo (e.g. "erase the sofa") |
| Replace regions | swap a named object for something else (e.g. "replace the lamp with a plant") |

All capabilities return a public image URL. More will be added over time — you install once and the skill grows with DecorX.

## Requirements

- Node.js ≥ 18
- A DecorX account + API key
- At least one supported agent installed

## Security

- Treat the API key like a password — it generates images on your account (currently free; credit consumption may come later).
- The key lives only in `~/.decorx/skill.json`, **outside** any git repo. Never commit or paste it into chat logs.
- Generated image URLs are public (not auth-protected) — don't use for private imagery.
- If a key leaks, revoke it immediately in DecorX → **Settings** → **API Keys** and create a new one.

## Local development

```bash
git clone https://github.com/markordesign/decorx-skills
cd decorx-skills
node bin/cli.js install   # install from this checkout (auto-detects agents)
```

- The skill lives in `skills/decorx-tool/SKILL.md` — add a new capability as a new section there.
- The installer is `bin/cli.js` — supported agents are listed in the `TARGETS` map; add another (e.g. Windsurf, Gemini CLI) by adding one line.

## License

MIT © DecorX
