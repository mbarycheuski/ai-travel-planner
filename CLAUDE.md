# CLAUDE.md — AI Travel Planner Workflow

A hub-and-spoke multi-agent workflow, run as the `/plan-trip` slash command,
that turns a free-text travel request into a human-approved HTML travel guide.

**Read [`docs/ai-travel-planner.md`](docs/ai-travel-planner.md) for the
architecture, sub-agents, stages, and flow.** This file only states how to work
in the repo — don't duplicate the workflow description here.

## Rules (non-negotiable)

- **One agent = one responsibility = one artifact.** Never make an agent write
  or edit another agent's artifact.
- **Never overwrite; always version** (`transport.md` → `transport-v2.md`). The
  `-vN` suffix is the only version marker — add no `version` frontmatter. The
  only frontmatter in the workflow is the daily plan's `documentStatus`
  (`draft` | `approved` | `rejected`, plus a `reason:` line when rejected).
- **`QG-CITE`** — every recommendation row carries a real `http(s)://` source
  link (exceptions: `budget.md`, `packing.md`'s `## Sources`, `weather.md`'s
  per-stop method).
- **Local currency everywhere** — every cost uses the trip currency, resolved
  by `requirements-formalizer`. `validator` fails any artifact that doesn't.
- **Approval before HTML** — generate `travel-guide.html` only after the latest
  daily plan records `documentStatus: approved` (value exactly `approved`,
  case-insensitive). Enforced by the hook.
- **Orchestrator produces no travel content** — only coordination artifacts and
  human interaction (`AskUserQuestion`). Sub-agents run non-interactively and
  communicate only through files on disk.
- **No internal-artifact leakage** — the daily plan and published HTML must
  never name an internal workflow file (`validation.md`, `transport.md`, …).
  Facts flow through; filenames do not.
- **Failures stop, they don't silently pass** — iteration retries the minimal
  affected agent set, capped at **3** rounds; on exhaustion, stop and report the
  unresolved failure rather than proceeding.

## Working in the repo

- **Everything for a run lives under `trips/<slug>/`**, where `<slug>` is
  `destination-YYYY-MM` (same destination + month → same slug → resume). Write
  artifacts there and nowhere else — the hooks only fire on `trips/**` writes
  and on `travel-guide.html`.
- **Resume from `trips/<slug>/workflow-state.json`.** It tracks `run`,
  `iteration_count`, and a `steps` map of `{ status, artifact, version }` per
  step (statuses: `pending` / `in_progress` / `completed` / `passed` /
  `failed`). Skip any step already `completed`/`passed`/`approved`; resume at
  the first `pending`/`failed`. The `post-write-state.js` hook maintains this on
  every write; only `iteration_count` is hand-maintained by the orchestrator.
- **Don't edit hook output by hand** — let `post-write-state.js` sync state;
  edit `workflow-state.json` directly only to fix drift.

## Where things live

- **Operational procedure** (all stages, authoritative) →
  `.claude/commands/plan-trip.md`
- **Artifact formats** → each agent definition in `.claude/agents/`
- **Quality gates** (defined per-run) → the run's `execution-plan.md`
- **Enforcement** → `.claude/hooks/` (shared parsing in `lib/frontmatter.js`,
  I/O in `lib/hook-io.js`); wired in `.claude/settings.json`; one hook = one
  responsibility.
- **Sample runs** → `trips/krakow-2026-07/` (happy path) and
  `trips/zakopane-2026-07/` (a validation-driven iteration, with `-v2`
  artifacts and `iteration-plan-v1.md`). Both use the current roster and are
  good references for artifact shape.
