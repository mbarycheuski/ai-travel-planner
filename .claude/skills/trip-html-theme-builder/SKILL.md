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

1. **Fully self-contained**: one file, all CSS inline in `<style>`, no
   external fonts, scripts, or asset URLs (emoji are fine). The header photo
   (`{{HERO_IMAGE}}`) and the page background photo (`{{BG_IMAGE}}`) are both
   real, trip-related photos found via web search, downloaded, and embedded as
   base64 `data:` URIs — the *finished HTML* never contains a live `https://`
   image reference, `<img>` tag, or other external asset link; the source URL
   is only used at build time to fetch the bytes, which are then inlined.
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
   the title, emoji, and one general subtitle line, over an AI-generated,
   trip-related header photo** — every trip detail (party, transport, budget,
   interests, dates breakdown) lives in the Trip Summary section, not the
   header. The page itself sits over a second, subtler AI-generated background
   photo in the same trip's mood.
5. **Fixed inner markup**: rows/items must follow the exact shapes the
   template documents (see Slot reference) — itinerary days are `.day-card`
   blocks with a `.timeline` list. Two shapes are absolute:
   - **Packing items are ALWAYS checkboxes wrapped in a label** —
     `<li><label><input type="checkbox"> item text</label></li>` — never
     plain bullets, tables, prose, or a bare unwrapped checkbox (the label
     wrap makes the whole row tappable, not just the tiny box).
   - **Travel tips are ALWAYS a bullet-point list** —
     `<li><strong>Topic:</strong> tip</li>` inside `ul.tips-list` — never a
     table, numbered list, or paragraphs.
6. **Responsive + theme-aware + printable**: the template's CSS already
   handles mobile, `prefers-color-scheme` dark mode, and print — don't remove
   any of it.
7. **Green (`--ok`/`note-box`) is an earned verdict, never a default for
   "this is a total" or "this is a fact".** Plain sums (`tr.total-row`, the
   budget headline chip, "subtotal used in budget" lines, "local food to
   try") are neutral/`info-box`/accent-styled. Red (`--warn`/`warn-box`) is
   for an actual risk. The only genuinely earned green in the whole page is
   the budget-vs-limit verdict (`{{BUDGET_STATUS_BOX_CLASS}}` /
   `{{BUDGET_GAUGE_FILL_CLASS}}`), which is conditional on the real
   under/over comparison — never hardcode `note-box` there.

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
| `{{TRANSPORT_MODE_EMOJI}}` | ✈️ / 🚆 / 🚗 matching the confirmed mode |
| `{{HERO_IMAGE}}` | The header photo as a CSS value — `url("data:image/png;base64,…")` (or the matching `image/jpeg` mime) for the found destination photo, or `none` to fall back to the plain accent gradient |
| `{{BG_IMAGE}}` | The page background photo as a CSS value — `url("data:image/png;base64,…")` for the found background photo, or `none` to fall back to the plain page background |

**Hero & background images.** The header shows a real, trip-related photo
behind the title, with a semi-transparent accent overlay layered on top so
the title, subtitle, and emoji stay legible and the trip's color family still
reads. A second, subtler photo sits behind the page itself. The renderer
**finds both photos itself** at build time via web search, downloads them,
and embeds them:

- Run a distinct, destination-specific `WebSearch` for each (from the trip's
  destination in the daily plan): the header search should target an iconic,
  landscape establishing shot of the destination (e.g. `"<destination> skyline
  landscape wide"`); the background search should target something subtler and
  lower-contrast — a texture/pattern or softly blurred scene from the same
  place, unobtrusive behind page content (e.g. `"<destination> texture pattern
  blurred bokeh"`).
- Prefer stable, freely-licensed, directly-linkable image sources —
  **Wikimedia Commons** (`upload.wikimedia.org`) is the first choice, since its
  URLs point straight at the raw file and its images are safe to reuse.
  Avoid search-result thumbnail/proxy URLs that require a live session.
- Find images **one at a time, sequentially** — resolve and download the hero
  photo fully before starting the background search — so each result (or
  failure) is known before moving on.
- Download the chosen URL into the run directory (e.g. `curl -sL "<url>" -o
  hero-image.jpg`; add `--ssl-no-revoke` if `curl` fails with a schannel/cert
  revocation error — common on Windows sandboxes with no path to the CA's
  OCSP/CRL endpoint) and confirm the file is actually an image (non-trivial
  size, recognizable image `file` type) before using it.
- base64-encode the downloaded file (e.g. `base64 -w0 "<path>"`) and set its
  slot to `url("data:image/<jpeg|png>;base64,<encoded data>")` matching the
  actual downloaded file type.
- If a search returns no usable/licensable image, or the download fails or
  isn't a valid image, try one alternate query; if that also fails, set that
  slot to `none` (that layer then renders exactly like the classic gradient
  fallback — a safe, valid result). A missing image never blocks the build.
- These embedded data URIs are not "external assets" — the *output HTML* never
  references an outside URL (see rule 1); only the build step fetches one.

Keep text/border/ink tokens readable against the chosen backgrounds and keep
adequate contrast in both modes.

**Do not hand-edit the derived tokens** (`--accent-ink`, `--nav-bg`,
`--hairline`, `--ring`) — they are computed from `--accent`/`--card-bg` via
`color-mix()` and update automatically when you set the accent family. The one
exception already baked into the template is `--accent-ink` in the dark
`:root` (dark text for legibility on the lighter dark-mode accent); leave it.

**Structural elements that are NOT slots** — do not add, remove, or reorder
them: the sticky section nav (`nav.toc`) and its anchor links, the hero block
(which sits *before* `.wrap`), and the page background gradient layering. The
`.toc` links mirror the section list; if the fixed section set ever changes,
its links must be updated to match — but the builder never changes that set.

## Slot reference (`assets/template.html`)

### Hero (general only — no detail chips)
| Slot | Filled with |
|---|---|
| `{{HERO_IMAGE}}` | header photo as a CSS value: `url("data:image/<jpeg|png>;base64,…")` (found destination photo) or `none` (gradient fallback). Set inline on `<header class="hero" style="--hero-image: …">` — see **Hero & background images** above |
| `{{BG_IMAGE}}` | page background photo as a CSS value: `url("data:image/<jpeg|png>;base64,…")` (found destination photo) or `none` (plain background fallback). Set inline on `<body style="--bg-image: …">` — see **Hero & background images** above |
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
| `{{INTERESTS_LIST}}` | `<li>` items, one per interest, describing how the plan covers it |

### Sections
| Slot | Filled with |
|---|---|
| `{{TRANSPORT_LEGS_CAPTION}}` | one-line caption over the legs table (why these legs) |
| `{{TRANSPORT_LEG_ROWS}}` | `<tr>` rows matching the predefined columns (Leg, Detail, Day/Date, Duration, Est. Cost); links inside cells |
| `{{LOCAL_TRANSPORT_ITEMS}}` | `<li>` items per stop, linked |
| `{{TRANSPORT_TOTAL}}` | transport subtotal |
| `{{TRANSPORT_WARNINGS}}` | zero or more note divs; empty string if none. Use `warn-box` for a real risk (e.g. "reconfirm fares before booking"), `info-box` for a neutral FYI that isn't a risk (e.g. "this leg requires a seat reservation") — don't force every note into `warn-box` |
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
| `{{BUDGET_STATUS_BOX_CLASS}}` | `note-box` (green) when spent ≤ limit, `warn-box` (red) when spent > limit — this is the one place green is an earned verdict, not an assumed default |
| `{{BUDGET_GAUGE_PERCENT}}` | spent ÷ limit as a whole-number percentage, **capped at 100** even when over budget (the bar never overflows its track) — pure arithmetic on numbers already in `{{BUDGET_TOTAL}}`/`{{BUDGET_LIMIT}}`, not new content |
| `{{BUDGET_GAUGE_FILL_CLASS}}` | `over` when spent > limit, otherwise empty string (defaults to the ok color) — same verdict as `{{BUDGET_STATUS_BOX_CLASS}}`, kept in sync |
| `{{WEATHER_OUTLOOK}}` | one-paragraph weather summary (Weather section, from the daily plan/packing artifact) |
| `{{WEATHER_ROWS}}` | `<tr>` rows for the forecast table (Day/Date, Conditions, High / Low, Precip. chance); one per trip day. Conditions cell starts with one matching emoji (☀️/⛅/☁️/🌧️/⛈️/❄️/🌫️) before the text |
| `{{WEATHER_NOTES}}` | zero or more `.note-box`/`.warn-box`/`.info-box` divs (e.g. heat/rain advisory = warn-box; a neutral seasonal note = info-box); empty string if none |
| `{{PACKING_*_ITEMS}}` (CLOTHING / ELECTRONICS / DOCUMENTS / MEDICINES / DESTINATION) | `<li><label><input type="checkbox"> item</label></li>` items per fixed category |
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
   and dark `:root` blocks, hero + transport emoji). Find the header and
   background photos via web search, download, and base64-encode each (see
   **Hero & background images**), and set `{{HERO_IMAGE}}` / `{{BG_IMAGE}}` to
   `url("data:image/<jpeg|png>;base64,…")`, or `none` where no usable image
   was found.
4. Convert each daily-plan section into the slot markup above, preserving all
   links.
5. Replace every `{{...}}` slot; confirm **no `{{` remains** in the output.
6. Write the result as `travel-guide.html` in the run directory.
