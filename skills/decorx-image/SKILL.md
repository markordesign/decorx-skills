---
name: decorx-image
description: Generate AI interior design images via the DecorX API (text-to-image and image-to-image). Use when the user asks to generate, render, redesign, or reimagine interior/room images through DecorX.
---

# DecorX Image Generation

Generate interior design images via the DecorX API.

## Prerequisites

- A DecorX API key (starts with `dxk_`). Get one from DecorX → Settings → API Keys → Create Key.

## Authentication & base URL

- Every request MUST include header `X-API-Key: <your key>`.
- Base URL defaults to `https://pretest.houseofmarkor.com`. Override it ONLY if you use a different (prod/private) DecorX server.
- Store your api key in `~/.decorx/skill.json`:
  ```json
  { "api_key": "dxk_..." }
  ```
  Only `api_key` is required. Optionally add `"base_url": "https://..."` to override the default base URL.
  - `~` is your home directory: `~/.decorx/` on macOS/Linux, `C:\Users\<you>\.decorx\` on Windows. The installer creates this file for you on first install.
- Read this file at the start of a session. NEVER echo the key back to the user, write it into repo files, or paste it into shared chat logs.
- If a user shares a key in chat, advise them to revoke it in DecorX Settings and regenerate.

## How to call the API (IMPORTANT — read before acting)

- Call the endpoints directly with a **single HTTP request** (e.g. one `curl` command, or one inline `node -e` fetch). Do NOT write a script file, do NOT create `.js`/`.py`/`.mjs` files, do NOT install any npm package, do NOT set up a project. One command, get the JSON response, move on.
- Load the key from `~/.decorx/skill.json` into a shell variable for the request, so the key never appears in command text or logs. Example pattern:
  ```bash
  KEY=$(node -e "console.log(require(require('os').homedir()+'/.decorx/skill.json').api_key)")
  curl -s -X POST "$BASE/decorx/open/image/generate" -H "X-API-Key: $KEY" -H "Content-Type: application/json" -d '{"prompt":"..."}'
  ```
  (Use the `BASE` from skill.json's `base_url`, or the default `https://pretest.houseofmarkor.com`.)
- Never `echo`, `print`, or log `$KEY`. Never write the key into any file. If a tool would log command args, redact the key.
- Parse the JSON response from the same command's stdout; don't persist it to a file unless the user asks.
- Polling (endpoint 3) = just re-run the check command after ~5s; again, one command each time, no loop script needed unless several minutes pass.

## Endpoints

### 1. Upload an image (only for local images with no public URL)

`POST {base_url}/decorx/open/image/upload`
- Header: `X-API-Key`
- Body: `multipart/form-data` with `file` (the image), `realname` (filename), `md5` (md5 hex of file bytes)
- Response: `val.refid` — use this as an element of `image_urls` in generate.
- Minimum resolution 256x256.
- Skip this step if the image already has a public URL — pass the URL directly to generate.

### 2. Generate an image

`POST {base_url}/decorx/open/image/generate`
- Header: `X-API-Key`
- Body (JSON):
  - `prompt` (string, required) — design description, e.g. "Scandinavian living room, warm natural light, oak furniture"
  - `image_urls` (string[], optional) — input images. Each element can be a **public image URL** (`http://`/`https://`, used directly by the server) OR a `refid` from upload. Omit or empty for text-to-image.
  - `num_images` (int, optional, default 1) — NOTE: only the first image is returned.
  - `aspect_ratio` (string, optional) — output aspect ratio. Defaults: `4:3` for image-to-image (the endpoint fuses furniture/material references into a room scene, so a room ratio is the default), `1:1` for text-to-image. Supported: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`, `match_input_image` (only pass `match_input_image` when the input itself is already a room and you want the output to match its ratio).
  - `resolution` (string, optional, server default `2K`) — output resolution: MUST be uppercase `1K`, `2K`, or `4K` (lowercase like `1k` will be rejected). Honoured by the primary model; if the server falls back to the alternate model, output is ~1K and the prediction is flagged `using_non_optimal_model: true`.
- Response `val.status`:
  - `succeeded` → use `val.image_url` (public URL of the generated jpg)
  - `pending` → `val.taskid`; wait ~5s and call endpoint 3, repeat up to ~120s
  - error → read `errmsg`

### 3. Check a pending task

`POST {base_url}/decorx/open/image/check`
- Header: `X-API-Key`
- Body (JSON): `taskid`
- Response shape same as generate.

## Workflow

1. If `~/.decorx/skill.json` is missing or has no `api_key`: ask the user to create a key in DecorX Settings → API Keys and save it to that file. Do NOT proceed without a key.
2. Read `api_key` from `~/.decorx/skill.json`. Use `base_url` from the file if present, otherwise the default `https://pretest.houseofmarkor.com`.
3. Text-to-image: call generate with just `prompt`.
4. Image-to-image: pass input images via `image_urls` — either public image URLs (`http`/`https`, preferred when available) OR refids from the upload endpoint (only for local images with no public URL). Add a `prompt` describing the change.
5. If generate returns `pending`, wait ~5s, call check with the `taskid`; repeat until `succeeded` or error (max ~120s).
6. Return `image_url` to the user. It is a public URL; the user can open it directly.

## Limitations

- Only the FIRST generated image is returned even if `num_images > 1`.
- Generation is synchronous with a ~2 min timeout; long runs return a `taskid` to poll.
- Output images are `.jpg`.
- `image_url` is publicly accessible (no auth) — anyone with the URL can view it. Do not use for private content.
- Currently free; credit consumption may be enabled later.

## Security

- NEVER print the raw api key in responses, logs, or commits.
- NEVER write the key into any repo file (only `~/.decorx/skill.json`, which is outside repos).
- The key grants image-generation access on the owner's account — treat it like a password.
