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
  reason — when the traveler requests changes.
- **Never overwrite; always version** (`transport.md` → `transport-v2.md`). The
  orchestrator tracks the latest version per artifact and passes latest paths
  downstream.
- **QG-CITE** — every recommendation row in every content artifact carries a
  real `http(s)://` link to its source. (Exceptions: `budget.md` cites source
  artifacts; `packing.md` cites in `## Sources`; `weather.md` cites the
  Open-Meteo method used per stop, not a listing link.)
- **Local currency everywhere** — every cost in every cost-bearing artifact
  (transport, accommodation, activities, food, budget) is quoted in the **trip
  currency**: the destination country's local currency (PLN for Poland, EUR for
  Germany, CZK for Czechia, …). `requirements-formalizer` resolves it (recorded
  as `Trip Currency:` under `## Confirmed`; a multi-country trip uses the
  currency of the country with the most nights) and converts a budget limit the
  traveler stated in another currency, citing the rate. `validator` fails any
  artifact whose costs use a different currency.
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

| Agent                                              | Responsibility                                     | Artifact            |
| -------------------------------------------------- | -------------------------------------------------- | ------------------- |
| `requirements-formalizer`                          | Structured requirements incl. transport mode       | `requirements.md`   |
| `weather`                                          | Per-stop weather outlook via the Open-Meteo MCP    | `weather.md`        |
| `flight-planner` / `train-planner` / `car-planner` | Transport for the chosen mode                      | `transport.md`      |
| `accommodation-planner`                            | Hotels with linked listings, costs, rationale      | `accommodation.md`  |
| `activities-planner`                               | Attractions, duration, suitability                 | `activities.md`     |
| `food-planner`                                     | Restaurants, local food, dietary constraints       | `food.md`           |
| `packing-planner`                                  | Packing checklist, using `weather.md`'s outlook    | `packing.md`        |
| `budget-aggregator`                                | Cost breakdown + total (invents no numbers)        | `budget.md`         |
| `validator`                                        | Quality gates incl. QG-CITE → PASS/FAIL + findings | `validation.md`     |
| `daily-plan-builder`                               | Merge latest artifacts (no new content)            | `daily-plan.md`     |
| `html-builder`                                     | Fill the predefined HTML template (no new content) | `travel-guide.html` |

**Pipeline:** `requirements` → `execution-plan` → `transport` + `weather` →
`accommodation`/`activities`/`food` → `packing` + `budget` → `validation` →
(versioned reruns until PASS, max 3) → `daily-plan` (draft) → traveler
approval flips it to `documentStatus: approved` → `travel-guide.html`.
`weather` needs only a confirmed destination from `requirements`, so it runs
alongside the transport planner. `packing` runs only after `weather`,
`accommodation`/`activities` (and, for a car trip, `transport`) since their
content shapes what to pack.

## Where things live

Link to these — don't copy their content here (copies drift out of sync).

- **Operational procedure** (all stages, authoritative) → `.claude/commands/plan-trip.md`
- **Quality gates** (defined per-run) → the run's `execution-plan.md`
- **Artifact formats** → each agent definition in `.claude/agents/`
- **Sample runs** → `trips/` (see `trips/README.md`). **Caveat:** the committed
  samples predate the current roster (they use the retired `route.md` /
  `final-plan.md` artifacts and `-agent` sub-agent names) — treat them as
  historical, not as templates for the current artifact set.
- **Tooling / MCP** → `open-meteo` (`.mcp.json`; no key), called exclusively by
  the **`weather`** sub-agent, which writes its outlook to
  `weather.md`; `packing-planner` and `daily-plan-builder` read that file as
  an input artifact and never call the weather API themselves. `html-builder`
  sources the guide's hero/background images at build time via **WebSearch**
  (Wikimedia Commons preferred), downloads them, and embeds them as base64
  `data:` URIs — no image-generation API involved. Content agents source real
  pages via **WebSearch/WebFetch** for reviews/listings.

## Enforcement (hooks — `.claude/hooks/`)

**One hook = one responsibility.** Each invariant that must be deterministic
(rather than trusting the orchestrator to remember it) lives in its own hook.
Shared frontmatter parsing lives in `lib/frontmatter.js`.

| Hook                     | Event                 | Single responsibility                                                                                                                                                                                                                                                             |
| ------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `approval-gate-guard.js` | `PreToolUse` (Write)  | **Approval gate** — block Write of `travel-guide.html` unless the latest `daily-plan(-vN).md` in the run records `documentStatus: approved`.                                                                                                                                      |
| `no-leak-guard.js`       | `PreToolUse` (Write)  | **No-leak gate** — block Write of `travel-guide.html` whose content names any internal workflow artifact (`validation.md`, `transport.md`, …), so a stray "(flagged in validation.md)" can never reach the published guide.                                                       |
| `post-write-state.js`    | `PostToolUse` (Write) | **State sync** — keep `workflow-state.json` in step/version sync on every tracked artifact write, reading lifecycle status from the artifact's frontmatter. The orchestrator hand-maintains only `iteration_count`. Recognizes validation PASS/FAIL status from artifact content. |
