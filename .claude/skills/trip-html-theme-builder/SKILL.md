---
name: trip-html-theme-builder
description: Reusable HTML rendering rules and a predefined trip-guide template with fully structured sections (hero, strict-field trip summary, transport tables, day-card itinerary, checklists, budget). Defines how an approved daily plan is turned into a standalone HTML travel guide with an identical structure across runs, customized per trip only through theme tokens. Used by html-builder.
---

# Trip HTML Theme Builder

Rendering rules + a predefined template for producing the standalone
`travel-guide.html`. The template is not just headers — every section's inner
structure (field labels, table columns, list/checklist markup, note boxes) is
predefined, so repeated runs produce the same document structure; only content
and a small theme layer vary per trip.

## Assets

- `assets/template.html` — the predefined page. The renderer fills its
  `{{PLACEHOLDER}}` slots; it must NOT restructure the page, reorder sections,
  add/remove sections, or change table columns.

## Rendering rules (non-negotiable)

1. **Self-contained, with one exception**: one file, all CSS inline in
   `<style>`, no external fonts or scripts (emoji are fine). The **sole
   permitted external asset is the hero background image** (`{{HERO_IMAGE}}`) —
   a real destination photo referenced by `https://` URL. Everything else stays
   embedded; no other `<img>`, icon, or asset URL is allowed.
2. **No new travel content**: everything rendered comes verbatim from the
   approved `daily-plan.md` (plus its carried-through citations). The renderer
   reformats; it never adds, drops, or "improves" recommendations.
3. **Citations preserved**: every markdown link in the source becomes a real
   `<a href="...">` anchor — property names, activities, restaurants, and
   transport legs stay linked inside their table cells/list items.
4. **Fixed section order** (baked into the template): hero (general only) →
   trip summary (strict fields + chips) → getting there & around → day-by-day
   itinerary → where you're staying → activity schedule → dining → budget →
   weather → packing checklist → travel tips → footer. The **hero carries only
   the title, emoji, and one general subtitle line, over a trip-related
   background photo** — every trip detail (party, transport, budget, interests,
   dates breakdown) lives in the Trip Summary section, not the header.
5. **Fixed inner markup**: rows/items must follow the exact shapes the
   template documents (see Slot reference) — itinerary days are `.day-card`
   blocks with a `.timeline` list. Two shapes are absolute:
   - **Packing items are ALWAYS checkboxes** —
     `<li><input type="checkbox">item text</li>` — never plain bullets,
     tables, or prose.
   - **Travel tips are ALWAYS a bullet-point list** —
     `<li><strong>Topic:</strong> tip</li>` inside `ul.tips-list` — never a
     table, numbered list, or paragraphs.
6. **Responsive + theme-aware + printable**: the template's CSS already
   handles mobile, `prefers-color-scheme` dark mode, and print — don't remove
   any of it.

## Per-trip customization (theme layer)

Customization is limited to the theme tokens — structure is off limits. The
**header (hero gradient) and the page background must both be styled in the
trip's character**: pick one color family that evokes the destination and set
every token below from it, in **both** the light and dark `:root` blocks.

| Token / slot | What to set it to |
|---|---|
| `--accent`, `--accent-dark` | The trip's color family (header gradient runs `--accent` → `--accent-dark`), e.g. terracotta for Tuscany, Atlantic blue for Lisbon, alpine green for Switzerland |
| `--accent-light` | Pale tint of the accent (light mode) / dark tint (dark mode) — used for table headers, day cards |
| `--bg`, `--card-bg` | Page and card backgrounds as very light (light mode) / very dark (dark mode) tints of the same family, so the whole page carries the trip's mood — never leave them at the defaults if the accent changed |
| `{{HERO_EMOJI}}` | One emoji capturing the trip (🏖️ 🏔️ 🚗 🚆 ✈️ ...) |
| `{{TRANSPORT_MODE_EMOJI}}` | ✈️ / 🚆 / 🚗 matching the confirmed mode |
| `{{HERO_IMAGE}}` | The hero background photo as a CSS value — `url("https://…")` for a real destination image, or `none` to fall back to the plain accent gradient |

**Hero background image.** The header shows a trip-related photo behind the
title, with a semi-transparent accent overlay layered on top so the title,
subtitle, and emoji stay legible and the trip's color family still reads. The
URL is **not chosen by the renderer** — it is sourced and verified upstream and
carried into `daily-plan.md` as a `## Hero Image` line. Fill `{{HERO_IMAGE}}`
from that line:

- If the line carries an image URL → `url("<that URL>")`, used **verbatim**.
- If the line is `none` (or absent) → `none` (the header then renders exactly
  like the classic gradient hero — a safe, valid fallback).
- Never invent, substitute, or search for a different image — the renderer has
  no web access and the upstream URL was already fetch-verified.
- The URL is the **only** external asset allowed in the file (see rule 1).

Keep text/border/ink tokens readable against the chosen backgrounds and keep
adequate contrast in both modes.

**Do not hand-edit the derived tokens** (`--accent-ink`, `--nav-bg`,
`--hairline`, `--ring`) — they are computed from `--accent`/`--card-bg` via
`color-mix()` and update automatically when you set the accent family. The one
exception already baked into the template is `--accent-ink` in the dark
`:root` (dark text for legibility on the lighter dark-mode accent); leave it.

**Structural elements that are NOT slots** — do not add, remove, or reorder
them: the sticky section nav (`nav.toc`) and its anchor links, the hero block
(which sits *before* `.wrap`), and the page background gradient. The `.toc`
links mirror the section list; if the fixed section set ever changes, its
links must be updated to match — but the builder never changes that set.

## Slot reference (`assets/template.html`)

### Hero (general only — no detail chips)
| Slot | Filled with |
|---|---|
| `{{HERO_IMAGE}}` | hero background photo as a CSS value: `url("https://…")` (real destination image) or `none` (gradient fallback). Set inline on `<header class="hero" style="--hero-image: …">` — see **Hero background image** above |
| `{{HERO_EMOJI}}` | one emoji capturing the trip, shown above the title |
| `{{TRIP_TITLE}}` | trip title from the daily plan's `#` heading (also used in `<title>` and footer) |
| `{{TRIP_SUBTITLE}}` | ONE general one-line subtitle — e.g. "Tuscany, Italy · 4–5 July 2026". Keep it general; put breakdowns in Trip Summary |

### Trip Summary — chips + strict fields (every field must be filled; no field may be dropped)
The chip row (moved out of the hero) sits at the top of this section:
| Slot | Filled with |
|---|---|
| `{{PARTY}}` | short party chip text, e.g. "2 adults + 2 kids (5 & 8)" |
| `{{TRANSPORT_MODE}}` | "Flight" / "Train" / "Car" (chip) |
| `{{INTEREST_CHIPS}}` | zero or more `<span class="chip">…</span>` for interests (🏛️ Museums, 🌳 Parks, …) |
| `{{BUDGET_TOTAL}}` | estimated total (hero-removed; used in the `chip total`, summary, and budget section) |
| `{{DESTINATION}}` | destination(s) + trip shape in one line |
| `{{DATES_DETAIL}}` | exact dates incl. weekdays |
| `{{PARTY_DETAIL}}` | traveler count + ages |
| `{{TRANSPORT_MODE_DETAIL}}` | confirmed mode + one-line description |
| `{{BUDGET_LIMIT}}`, `{{BUDGET_STATUS}}` | user's limit; "UNDER by X" / "OVER by X" |
| `{{INTERESTS_DETAIL}}` | interests and how the plan covers them |
| `{{VALIDATION_SUMMARY}}` | gates passed (e.g. "All 7 quality gates (QG1–QG7) PASS") + any caveat worth surfacing |

### Sections
| Slot | Filled with |
|---|---|
| `{{TRANSPORT_LEGS_CAPTION}}` | one-line caption over the legs table (why these legs) |
| `{{TRANSPORT_LEG_ROWS}}` | `<tr>` rows matching the predefined columns (Leg, Detail, Day/Date, Duration, Est. Cost); links inside cells |
| `{{LOCAL_TRANSPORT_ITEMS}}` | `<li>` items per stop, linked |
| `{{TRANSPORT_TOTAL}}` | transport subtotal |
| `{{TRANSPORT_WARNINGS}}` | zero or more `<div class="warn-box">…</div>` (e.g. "reconfirm fares before booking"); empty string if none |
| `{{DAY_CARDS}}` | one `.day-card` per day, exactly the structure documented in the template comment (h3 + `.timeline` of `<li><span class="time">…</span><span>…</span></li>`) |
| `{{ITINERARY_NOTES}}` | zero or more `.note-box` divs (e.g. optional upgrades); empty string if none |
| `{{ACCOMMODATION_ROWS}}` | `<tr>` rows (Stop, Property linked, Stars, Key Features, Cost/night × Nights, Subtotal) |
| `{{ACCOMMODATION_TOTAL}}`, `{{ACCOMMODATION_NOTES}}` | total; optional note/assumption boxes |
| `{{ACTIVITY_ROWS}}` | `<tr>` rows (Day, Activity linked, Type, Duration, Suitability, Cost) |
| `{{ACTIVITIES_TOTAL}}`, `{{ACTIVITY_NOTES}}` | total; optional notes |
| `{{RESTAURANT_ROWS}}` | `<tr>` rows (Stop, Restaurant linked, Cuisine, Price Range, Dietary Fit) |
| `{{LOCAL_FOOD_ITEMS}}` | local specialties text/list, linked |
| `{{FOOD_TOTAL}}` | food subtotal |
| `{{BUDGET_ROWS}}` | `<tr>` rows (Category, Notes, Cost); use `class="total-row"` for subtotal rows |
| `{{BUDGET_AGAINST_LIMIT}}` | verdict text vs the user's limit |
| `{{WEATHER_OUTLOOK}}` | one-paragraph weather summary (Weather section, from the daily plan/packing artifact) |
| `{{WEATHER_ROWS}}` | `<tr>` rows for the forecast table (Day/Date, Conditions, High / Low, Precip. chance); one per trip day |
| `{{WEATHER_NOTES}}` | zero or more `.note-box`/`.warn-box` divs (e.g. heat/rain advisory); empty string if none |
| `{{PACKING_*_ITEMS}}` (CLOTHING / ELECTRONICS / DOCUMENTS / MEDICINES / DESTINATION) | `<li><input type="checkbox">item</li>` items per fixed category |
| `{{TIP_ITEMS}}` | `<li><strong>Topic:</strong> tip</li>` items |
| `{{APPROVAL_DATE}}`, `{{RUN_SLUG}}` | from the approved daily plan's frontmatter (`approvalNotes`/date) / the run directory name |

Optional slots (`{{TRANSPORT_WARNINGS}}`, `{{ITINERARY_NOTES}}`,
`{{ACCOMMODATION_NOTES}}`, `{{ACTIVITY_NOTES}}`, `{{WEATHER_NOTES}}`) are
replaced with an empty string when there is nothing to say — never left as
literal `{{...}}`.

Note: weather now has its **own section** (between budget and packing); the
packing section no longer carries a weather line — its slots are only the five
`{{PACKING_*_ITEMS}}` checklists.

## Procedure

1. Read `assets/template.html` (path: `.claude/skills/trip-html-theme-builder/assets/template.html`).
2. Read the approved `daily-plan.md` (latest approved version).
3. Choose the theme tokens for this trip (accent color family in both light
   and dark `:root` blocks, hero + transport emoji) and the hero background
   image: set `{{HERO_IMAGE}}` to a real `url("https://…")` destination photo,
   or `none` if no reliable image URL is available.
4. Convert each daily-plan section into the slot markup above, preserving all
   links.
5. Replace every `{{...}}` slot; confirm **no `{{` remains** in the output.
6. Write the result as `travel-guide.html` in the run directory.
