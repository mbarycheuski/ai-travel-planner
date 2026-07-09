# Execution Plan — Tuscany 2026-07 Trip

## Agents Required
- **route** — 5-day loop from/to Florence, driving legs ≤2.5h/day
- **transport** — rental car + fuel logistics/cost, tied to route legs
- **accommodation** — 3★+ hotels with on-site parking, one per stop on route
- **activities** — kid-friendly + culture/outdoor balance, paced per day
- **food** — vegetarian-friendly dinner options per town
- **budget** — aggregate cost vs €2,500 cap (incl. car + fuel)
- **packing** — summer season, family with young kids

All seven are justified by the requirements; none are skippable.

## Execution Groups

**Group A (no dependencies, parallel)**
- `route` — defines the loop and daily driving legs
- `packing` — depends only on destination/season, independent of route detail

**Group B (depends on Group A: route, parallel among themselves)**
- `transport` — needs route legs/distances to compute car + fuel cost and driving time
- `accommodation` — needs route stops to place hotels
- `activities` — needs route stops/day structure to assign daily activities
- `food` — needs route stops (towns) to find vegetarian dinner options per town

**Group C (depends on Group B, all of it)**
- `budget` — aggregates transport + accommodation + activities + food costs against the €2,500 cap

## Quality Gates

- **QG1 — Budget cap**: Total cost (rental car + fuel + hotels + activities + food estimates) ≤ €2,500.
- **QG2 — Daily driving limit**: Each day's driving time ≤ 2.5h per the route/transport plan.
- **QG3 — Daily kid activity**: Every day has ≥1 kid-friendly activity.
- **QG4 — Hotel standard**: Every hotel is 3★ or higher AND has on-site parking.
- **QG5 — Vegetarian dinner coverage**: Every town on the itinerary has ≥1 vegetarian-friendly dinner option.
- **QG6 — No duplicate attractions**: No attraction/activity is repeated across days.
- **QG7 — No unresolved placeholders**: No TBD/TODO/placeholder text in any final artifact.

## Iteration Strategy
(Max iterations per gate: **3**; if unresolved after 3 rounds, escalate to user with the gap.)

| Gate | On Failure, Rerun |
|---|---|
| QG1 (budget) | `budget` (recompute) + whichever of `transport`/`accommodation`/`activities`/`food` is the largest cost driver, to reduce spend |
| QG2 (driving time) | `route` + `transport` (re-sequence stops/legs), then `activities` if day structure shifts |
| QG3 (kid activity/day) | `activities` only |
| QG4 (hotel standard) | `accommodation` only |
| QG5 (vegetarian dinner) | `food` only |
| QG6 (duplicate attractions) | `activities` only |
| QG7 (placeholders) | the specific agent(s) whose artifact contains the placeholder |

General rule: rerun the **minimal** set of agents whose output caused the failure; do not rerun agents whose gates passed. If a rerun changes route/day structure, downstream Group B/C agents affected by that change must also rerun in the next iteration.
