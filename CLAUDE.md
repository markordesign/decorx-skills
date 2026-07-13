# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## What this repo is

A skill-distribution npm package (`decorx-skills`), not an application. Users run `npx decorx-skills install` to copy the **`decorx-tool` skill** into their AI agent's skill directory. **No build step, no test suite, no linter** — `package.json` has no `scripts`. The published artifact is the raw source (only `bin/` and `skills/` are bundled via the `files` field). Node >= 18, ESM.

## Commands

- **Test the installer locally** (no npm publish needed): `node bin/cli.js install` — auto-detects installed agents, copies `skills/decorx-tool/` into each one's skill dir, creates `~/.decorx/skill.json` if absent.
- Target a specific agent: `node bin/cli.js install --claude` (also `--codex`, `--opencode`, `--cursor`, or `--all`).
- Uninstall: `node bin/cli.js uninstall` (also `--<agent>`, `--all`; same target resolution as install). Leaves `~/.decorx/skill.json` in place.
- Print usage: `node bin/cli.js`.
- End-user entrypoint after publish: `npx decorx-skills install` (or `npx decorx-skills uninstall`).

## Architecture

Two parts:

1. **Installer** (`bin/cli.js`) — single-file CLI. The `TARGETS` map lists supported agents, each with a skill dir and a detection marker:
   - Claude Code → `~/.claude/skills/` (detect `~/.claude`)
   - Codex → `~/.agents/skills/` (detect `~/.codex`)
   - OpenCode → `~/.config/opencode/skills/` (detect `~/.config/opencode`)
   - Cursor → `~/.cursor/skills/` (detect `~/.cursor`)

   No flags → install to every detected agent; `--<agent>` → one; `--all` → force all. It copies `skills/decorx-tool/` into each target's skill dir, removes the legacy `decorx-image` folder if present, and seeds `~/.decorx/skill.json`. Paths use `os.homedir()`. **Adding another agent = one line in `TARGETS`** (all four share the open `SKILL.md` standard).

2. **Skill definition** (`skills/decorx-tool/`) — `decorx-tool` is a **single, multi-capability skill** (NOT a collection of skills). `SKILL.md` has YAML frontmatter (`name: decorx-tool`, `description`) and a body structured as: shared sections (prereqs, auth, how-to-call, security) + a `## Capabilities` section with one `### <capability>` subsection per feature. **Adding a capability = adding a `###` subsection under Capabilities** — no installer change. The body IS the runtime logic: when invoked, the agent reads it and follows the instructions verbatim, so the API contract / auth / security rules must be precise.

### Config & secrets

API keys live in `~/.decorx/skill.json` (outside any repo) as `{ api_key, base_url? }`. **Never** write keys into repo files, commits, logs, or command text. `SKILL.md` tells the runtime agent to load the key into a shell variable and never echo it. Generated image URLs are public/unauthenticated — do not route private imagery through this skill.

## How skill capabilities relate to the backend (IMPORTANT)

`decorx-tool` calls DecorX's **public, apikey-protected API**: base `~/.decorx/skill.json` `base_url` (default `https://pretest.houseofmarkor.com`), header `X-API-Key: dxk_...`, paths under `/decorx/open/...` (e.g. `/decorx/open/image/generate`). Today the only public capability is image generation.

The backend project (`../decorx.server`) has a much larger internal AI capability set — see `decorx.server/src/services/replicate/api.<date>.md`. **That doc is an internal capability list, NOT a public API.** Those endpoints (Bearer auth, internal IP, no apikey) are backend-internal; the skill **cannot call them directly**.

To expose a new capability to the skill, **the backend must first wrap it as a public `/decorx/open/<capability>/...` endpoint with `X-API-Key` auth**, mirroring the image-generation pattern (submit → `succeeded` or `pending`+`taskid` → `/decorx/open/<capability>/check` poll). Only then does the skill get a matching `### <capability>` section in `SKILL.md`.

So adding a skill capability is **two coupled steps**:

1. **Backend** (`decorx.server`) — add the `/decorx/open/*` public wrapper: apikey auth, request/response schema, async + polling.
2. **Skill** (`decorx-skills`) — add the `### <capability>` section in `SKILL.md` + broaden the frontmatter `description` to cover the new trigger.

### Public API pattern (the template every new capability copies)

Every `/decorx/open/*` capability exposed to the skill follows the same contract — this is the image-generation "葫芦" to copy (image generation is already live as the reference):

- **Auth**: `X-API-Key: dxk_...` header (key from `~/.decorx/skill.json`). No Bearer, no internal IPs.
- **Submit**: `POST /decorx/open/<category>/<action>`, JSON body. Response wraps everything in `val`:
  - `val.status === "succeeded"` → result ready (e.g. `val.image_url`, a public URL)
  - `val.status === "pending"` → `val.taskid`; poll the check endpoint
  - error → read `errmsg`
- **Poll**: `POST /decorx/open/<category>/check` with `{ taskid }` → same response shape, until `succeeded` or error (~120s max).
- **Local-file inputs**: if the user has a local image (no public URL), first `POST /decorx/open/image/upload` (multipart) → `val.refid`; pass the refid where a URL is expected.
- **Outputs**: public, unauthenticated image URLs. Never route private imagery.
- **Credit cost (mirror image generation)**: each capability handler declares a `const OpenApiXxxCreditCost = 0` switch. `0` = free (no quota/subscription check); `>0` = deduct N credits per successful submit via `PlanService.ConsumeUserCredits(userid, cost, action, "<Action>", "Open<Source>")` — deducts only on successful submit; insufficient quota / expired subscription / submit failure deduct nothing. Flip the constant and redeploy to enable charging.

Match this shape exactly for every new capability so the skill's "How to call the API" section stays uniform. How the backend forwards to the Portal API internally is `decorx.server`'s concern, not recorded here. See `docs/capability-roadmap.md` for which capabilities ship in which batch.

### Result-oriented: edit both repos

This project is **result-oriented** — shipping a usable capability end-to-end matters more than respecting a repo boundary. **If a capability needs a backend wrapper, implement it in `../decorx.server` yourself**, then add the skill section. Treat `decorx.server` as a sibling working directory you can modify to unblock the skill. A backend endpoint without a skill section (or vice versa) is an incomplete change — keep the two in sync.
