# decorx-tool capability roadmap

How the backend's internal capabilities (see `decorx.server/src/services/replicate/api.<date>.md`) get exposed to the `decorx-tool` skill, in batches.

**Audience**: external ecosystem users (designers / e-commerce / content creators) invoking capabilities from inside an AI agent (Claude Code, Codex, OpenCode, Cursor).

Every capability follows the public API pattern in [`CLAUDE.md`](../CLAUDE.md#public-api-pattern-the-template-every-new-capability-copies): `X-API-Key`, `/decorx/open/*`, submit → `val.status` (`succeeded` | `pending`+`taskid`) → `/check` poll → public image URL. **Image generation is already live as the reference implementation.** Each row below = one backend wrapper + one `### capability` section in `SKILL.md`.

## Guiding principles

- **Simplify, don't expose everything.** External users in an agent never see raw Portal params. Expose only inputs a user would actually mention in conversation (an image, a prompt, an aspect ratio). Portal-only params (clip flags, detection thresholds, internal model selectors) get sensible defaults.
- **Simplest contract first.** Ship the minimal case to validate the pipeline end-to-end, then add the ones that need backend extra work (auto-masking), then heavier/structured outputs.
- **Skip what an agent can't drive.** GUI pipelines (clicks/drags), enterprise batch/CSV, and SSE streaming stay internal. (A mask requirement is NOT a blocker — the wrapper can auto-generate it via segmentation.)

---

## Batch 1

Image generation is already live and is the template/reference for the public-API pattern. This batch fills out the core editing set: room cleaning (next-simplest contract), then erase/replace (which add backend auto-masking).

| Capability | Portal source | Public path | Exposed inputs | Status |
|---|---|---|---|---|
| Image generation (text-to-image / image-to-image) | already wrapped | `/decorx/open/image/generate` (+ `/upload`, `/check`) | `prompt`, `image_urls?`, `aspect_ratio?`, `resolution?` | ✅ **live — reference** |
| Room cleaning (empty a room) | `/room-cleaning` | `/decorx/open/image/room-cleaning` | `image_url` | 📋 next — simplest remaining contract |
| Erase regions | `/edit/erase` | `/decorx/open/image/erase` | `image_url`, `target` (text) | 📋 backend auto-masks via segmentation |
| Replace regions | `/edit/replace` | `/decorx/open/image/replace` | `image_url`, `target`, `replace_prompt` | 📋 backend auto-masks via segmentation |

> **Note on erase/replace**: the Portal endpoints require a binary mask, which an agent can't produce precisely. The backend wrapper closes that gap — the user gives a text `target` ("the sofa"), the wrapper runs segmentation (Grounding DINO / SAM2, already in the Portal) to build the mask internally, then calls erase/replace. Watch mask-precision risk (over/under-erase); may need a user-confirm step or an inpainting cleanup pass on edges.

## Batch 2 — rest of image editing + product content

Copy Batch 1's pattern. Two groups: single-image editing, and text/detail generation (e-commerce listing workflows).

| Capability | Portal source | Public path (proposed) | Exposed inputs |
|---|---|---|---|
| Background removal | `/remove-background` | `/decorx/open/image/remove-background` | `image_url` |
| Generate background for furniture | `/generate-background` | `/decorx/open/image/generate-background` | `image_url`, `background_prompt` |
| Reframe / expand / change aspect | `/edit/reframe` | `/decorx/open/image/reframe` | `image_url`, `target_aspect` |
| Upscale | `/edit/upscale` | `/decorx/open/image/upscale` | `image_url`, `target_size` |
| Virtual staging | `/virtual-staging` | `/decorx/open/image/virtual-staging` | `image_url` (transparent furniture), `background_image_url` |
| Attribute tags | `/generate-attributes` | `/decorx/open/image/attributes` | `image_url`, `product_detail` |
| Marketing copy | `/generate-romance-copy` | `/decorx/open/image/romance-copy` | `image_url`, `product_detail`, `guidelines?` |
| Describe image | `/describe-image` | `/decorx/open/image/describe` | `image_url`, `language?` |
| Product close-up render | `/edit/product-close-up-render` | `/decorx/open/image/close-up` | `image_url`, `focus_prompt?` |

## Batch 3 — advanced (structured / compound / heavy)

| Capability | Portal source | Notes |
|---|---|---|
| Furniture recommendation (image search) | `/furniture-recommendation` | returns product list + buy links; highest standalone value |
| Product link → images | `/canvas-v2/product-link/get-image-urls` | turn a product URL into images + metadata |
| Style extraction | `/canvas-v2/style-generation` | returns a style object from inspiration images |
| Image-to-video | `/video/generate` | 60–180s, credit-heavy; expose `image` + `prompt` |
| Conversational product finder | `/canvas-v2/conversational-product-finder` | multi-turn, live web search; heaviest |

## Not exposed to the skill (stay internal)

| Capability | Why |
|---|---|
| fabric-mapper (preprocess / segment-click / render / render-hq) | GUI pipeline — needs user clicks + drag placement (spatial interaction text can't express) |
| layout segment / rerender | needs drag-adjusted bounding boxes (spatial editing) |
| change-leg-finish | only useful chained after fabric-mapper, which isn't exposed |
| generate-attributes / romance-copy **batch** + **async-batch** | enterprise bulk, not single-image chat |
| self-onboarding CSV (upload / detect / preview) | enterprise onboarding flow |
| brand-kit CRUD + blend | cross-endpoint + persistence; revisit when a use case needs it |
| conversational-product-finder/**stream** | SSE; the non-streaming version (Batch 3) covers the skill |

---

## Process for each capability

1. **Backend** (`decorx.server`): add the `/decorx/open/*` wrapper (`X-API-Key`, forwards to the Portal endpoint, async + `/check` poll), matching the `CLAUDE.md` pattern.
2. **Skill** (`decorx-skills`): add `### <capability>` under `## Capabilities` in `SKILL.md`; broaden frontmatter `description`; update this doc's status.
3. **Verify**: install locally + `curl` the new endpoint with a real key end-to-end.

## Status

| Capability | Status |
|---|---|
| Batch 1 — image generation | ✅ live |
| Batch 1 — room cleaning / erase / replace | 📋 planned — start here |
| Batch 2–3 | 📋 planned |
