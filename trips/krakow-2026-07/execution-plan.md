# Execution Plan

## Agents Required

- `car-planner` — confirmed transport mode is CAR (Warsaw → Kraków, single direct leg)
- `weather` — Destination Status is confirmed (Kraków, Poland), so weather runs immediately
- `accommodation-planner` — 4-star+ hotel required
- `activities-planner` — history/culture/interactive-outdoor mix for school-age kids
- `food-planner` — restaurants for the family, no dietary constraints
- `packing-planner` — deferred to Group 3 (needs weather.md, activities.md, accommodation.md, transport.md)
- `budget-aggregator` — hard cap $1,000-1,500 total
- `validator` — always runs
- `daily-plan-builder` — always runs
- `html-builder` — always runs (after approval)

## Execution Groups

- **Group 1** (parallel): `car-planner`, `weather` — both need only `requirements.md`.
- **Group 2** (parallel): `accommodation-planner`, `activities-planner`, `food-planner` — each needs `transport.md`'s `## Stops & Nights` (Kraków, 1 night) from Group 1.
- **Group 3** (parallel): `packing-planner`, `budget-aggregator` — mutually independent.
  - `packing-planner` needs `weather.md`, `activities.md`, `accommodation.md`, and `transport.md` (car trip).
  - `budget-aggregator` needs `transport.md`, `accommodation.md`, `activities.md`, `food.md` (all cost-bearing artifacts).
- **Group 4**: `validator` — needs the full latest artifact set from Groups 1-3 plus `requirements.md` and `execution-plan.md`.
- **Group 5**: `daily-plan-builder` — needs the full validated (PASS) artifact set including `weather.md`.
- **Group 6**: `html-builder` — needs the latest `daily-plan(-vN).md` with `documentStatus: approved`.

## Quality Gates

- **QG1 — Budget cap**: `budget.md` total (with contingency) ≤ $1,500.
- **QG2 — Daily travel time**: driving legs match the "single direct leg, no intermediate stops" constraint; no unplanned multi-stop routing on the Warsaw-Kraków leg.
- **QG3 — No duplicate attractions**: no attraction/activity listed more than once across `activities.md` (and not duplicated into `food.md`).
- **QG4 — Transport mode match**: `transport.md` is authored by `car-planner` and describes car travel only (no flights/trains).
- **QG-CITE**: every recommendation row in every content artifact (`accommodation.md`, `activities.md`, `food.md`, `transport.md`) carries a real `http(s)://` source link; `budget.md` cites source artifacts; `packing.md` cites in `## Sources`; `weather.md` cites the Open-Meteo method used.
- **QG5 — Hotel standard**: every accommodation option in `accommodation.md` is rated 4-star or higher.
- **QG6 — Family/accessibility suitability**: activities in `activities.md` are suitable for school-age children (7-12); no accessibility constraints to violate (none required).
- **QG7 — Dietary**: no dietary constraints to accommodate (trivially satisfied — no exclusions needed in `food.md`).

## Iteration Strategy

- QG1 fails → rerun `budget-aggregator` after checking whether `accommodation-planner`, `activities-planner`, or `food-planner` need cost-reducing reruns; rerun the highest-cost offending agent(s) first, then `budget-aggregator`.
- QG2 fails → rerun `car-planner` only.
- QG3 fails → rerun `activities-planner` (and `food-planner` only if the duplicate crosses into food listings).
- QG4 fails → rerun `car-planner` (should not occur; mode is fixed).
- QG-CITE fails → rerun only the specific agent(s) whose artifact has missing/broken citations.
- QG5 fails → rerun `accommodation-planner` only.
- QG6 fails → rerun `activities-planner` only.
- QG7 fails → rerun `food-planner` only (not expected to trigger).
- Any rerun that changes a cost-bearing artifact requires a `budget-aggregator` rerun downstream, and any rerun that changes `weather.md`/`activities.md`/`accommodation.md`/`transport.md` requires a `packing-planner` rerun downstream.
- Max iterations: 3.
