# CLAUDE.md — AI Travel Planner Workflow

This repo implements the assignment in `docs/idea.md` / `docs/ai-travel-planner-requirements.md`:
a model-driven, hub-and-spoke multi-agent workflow, run as the `/plan-trip`
slash command, that turns a free-text travel request into a human-approved,
standalone HTML travel guide.

## Architecture

**Hub**: the orchestrator — the main Claude Code loop running `/plan-trip`
(`.claude/commands/plan-trip.md`). It handles all human interaction
(clarifying questions, approval), maintains the current-artifact-versions map,
and dispatches every sub-agent via the `Task` tool.

**Spokes**: 9 single-responsibility sub-agents in `.claude/agents/`, each
producing exactly one artifact type. No agent ever modifies another agent's
artifact — a rerun always writes a new version (`route.md` → `route-v2.md`).

| Agent | Responsibility | Artifact |
|---|---|---|
| `travel-coordinator` | Execution plan, quality gates, iteration mapping. No travel content. | `execution-plan.md` |
| `route-agent` | Cities, order, durations, rationale | `route.md` |
| `transport-agent` | Transport, transfers, local transport | `transport.md` |
| `accommodation-agent` | Hotels, costs, rationale | `accommodation.md` |
| `activities-agent` | Attractions, duration, family suitability | `activities.md` |
| `food-agent` | Restaurants, local food, dietary constraints | `food.md` |
| `budget-agent` | Aggregated cost breakdown + total | `budget.md` |
| `packing-agent` | Clothing, electronics, docs, meds | `packing.md` |
| `validation-agent` | Quality-gate check → PASS/FAIL + findings | `validation.md` |
| `final-plan-agent` | Merge latest artifacts (no new content) | `final-plan.md` |
| `html-builder-agent` | Standalone HTML (no new content) | `travel-guide.html` |

That's 10 sub-agents + 1 coordinator role (`travel-coordinator` plays both the
planning and iteration-mapping coordinator role — it never produces content).

Dynamic subagent selection happens in `travel-coordinator` Mode A: it reads
`requirements.md` and decides which of the 7 content agents are actually
required and how to group them for parallel execution — the set and grouping
differ per request (see `trips/*/execution-plan.md` for evidence across runs).

## Stages

1. **Requirements** (orchestrator, human-in-the-loop) — via the
   `requirements-interview` skill → `requirements.md`.
2. **Planning** (`travel-coordinator`, Mode A) → `execution-plan.md`.
3. **Parallel planning** — content agents launched in dependency-respecting
   groups (e.g. `route`+`packing` in parallel, then `transport`+`accommodation`+
   `activities`+`food` in parallel once route exists, then `budget` last).
4. **Validation** (`validation-agent`) → `validation.md`, PASS/FAIL per gate.
5. **Targeted iteration** (`travel-coordinator`, Mode B, max 3 rounds) — maps
   each failed gate to the minimal set of agents to rerun; each rerun produces
   a new artifact version (`budget-v2.md`).
6. **Final plan** (`final-plan-agent`) → `final-plan.md`, consolidation only.
7. **Human approval** (orchestrator) → `approval.md`
   (`status: APPROVED` or `CHANGES_REQUESTED`). `CHANGES_REQUESTED` routes back
   to Stage 5 targeted iteration, not a full restart.
8. **HTML generation** (`html-builder-agent`), gated on `approval.md` actually
   showing `status: APPROVED` → `travel-guide.html`.

## Quality gates

Defined per-run by `travel-coordinator` in `execution-plan.md` (numbered
`QG1, QG2, …`), always including budget cap, daily travel-time limit, and
no-duplicate-attractions, plus request-specific gates (accessibility, dietary,
hotel standard, etc.). `validation-agent` checks each gate explicitly with
evidence — never a subjective judgment.

## Skills (`.claude/skills/`)

Reusable capabilities usable at multiple stages, not a sub-agent's job renamed:

- **`requirements-interview`** — structured clarification interview. Used in
  Stage 1 (initial intake) and Stage 7 (turning `CHANGES_REQUESTED` feedback
  into a structured change note).
- **`artifact-validator`** — structural template check (required sections
  present, no placeholders, cross-references resolve) for any artifact file.
  Used after each parallel group, before validation, before the final plan,
  and before HTML generation.

This is distinct from `validation-agent`, which judges the *travel plan*
against domain quality gates, not the *file structure* of an artifact.

## Hooks (`.claude/settings.json`, `.claude/hooks/`)

- **`PreToolUse`** (`pre-write-guard.js`) — two deterministic gates, both
  keyed off the run's `approval.md`:
  1. Freeze rule: blocks `Write`/`Edit` on `final-plan.md` once `approval.md`
     already records `status: APPROVED`. Forces "new version, not silent
     edit" on approved output.
  2. Human-approval gate: blocks `Write` of `travel-guide.html` unless
     `approval.md` exists **and** its current `Status:` field is `APPROVED`.
     This is the enforcement point for "final output generation requires
     explicit, deterministically verified human approval" — the orchestrator
     cannot skip or forget the check, the hook rejects the tool call outright.
- **`PostToolUse`** (`post-write-state.js`) — every time an artifact under
  `trips/<run>/` is written, updates `trips/<run>/workflow-state.json` with
  that artifact's status/version. This is how workflow state is persisted to
  disk from real tool events, not maintained by hand.

## MCP server

`.mcp.json` configures the community **`memory`** MCP server
(`@modelcontextprotocol/server-memory`), backed by
`.claude/memory/workflow-graph.json`. `travel-coordinator` and
`validation-agent` use it (`mcp__memory__*` tools) to record a persistent,
queryable cross-run history: which agents/gates each run used, and which
gates failed for which destinations. This is separate from
`workflow-state.json`, which is per-run resume state.

## Workflow state & resume

Each run directory `trips/<slug>/` contains `workflow-state.json`:

```json
{
  "run": "tuscany-2026-07",
  "steps": {
    "route": { "status": "completed", "artifact": "route.md", "version": 1 },
    "validation": { "status": "failed", "artifact": "validation.md", "version": 1 }
  },
  "iteration_count": 1,
  "retry_limit": 3,
  "updated_at": "2026-07-01T10:00:00.000Z"
}
```

**To resume** a killed/restarted run: run `/plan-trip` again with the same
request (same destination/date → same slug). The orchestrator's Setup step
reads `workflow-state.json` first; any step already `completed`/`passed`/
`approved` is skipped, and execution resumes at the first `pending`/`failed`
step — no completed work is redone.

**Retry limit**: default 3 iterations (Stage 5). If gates are still failing
after 3 rounds, the workflow stops and reports the unresolved failure instead
of proceeding or looping forever.

## Versioning rule

One agent = one responsibility = one artifact. An agent never modifies another
agent's file, and never overwrites its own prior output — reruns always create
`<artifact>-v2.md`, `-v3.md`, etc. The orchestrator tracks the current latest
version per artifact and always passes latest paths downstream.

## Sample runs

`trips/` contains complete sample runs (inputs, all artifacts, and
`workflow-state.json`) demonstrating different scenarios:

- `trips/tuscany-2026-07/` — family road trip, self-drive loop, went through
  a validation failure + targeted iteration (see `-v2`/`-v3` artifacts).
- `trips/minsk-2026-07/` — different destination/shape, multiple iteration
  rounds (`iteration-plan-v1.md`, `food-v3.md`).
- `trips/lisbon-2026-09/` — solo accessible single-city trip, public-transit
  only, no rental car — exercises a different agent mix/emphasis than the
  road-trip runs above.
