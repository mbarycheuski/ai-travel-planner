# AI Travel Planner — Multi-Agent Workflow

A Claude Code multi-agent workflow that turns a free-text travel request into a
human-approved, standalone HTML travel guide. It demonstrates human-in-the-loop
interaction, coordinator-based orchestration, parallel + sequential execution,
artifact-based communication, dynamic planning, quality gates, targeted
iteration, and human approval before final output.

## Setup (clean checkout)

1. Requirements: Claude Code, and Node.js on `PATH` (used by the project hooks
   and by `npx` to launch the MCP server — no install step needed, `npx`
   fetches it on first use).
2. Clone/open this repo in Claude Code from its root — no build step, no
   `npm install`. `.claude/settings.json` and `.mcp.json` are picked up
   automatically at the project level.
3. Run `/plan-trip <your request>` (see below).

## Run it

```
/plan-trip Plan a 5-day family road trip in Tuscany for 2 adults + 2 kids
(6, 9), land in Florence, ~€2,500 total excl. flights, mix of culture +
outdoor, 3-star+ hotels with parking, ≤2.5h driving/day.
```

The orchestrator (the `/plan-trip` command running in the main Claude loop) will
ask any clarifying questions, dispatch the agent team, run validation + iteration,
ask you to approve the final plan, and then build the HTML guide.

## Resume after an interruption

Run `/plan-trip` again with a request that yields the **same run slug**
(same destination + month, e.g. `trips/tuscany-2026-07`). The orchestrator
reads `trips/<slug>/workflow-state.json` first and skips every step already
marked `completed`/`passed`/`approved`, resuming at the first
`pending`/`failed` step — no finished work is redone. See `CLAUDE.md` for the
state file's structure.

## How it works

The **orchestrator** handles all human interaction (requirements clarification
and final approval) because subagents run non-interactively. The **content
agents** are background workers that read and write **artifacts on disk** — no
agent ever modifies another agent's file; reruns produce new versions
(`route.md` → `route-v2.md`).

### Agent roster (`.claude/agents/`)

| Agent | Responsibility | Artifact |
|-------|----------------|----------|
| `travel-coordinator` | Execution strategy, quality gates, iteration mapping (no content) | `execution-plan.md` |
| `route-agent` | Cities, order, durations, rationale | `route.md` |
| `transport-agent` | Transport, transfers, local transport | `transport.md` |
| `accommodation-agent` | Hotels, costs, rationale | `accommodation.md` |
| `activities-agent` | Attractions, duration, family suitability | `activities.md` |
| `food-agent` | Restaurants, local food (honors diet) | `food.md` |
| `budget-agent` | Aggregated cost breakdown + total | `budget.md` |
| `packing-agent` | Clothing, electronics, docs, meds | `packing.md` |
| `validation-agent` | Quality-gate check → PASS/FAIL + findings | `validation.md` |
| `final-plan-agent` | Merge latest artifacts (no new content) | `final-plan.md` |
| `html-builder-agent` | Standalone HTML (no new content) | `travel-guide.html` |

Content agents use live web search for real hotels, routes, prices, and
attractions, and cite sources inline.

### Artifact flow

```
requirements.md → execution-plan.md → route/transport/accommodation/
activities/food/budget/packing.md → validation.md → (versioned reruns until
PASS) → final-plan.md → approval.md → travel-guide.html
```

### Skills (`.claude/skills/`)

Two reusable skills, invoked by the orchestrator at multiple stages (not tied
to one sub-agent):

- `requirements-interview` — structured clarification interview (Stage 1
  intake, and Stage 7 change-request capture).
- `artifact-validator` — structural template check for any artifact (required
  sections present, no placeholders) run after each parallel group and before
  the final plan / HTML generation.

### Hooks (`.claude/settings.json`)

- `PreToolUse` blocks edits to an already-approved `final-plan.md` /
  `travel-guide.html`.
- `PostToolUse` updates `trips/<slug>/workflow-state.json` whenever an
  artifact is written, so state is persisted to disk automatically.

### MCP server

`.mcp.json` configures the `memory` MCP server, used by `travel-coordinator`
and `validation-agent` to keep a queryable cross-run history (which gates
failed for which destinations, across runs).

See `CLAUDE.md` for full architecture details.

## Outputs

Each run is isolated under `trips/<destination>-<date>/`, including its
`workflow-state.json`. Sample runs are committed to the repo on purpose (see
`trips/tuscany-2026-07/`, `trips/minsk-2026-07/`, `trips/lisbon-2026-09/`) to
demonstrate the workflow across different scenarios.
