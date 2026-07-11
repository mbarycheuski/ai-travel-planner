# AI Travel Planner — Multi-Agent Workflow

A Claude Code multi-agent workflow that turns a free-text travel request into a
human-approved, standalone HTML travel guide. It demonstrates human-in-the-loop
interaction, coordinator-based orchestration, parallel + sequential execution,
artifact-based communication, dynamic planning (including dynamic sub-agent
selection), quality gates, targeted iteration, and human approval before final
output. Every recommendation in every artifact carries a link to its real
source page (hotel listing, attraction page, restaurant, operator).

## Setup (clean checkout)

Prerequisites:

1. **Claude Code** and **Node.js ≥ 22** on `PATH` (used by the project hooks
   and by `npx` to launch the `open-meteo` MCP server — no install step, `npx`
   fetches it on first use).

Then: clone/open this repo in Claude Code from its root — no build step, no
`npm install`. `.claude/settings.json` and `.mcp.json` are picked up
automatically at the project level. On first use, Claude Code will ask you to
approve the project MCP server (`open-meteo`) — approve it.

## Run it

```
/plan-trip Plan a 5-day trip to Lisbon for a family (2 adults, 2 kids).
Departure from Warsaw on August 1, 2026.
```

The orchestrator (the `/plan-trip` command running in the main Claude loop)
will ask any clarifying questions (including transport mode — flight, train,
or car — which decides which transport planner runs), dispatch the agent team,
run validation + targeted iteration, ask you to approve the daily plan, and
then build the HTML guide from the predefined template.

More examples:

```
/plan-trip Warsaw → Vienna city break by train, 4 days in October, 2 adults,
mid-range budget, vegetarian-friendly.
```

```
/plan-trip One-week self-drive loop through Tuscany in July for 2 adults +
2 kids, land in Florence, ≤2.5h driving/day, €2,500 excl. flights.
```

## Resume after an interruption

Run `/plan-trip` again with a request that yields the **same run slug**
(same destination + month, e.g. `trips/lisbon-2026-08`). The orchestrator
reads `trips/<slug>/workflow-state.json` first and skips every step already
marked `completed`/`passed`/`approved`, resuming at the first
`pending`/`failed` step — no finished work is redone. See `CLAUDE.md` for the
state file's structure.

## How it works

The **orchestrator** plays the coordinator role: it's the only thing that can
interact with the human (clarifying questions and final approval, via
`AskUserQuestion` — sub-agents run non-interactively), and it makes the
coordination decisions itself — writing the execution strategy, quality
gates, and iteration mapping to `execution-plan.md` / `iteration-plan-vN.md`
(never travel content). The **content agents** are background workers that
read and write **artifacts on disk** — no agent ever modifies another agent's
file; reruns produce new versions (`transport.md` → `transport-v2.md`). Every
agent definition embeds the strict format of its artifact (required headers +
table columns, including a mandatory `Link` column on recommendation tables).

### Agent roster (`.claude/agents/`)

| Agent                     | Responsibility                                                                                                    | Artifact            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- |
| `requirements-formalizer` | Formalizes the orchestrator's Q&A into structured requirements (incl. transport mode) — can't ask the user itself | `requirements.md`   |
| `flight-planner`          | Flights + stops + local transport (runs when mode = flight)                                                       | `transport.md`      |
| `train-planner`           | Rail legs + stops + local transport (runs when mode = train)                                                      | `transport.md`      |
| `car-planner`             | Driving route + stops + fuel/tolls/parking (runs when mode = car)                                                 | `transport.md`      |
| `accommodation-planner`   | Hotels with linked listings, costs, rationale                                                                     | `accommodation.md`  |
| `activities-planner`      | Attractions via live web search, duration, suitability                                                            | `activities.md`     |
| `food-planner`            | Restaurants, local food (honors diet)                                                                             | `food.md`           |
| `packing-planner`         | Weather outlook (Open-Meteo MCP) + packing checklist                                                              | `packing.md`        |
| `budget-aggregator`       | Aggregated cost breakdown + total                                                                                 | `budget.md`         |
| `validator`               | Quality-gate check incl. citations → PASS/FAIL + findings                                                         | `validation.md`     |
| `daily-plan-builder`      | Merge latest artifacts into a day-by-day plan (no new content)                                                    | `daily-plan.md`     |
| `html-builder`            | Fill the predefined HTML template (no new content)                                                                | `travel-guide.html` |

**Exactly one** of the three transport planners runs per trip, selected by the
orchestrator (in `execution-plan.md`) from the confirmed transport mode — the workflow's clearest
dynamic-subagent-selection point. All three share one `transport.md` schema
whose `## Stops & Nights` section owns the trip's stop structure.

### Artifact flow

```
requirements.md → execution-plan.md → transport.md + packing.md →
accommodation/activities/food.md → budget.md → validation.md →
(versioned reruns until PASS, max 3) → daily-plan.md (draft) →
traveler approval flips it to documentStatus: approved → travel-guide.html
```

Versioning is tracked by the `-vN` filename suffix alone — artifacts carry no
`version` frontmatter. The only frontmatter is the daily plan's
`documentStatus` (`draft` | `approved` | `rejected`, plus a `reason:` line when
`rejected`). There is no separate `approval.md`: approval is recorded by
setting `documentStatus: approved` on the daily plan itself (or `rejected`,
with the reason, on a change request).

### Skills (`.claude/skills/`)

Two reusable skills, invoked by the orchestrator/agents at multiple stages
(not tied to one sub-agent):

- `artifact-validator` — structural template check for any artifact (required
  sections, no placeholders, **citation coverage**) run after each parallel
  group and before the daily plan / HTML generation.
- `trip-html-theme-builder` — HTML rendering rules + the predefined
  `assets/template.html` that `html-builder` fills in, keeping the guide's
  structure identical across runs (only theme tokens vary per trip).

### Hooks (`.claude/settings.json`)

Each hook has a single responsibility:

- `approval-gate-guard.js` (`PreToolUse`) blocks writing `travel-guide.html`
  unless the latest daily plan records `documentStatus: approved` (the
  deterministic human-approval gate).
- `no-leak-guard.js` (`PreToolUse`) blocks writing `travel-guide.html` that
  names any internal workflow artifact.
- `post-write-state.js` (`PostToolUse`) updates
  `trips/<slug>/workflow-state.json` whenever an artifact is written, so state
  is persisted to disk automatically.

### MCP servers & plugins

- `open-meteo` (`.mcp.json`) — weather forecasts/climate (no key); used by
  `packing-planner` and `daily-plan-builder`.

`accommodation-planner`, `activities-planner`, and `food-planner` source real
listings, attractions, and restaurants via live `WebSearch`/`WebFetch` rather
than an MCP server. `html-builder` finds the guide's hero and background
photos the same way — via `WebSearch` (Wikimedia Commons preferred) — then
downloads and embeds them.

See `CLAUDE.md` for full architecture details.

## Outputs

Each run is isolated under `trips/<destination>-<date>/`, including its
`workflow-state.json`. Sample runs are committed to the repo on purpose (see
`trips/tuscany-2026-07/`, `trips/minsk-2026-07/`) to demonstrate the workflow
across different scenarios. (These predate the latest restructure and use the
older artifact names — see the note in `CLAUDE.md`.)

## Secrets

No credentials are committed. The `open-meteo` MCP server needs no key, and
all content and image sourcing uses plain `WebSearch`/`WebFetch`. If
`html-builder` can't find or download a usable hero/background photo, it
falls back to `none` and the guide renders cleanly with its plain themed
header/background.
