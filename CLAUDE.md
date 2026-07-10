# CLAUDE.md — AI Travel Planner Workflow

A hub-and-spoke multi-agent workflow (spec: `docs/ai-travel-planner-requirements.md`),
run as the `/plan-trip` slash command, that turns a free-text travel request
into a human-approved, standalone HTML travel guide. Re-running with the same
request (same destination + month → same slug) **resumes** from
`trips/<slug>/workflow-state.json` rather than restarting.

## Invariants (non-negotiable)

- **One agent = one responsibility = one artifact.** An agent never writes
  another agent's artifact.
- **Frontmatter only where it carries state.** Versioning is tracked by the
  `-vN` filename suffix alone — artifacts carry **no `version` frontmatter**.
  The only frontmatter in the workflow is the **daily plan's** `documentStatus`
  (one of `draft`, `approved`, `rejected`). `draft` is the default working
  state; `approved` is set by the orchestrator after human approval (Stage 7);
  `rejected` — with a `reason:` line capturing the traveler's rejection
  reason — when the traveler requests changes. Both `approved` and `rejected`
  are **frozen** (see freeze rule + **Enforcement**).
- **Never overwrite; always version** (`transport.md` → `transport-v2.md`). The
  orchestrator tracks the latest version per artifact and passes latest paths
  downstream.
- **QG-CITE** — every recommendation row in every content artifact carries a
  real `http(s)://` link to its source. (Exceptions: `budget.md` cites source
  artifacts; `packing.md` cites in `## Sources`.)
- **Approval before HTML** — `travel-guide.html` is generated only after the
  latest daily-plan artifact records `documentStatus: approved` in its
  frontmatter (enforced by the hook — see **Enforcement** below). There is no
  separate `approval.md`; approval is a property of the daily plan itself. The
  value must be exactly `approved` (case-insensitive); any other status leaves
  the gate un-triggered.
- **Orchestrator produces no travel content** — only coordination artifacts
  and human interaction (`AskUserQuestion`). Sub-agents run non-interactively
  and communicate only through files on disk.
- **Exactly one transport planner per trip**, chosen from the confirmed mode;
  all three write the same `transport.md` schema.
- **No internal-artifact leakage in user-facing output** — the daily plan and
  the published `travel-guide.html` are for the traveler and must never name an
  internal workflow file (`validation.md`, `requirements.md`, `transport.md`,
  `budget.md`, etc.). Facts flow through; filenames do not. `daily-plan-builder`
  strips such references during consolidation, and the hook blocks the HTML
  write if any survive (see **Enforcement**).

## Agent roster (`.claude/agents/`)

| Agent | Responsibility | Artifact |
|---|---|---|
| `requirements-interviewer` | Structured requirements incl. transport mode | `requirements.md` |
| `flight-planner` / `train-planner` / `car-planner` | Transport for the chosen mode | `transport.md` |
| `accommodation-planner` | Hotels with linked listings, costs, rationale | `accommodation.md` |
| `activities-planner` | Attractions, duration, suitability | `activities.md` |
| `food-planner` | Restaurants, local food, dietary constraints | `food.md` |
| `packing-planner` | Weather outlook + packing checklist | `packing.md` |
| `budget-aggregator` | Cost breakdown + total (invents no numbers) | `budget.md` |
| `validator` | Quality gates incl. QG-CITE → PASS/FAIL + findings | `validation.md` |
| `daily-plan-builder` | Merge latest artifacts (no new content) | `daily-plan.md` |
| `html-builder` | Fill the predefined HTML template (no new content) | `travel-guide.html` |

**Pipeline:** `requirements` → `execution-plan` → `transport` + `packing` →
`accommodation`/`activities`/`food` → `budget` → `validation` → (versioned
reruns until PASS, max 3) → `daily-plan` (draft) → traveler approval flips it
to `documentStatus: approved` → `travel-guide.html`.

## Where things live

Link to these — don't copy their content here (copies drift out of sync).

- **Operational procedure** (all stages, authoritative) → `.claude/commands/plan-trip.md`
- **Quality gates** (defined per-run) → the run's `execution-plan.md`
- **Artifact formats** → each agent definition in `.claude/agents/`
- **Sample runs** → `trips/` (see `trips/README.md`). **Caveat:** the committed
  samples predate the current roster (they use the retired `route.md` /
  `final-plan.md` artifacts and `-agent` sub-agent names) — treat them as
  historical, not as templates for the current artifact set.
- **Tooling / MCP** → `open-meteo` (`.mcp.json`; weather for
  `packing`/`daily-plan`, no key). `html-builder` sources the guide's
  hero/background images at build time via **WebSearch** (Wikimedia Commons
  preferred), downloads them, and embeds them as base64 `data:` URIs — no
  image-generation API involved. Content agents source real pages via
  **WebSearch/WebFetch** — **not TripAdvisor's MCP** (use WebSearch/WebFetch
  for reviews/listings instead).

## Enforcement (hooks — `.claude/hooks/`)

**One hook = one responsibility.** Each invariant that must be deterministic
(rather than trusting the orchestrator to remember it) lives in its own hook.
Shared frontmatter parsing lives in `lib/frontmatter.js`.

| Hook | Event | Single responsibility |
|---|---|---|
| `freeze-finished-guard.js` | `PreToolUse` (Write\|Edit) | **Freeze rule** — block any Write/Edit of the daily plan whose on-disk `documentStatus` is `approved` or `rejected`. Change goes into a new version (`daily-plan-v2.md`, `documentStatus: draft`) instead. The write that *first* flips a doc to approved/rejected is allowed (on disk it is still a draft at that moment); only later edits are blocked. Every other artifact has no `documentStatus`, and `travel-guide.html` has no frontmatter, so both are naturally exempt. |
| `approval-gate-guard.js` | `PreToolUse` (Write) | **Approval gate** — block Write of `travel-guide.html` unless the latest `daily-plan(-vN).md` in the run records `documentStatus: approved`. |
| `no-leak-guard.js` | `PreToolUse` (Write) | **No-leak gate** — block Write of `travel-guide.html` whose content names any internal workflow artifact (`validation.md`, `transport.md`, …), so a stray "(flagged in validation.md)" can never reach the published guide. |
| `post-write-state.js` | `PostToolUse` (Write) | **State sync** — keep `workflow-state.json` in step/version sync on every tracked artifact write, reading lifecycle status from the artifact's frontmatter. The orchestrator hand-maintains only `iteration_count`. |
